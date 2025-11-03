// Public demo app logic for S3 demo page
function normalize(latex) {
  return (latex || "").replace(/\\/g, "\\").replace(/\n/g, " ");
}

function renderNow() {
  const expr = document.getElementById('expr');
  const out  = document.getElementById('katexOut');
  const diag = document.getElementById('diag');
  if (!out || !diag) return;

  diag.textContent = "";
  out.innerHTML = "";

  if (typeof window.katex === "undefined") {
    diag.textContent = "KaTeX runtime not loaded.";
    return;
  }
  const latex = normalize(expr && expr.value);
  try {
    window.katex.render(latex, out, { throwOnError: false });
  } catch (e) {
    diag.textContent = (e && e.message) ? e.message : String(e);
  }

  // Bind a basic bracket highlight (DOM-level) just for the demo.
  // It pairs .mopen/.mclose with a simple stack.
  const kroot = out.querySelector('.katex');
  if (!kroot) return;
  const spans = Array.from(kroot.querySelectorAll('.mopen, .mclose'));
  const stack = [];
  const pairs = [];
  for (const el of spans) {
    if (el.classList.contains('mopen')) stack.push(el);
    else { const open = stack.pop(); if (open) pairs.push([open, el]); }
  }
  const map = new Map();
  for (const [a,b] of pairs) { map.set(a,b); map.set(b,a); }
  function clear() { out.querySelectorAll('.mv-bracket-active').forEach(e => e.classList.remove('mv-bracket-active')); }
  function setActive(el) { clear(); if (!el) return; const other = map.get(el); if (other) { el.classList.add('mv-bracket-active'); other.classList.add('mv-bracket-active'); } }
  for (const el of map.keys()) {
    el.addEventListener('mouseenter', () => setActive(el));
    el.addEventListener('click', () => setActive(el));
  }
  out.addEventListener('keydown', (e) => { if (e.key === 'Escape') clear(); }, { once: true });
}

function applyOptionsToPage() {
  const theme = document.getElementById('optTheme').value;
  const density = document.getElementById('optDensity').value;
  const scale = parseFloat(document.getElementById('optScale').value || '1');
  document.body.dataset.theme = theme;
  document.body.dataset.density = density;
  document.body.style.setProperty('--mv-font-scale', String(scale));
  document.getElementById('scaleVal').textContent = scale.toFixed(2);
}

function ready(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(fn, 0);
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }
}

ready(() => {
  document.getElementById('renderBtn')?.addEventListener('click', renderNow);
  const expr = document.getElementById('expr');
  if (expr) {
    let t = 0;
    expr.addEventListener('input', () => { clearTimeout(t); t = setTimeout(renderNow, 120); });
  }

  // Options wiring
  ['optTheme','optDensity','optScale'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', applyOptionsToPage);
    document.getElementById(id)?.addEventListener('change', applyOptionsToPage);
  });
  applyOptionsToPage();

  // First paint
  if (typeof window.katex === "undefined") window.addEventListener("load", renderNow, { once: true });
  else renderNow();
});
