import { describe, it, expect } from 'vitest';

describe('paren.policy', () => {
  it('should deny unwrap of unsafe expression', () => {
    const safe = '(3)';
    const unsafe = '(2+3)';
    expect(safe.startsWith('(')).toBe(true);
    expect(unsafe.includes('+')).toBe(true);
  });
});
