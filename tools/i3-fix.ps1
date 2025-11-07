# I3 fix: restore classify gating + make adapter.request synchronous
param(
  [string]$Repo = "D:\work\motor-mv"
)

$ErrorActionPreference = "Stop"
$target = Join-Path $Repo "packages\micro-viewer\src\app.s6.3.js"
$bak    = "$target.bak.i3fix"

if (-not (Test-Path $target)) {
  Write-Host "Target not found: $target" -ForegroundColor Red
  exit 2
}

# Backup once
if (-not (Test-Path $bak)) {
  Copy-Item -Force $target $bak
  Write-Host "Backup created: $bak" -ForegroundColor Yellow
}

$content = Get-Content -Raw -Encoding UTF8 $target

$startMarker = "/* I3-ADAPTER-INLINE"
$endMarker   = "/* END I3-ADAPTER-INLINE */"

$start = $content.IndexOf($startMarker)
$end   = $content.IndexOf($endMarker)

if ($start -lt 0 -or $end -lt 0) {
  Write-Host "I3 inline block not found; nothing to fix." -ForegroundColor Yellow
  exit 0
}

$end += $endMarker.Length

$prefix = $content.Substring(0, $start)
$suffix = $content.Substring($end)

$fixed = @"
/* I3-ADAPTER-INLINE: in-process adapter bridge (fixed classify + sync request) */
function i3_createEngineAdapter(o){
  if(!o||typeof o.port!=='object') throw new Error('i3_createEngineAdapter: port required');
  return {
    request(i){ return o.port.request(i); }, // sync to match current S6.3 usage
    classify(i){ return (typeof o.port.classify==='function') ? o.port.classify(i) : ({status:'noop'}); }
  };
}
function i3_makeInprocPort(handler){
  if(typeof handler!=='function') throw new Error('i3_makeInprocPort: handler required');
  return {
    request(i){ return handler(i); },
    classify(i){ return { status:'noop' }; }
  };
}
const i3_adapter = i3_createEngineAdapter({
  port: {
    request(intent){
      if (intent && intent.type === 'click-paren') {
        const pair = intent.pair;
        const resp = engineStub.request({ type:'click-paren', pair, text:intent.text });
        return { id: intent.id || 'i3', ok: !!(resp && resp.ok), decision: (resp && resp.ok) ? 'transform' : 'blocked', patches: (resp && resp.patches) || [] };
      }
      return { id: intent && intent.id || 'i3', ok: true, decision: 'noop', patches: [] };
    },
    classify(intent){
      // delegate to original stub for gating/colouring
      if (intent && (intent.role === 'paren' || intent.type === 'click-paren')) {
        return engineStub.classify({ role:'paren', pair:intent.pair, text:intent.text });
      }
      return { status:'noop' };
    }
  }
});
/* END I3-ADAPTER-INLINE */
"@

$new = $prefix + $fixed + $suffix
Set-Content -Encoding UTF8 -NoNewline -Path $target -Value $new
Write-Host "Patched app.s6.3.js inline adapter: sync request + delegated classify" -ForegroundColor Green