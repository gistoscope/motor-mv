// Micro Viewer S6.1 — adds Input Window (ASCII/LaTeX), always interactive.
import { setupController } from './controller.s6.js';
import { engineStub } from './engine.stub.js';
import { debounce } from './util.debounce.js';

const container = document.getElementById('mv-container');
const fmtSel = document.getElementById('mv-format');
const inputEl = document.getElementById('mv-input');

// Initial demo expression
const initialExpr = '(1 + (2 × 3)) ÷ ((4 + 5) × (6 − 2/3))';
container.textContent = initialExpr;
inputEl.value = initialExpr;

// Hook controller & toolbar
setupController(container, engineStub);
['undo','redo','reset','help'].forEach(name => {
  const btn = document.getElementById(`mv-${name}`);
  if (!btn) return;
  btn.addEventListener('click', () => console.log(`${name} clicked`));
});

// Emit 'input-changed' on debounce; update the display text (no math transform)
const emitInputChanged = debounce(() => {
  const payload = {
    type: 'input-changed',
    format: fmtSel.value,
    text: inputEl.value
  };
  console.log('Intent →', payload);
  engineStub.handleIntent(payload);
  // For S6.1 we just mirror the text
  container.textContent = inputEl.value;
}, 200);

fmtSel.addEventListener('change', emitInputChanged);
inputEl.addEventListener('input', emitInputChanged);
