/**
 * Engine-Stub S6 — fake engine returning OK or errors.
 * Viewer never computes results; Stub only validates intents.
 */
export interface EngineStub {
  handleIntent(intent: any): void;
}

export const engineStub: EngineStub = {
  handleIntent(intent) {
    const allowed = ['click-op','select-range','hover-op','contextmenu','drag-start','drag-end','keyboard'];
    if (!allowed.includes(intent.type)) {
      console.warn('Unknown intent', intent);
      return;
    }
    console.log('EngineStub ←', intent);
    // fake OK response
    const response = { ok: true, action: 'transform', patches: [] };
    console.log('EngineStub →', response);
  }
};
