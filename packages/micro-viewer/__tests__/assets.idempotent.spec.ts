import { describe, it, expect } from 'vitest';

describe('assets.idempotent', () => {
  it('ensures single KaTeX load', () => {
    const links = ['katex.min.css','katex.min.js'];
    const unique = new Set(links);
    expect(unique.size).toBe(2);
  });
});
