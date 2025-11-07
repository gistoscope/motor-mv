param(
  [int]$Port = 4001,
  [string]$Page = "/public/index.s6.3.html"
)

$repo = "D:\work\motor-mv"
$ErrorActionPreference = "SilentlyContinue"

# 1) Проверим, слушает ли уже кто-то порт и отвечает ли сервер
$tcp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$serverReady = $false
if ($tcp) {
  try {
    $resp = Invoke-WebRequest -UseBasicParsing "http://localhost:$Port/public/index.s6.3.html?ping=$(Get-Random)" -TimeoutSec 1
    if ($resp.StatusCode -eq 200) { $serverReady = $true }
  } catch {}
}

# 2) Если сервер не готов — освободим порт (если висит) и поднимем новый Server-оконный процесс
if (-not $serverReady) {
  if ($tcp) { try { Stop-Process -Id $tcp.OwningProcess -Force } catch {} }
  $serverCmd = "cd $repo; node packages\micro-viewer\server.mjs --port $Port"
  Start-Process powershell -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command",$serverCmd | Out-Null
  Start-Sleep -Seconds 1
}

# 3) Откроем правильную страницу с анти-кэшем
$stamp = Get-Date -Format yyyyMMddHHmmss
$target = "http://localhost:$Port$Page?nocache=$stamp"
Start-Process $target | Out-Null