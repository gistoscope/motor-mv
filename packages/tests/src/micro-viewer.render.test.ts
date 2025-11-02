/// <reference types="vitest" />
/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Временный обход package-resolution: импорт напрямую из исходника микровьюера.
// После фикса package.json в packages/micro-viewer верните на '@motor/micro-viewer'.
import { render } from '../../micro-viewer/src/index';

let host: HTMLElement | null = null;

describe('micro-viewer render()', () => {
  beforeEach(() => {
    host = document.createElement('div');
    host.id = 'test-mv';
    document.body.appendChild(host);
  });

  afterEach(() => {
    host?.remove();
    host = null;
  });

  it('renders KaTeX markup and anchor wrappers', async () => {
    await render('#test-mv', '\\htmlId{anchor}{x}');

    const katex = host?.querySelector('.katex');
    expect(katex).toBeTruthy();

    const anchors = host?.querySelectorAll('.motor-mv-anchor');
    expect(anchors && anchors.length > 0).toBe(true);
    expect(anchors?.[0].getAttribute('data-anchor-id')).toBe('anchor');
  });
});
