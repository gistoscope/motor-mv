import { describe, it, expect } from 'vitest';

describe('events.intents', () => {
  it('should construct simple intents', () => {
    const intent = { type: 'click-op', id: 'tok:1' };
    expect(intent.type).toBe('click-op');
    expect(intent.id).toBe('tok:1');
  });
});
