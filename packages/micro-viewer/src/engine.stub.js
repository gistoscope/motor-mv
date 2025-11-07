// Engine-Stub S6 — validates intents only; no math transform.
export const engineStub = {
  handleIntent(intent) {
    const allowed = ['click-op','select-range','hover-op','contextmenu','drag-start','drag-end','keyboard'];
    if (!allowed.includes(intent.type)) {
      console.warn('Unknown intent', intent);
      return;
    }
    console.log('EngineStub ←', intent);
    const response = { ok: true, action: 'transform', patches: [] };
    console.log('EngineStub →', response);
  }
};
