// Micro Viewer S6 — JS entrypoint (always interactive).
// No TypeScript, so browsers can load directly as ESM.
import { setupController } from './controller.s6.js';
import { engineStub } from './engine.stub.js';

const container = document.getElementById('mv-container');
const expr = '(1 + (2 × 3)) ÷ ((4 + 5) × (6 − 2/3))';
// simple render as text for S6 (no math transform)
container.textContent = expr;

// attach controller and toolbar handlers
setupController(container, engineStub);
['undo','redo','reset','help'].forEach(name => {
  const btn = document.getElementById(`mv-${name}`);
  if (!btn) return;
  btn.addEventListener('click', () => console.log(`${name} clicked`));
});
