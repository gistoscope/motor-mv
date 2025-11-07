// Controller S6 — hover/click/drag → intents
export function setupController(root, engine) {
  const state = { selecting: false, startX: 0 };

  root.addEventListener('click', (e) => {
    const el = e.target;
    const id = el && el.dataset ? el.dataset.mvId || '?' : '?';
    const intent = { type: 'click-op', id };
    console.log('Intent →', intent);
    engine.handleIntent(intent);
  });

  root.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const intent = { type: 'contextmenu', target: 'range', idOrRange: null };
    console.log('Intent →', intent);
    engine.handleIntent(intent);
  });

  root.addEventListener('mousedown', (e) => {
    if (e.button === 0 || e.button === 2) {
      state.selecting = true;
      state.startX = e.clientX;
    }
  });

  root.addEventListener('mouseup', (e) => {
    if (!state.selecting) return;
    state.selecting = false;
    const intent = { type: 'select-range', from: 0, to: 0, button: e.button === 2 ? 'right' : 'left' };
    console.log('Intent →', intent);
    engine.handleIntent(intent);
  });

  root.addEventListener('mousemove', (e) => {
    if (state.selecting) return;
    const intent = { type: 'hover-op', id: 'hover' };
    engine.handleIntent(intent);
  });
}
