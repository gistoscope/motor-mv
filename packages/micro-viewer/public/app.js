// app.js — KaTeX render wiring for Micro Viewer
function normalize(latex) {
  // Replace double backslashes (\\) with a single backslash (\),
  // collapse explicit "\n" into spaces for inline rendering.
  return (latex || "").replace(/\\\\/g, "\\").replace(/\\n/g, " ");
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
}

function ready(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(fn, 0);
  } else {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }
}

ready(() => {
  // Wire button
  const btn = document.getElementById('renderBtn');
  if (btn) btn.addEventListener('click', renderNow);

  // Live update as you type (light throttle)
  const expr = document.getElementById('expr');
  if (expr) {
    let t = 0;
    expr.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(renderNow, 120);
    });
  }

  // First render (may wait a tick if KaTeX not ready yet)
  if (typeof window.katex === "undefined") {
    window.addEventListener("load", renderNow, { once: true });
  } else {
    renderNow();
  }
});
