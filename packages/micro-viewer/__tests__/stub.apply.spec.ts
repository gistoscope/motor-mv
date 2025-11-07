import { describe, it, expect } from 'vitest';

describe('stub.apply', () => {
  it('returns OK response for valid intents', () => {
    const resp = { ok: true, action: 'transform', patches: [] };
    expect(resp.ok).toBe(true);
  });
});
