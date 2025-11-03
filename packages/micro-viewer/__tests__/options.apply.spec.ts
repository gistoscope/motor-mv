// packages/micro-viewer/__tests__/options.apply.spec.ts
import { describe, it, expect } from 'vitest';
import { applyOptions, defaultOptions, mergeOptions } from '../src/runtime/options';

describe('options apply', () => {
  it('applies theme, density, and fontScale to root', () => {
    const root = document.createElement('div');
    const opts = mergeOptions(defaultOptions, { theme:'dark', density:'compact', fontScale:1.25 });
    applyOptions(root, opts);

    expect(root.dataset.theme).toBe('dark');
    expect(root.dataset.density).toBe('compact');
    expect(root.style.getPropertyValue('--mv-font-scale')).toBe('1.25');
  });
});
