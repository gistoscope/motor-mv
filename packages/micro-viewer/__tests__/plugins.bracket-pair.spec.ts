// packages/micro-viewer/__tests__/plugins.bracket-pair.spec.ts
import { describe, it, expect } from 'vitest';
import { bracketPairHighlighter } from '../src/plugins/bracketPair.plugin';

function mountDom(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

function mkKatex(inner: string) {
  return `<div class="katex">${inner}</div>`;
}

describe('bracketPairHighlighter', () => {
  it('highlights bracket pairs together on hover/click and clears on Escape', () => {
    const host = mountDom(mkKatex(`
      <span class="mopen">(</span>
      <span class="mclose">)</span>
    `));

    const api = {
      root: host,
      on: () => {},
      off: () => {},
      getOptions: () => ({ theme:'light', density:'comfortable', fontScale:1 }),
      setOptions: () => {},
    };

    // activate plugin
    const res = (bracketPairHighlighter as any)(api);

    const opens = host.querySelectorAll('.mopen');
    const closes = host.querySelectorAll('.mclose');
    expect(opens.length).toBe(1);
    expect(closes.length).toBe(1);

    const open = opens[0] as HTMLElement;
    const close = closes[0] as HTMLElement;

    // hover open
    open.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(open.classList.contains('mv-bracket-active')).toBe(true);
    expect(close.classList.contains('mv-bracket-active')).toBe(true);

    // Escape clears
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(open.classList.contains('mv-bracket-active')).toBe(false);
    expect(close.classList.contains('mv-bracket-active')).toBe(false);

    // click close
    close.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(open.classList.contains('mv-bracket-active')).toBe(true);
    expect(close.classList.contains('mv-bracket-active')).toBe(true);

    // teardown
    res?.teardown?.();
  });
});
