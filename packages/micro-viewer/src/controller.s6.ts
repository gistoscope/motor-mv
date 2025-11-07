/**
 * Controller S6 — attaches hover/click/drag listeners to root container.
 */
import type { EngineStub } from './engine.stub';

export function setupController(root: HTMLElement, engine: EngineStub) {
  const state = { selecting: false, start: 0 };

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const intent = { type: 'click-op', id: target.dataset.mvId || '?' };
    console.log('Intent →', intent);
    engine.handleIntent(intent);
  });

  root.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log('Context menu triggered');
  });

  root.addEventListener('mousedown', (e) => {
    if (e.button === 0 || e.button === 2) {
      state.selecting = true;
      state.start = e.clientX;
    }
  });

  root.addEventListener('mouseup', (e) => {
    if (!state.selecting) return;
    state.selecting = false;
    const intent = { type: 'select-range', button: e.button === 2 ? 'right' : 'left' };
    console.log('Intent →', intent);
    engine.handleIntent(intent);
  });

  root.addEventListener('mousemove', (e) => {
    if (state.selecting) return;
    const intent = { type: 'hover-op', id: 'hover' };
    engine.handleIntent(intent);
  });
}
