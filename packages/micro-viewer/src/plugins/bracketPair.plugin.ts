// packages/micro-viewer/src/plugins/bracketPair.plugin.ts
// A tiny bracket-pair highlighter plugin for KaTeX output.
// It looks for .katex container under `api.root`, scans .mopen/.mclose spans,
// computes pairs via a simple stack, and highlights both ends on hover/click.

import type { MVPlugin } from '../runtime/plugins';

function findKatexRoot(root: HTMLElement): HTMLElement | null {
  return root.querySelector('.katex');
}

function computePairs(katexRoot: HTMLElement): Array<[HTMLElement, HTMLElement]> {
  const spans = Array.from(katexRoot.querySelectorAll<HTMLElement>('.mopen, .mclose'));
  type Item = { el: HTMLElement; kind: 'open'|'close' };
  const items: Item[] = spans.map(el => ({
    el,
    kind: el.classList.contains('mopen') ? 'open' : 'close'
  }));
  const stack: HTMLElement[] = [];
  const pairs: Array<[HTMLElement, HTMLElement]> = [];
  for (const it of items) {
    if (it.kind === 'open') {
      stack.push(it.el);
    } else {
      const open = stack.pop();
      if (open) pairs.push([open, it.el]);
    }
  }
  return pairs;
}

export const bracketPairHighlighter: MVPlugin = (api) => {
  const root = api.root;
  const katex = findKatexRoot(root);
  if (!katex) return;

  const pairs = computePairs(katex);
  const pairMap = new Map<HTMLElement, HTMLElement>();
  for (const [a, b] of pairs) {
    pairMap.set(a, b);
    pairMap.set(b, a);
  }

  function clearAll() {
    root.querySelectorAll('.mv-bracket-active').forEach(el => el.classList.remove('mv-bracket-active'));
  }
  function setActive(el: HTMLElement | null) {
    clearAll();
    if (!el) return;
    const other = pairMap.get(el);
    if (other) {
      el.classList.add('mv-bracket-active');
      other.classList.add('mv-bracket-active');
    }
  }

  function onMouseEnter(this: HTMLElement) { setActive(this); }
  function onClick(this: HTMLElement) { setActive(this); }
  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') clearAll(); }

  const listeners: Array<() => void> = [];
  for (const el of pairMap.keys()) {
    const enter = onMouseEnter.bind(el);
    const click = onClick.bind(el);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('click', click);
    listeners.push(() => { el.removeEventListener('mouseenter', enter); el.removeEventListener('click', click); });
  }
  root.addEventListener('keydown', onKey);
  listeners.push(() => root.removeEventListener('keydown', onKey));

  return {
    teardown() {
      clearAll();
      for (const off of listeners) try { off(); } catch {}
    }
  };
};
