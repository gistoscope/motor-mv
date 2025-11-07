/**
 * Micro Viewer S6 — main entrypoint.
 * Always interactive version: hover/click/drag emit intents to Engine-Stub.
 */
import { setupController } from './controller.s6';
import { engineStub } from './engine.stub';

const container = document.getElementById('mv-container')!;

// demo expression
const expr = '(1 + (2 × 3)) ÷ ((4 + 5) × (6 − 2/3))';
container.textContent = expr;

// simple controller setup
setupController(container, engineStub);

// toolbar wiring
['undo','redo','reset','help'].forEach(name => {
  const btn = document.getElementById(`mv-${name}`);
  if (!btn) return;
  btn.addEventListener('click', () => console.log(`${name} clicked`));
});
