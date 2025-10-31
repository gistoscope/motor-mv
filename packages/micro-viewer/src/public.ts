export type RenderOpts = {
  katex?: { renderToString(expression: string, options?: Record<string, unknown>): string };
};

type KatexLike = { renderToString(expression: string, options?: Record<string, unknown>): string };

let cachedKatex: Promise<KatexLike> | undefined;

async function ensureKatex(opts?: RenderOpts): Promise<KatexLike> {
  if (opts?.katex) {
    return opts.katex;
  }

  const globalKatex = (globalThis as { katex?: KatexLike }).katex;
  if (globalKatex?.renderToString) {
    return globalKatex;
  }

  if (!cachedKatex) {
    cachedKatex = import('katex').then((mod: unknown) => {
      const candidate =
        typeof mod === 'object' && mod !== null && 'default' in (mod as Record<string, unknown>)
          ? ((mod as Record<string, unknown>).default as KatexLike)
          : (mod as KatexLike);

      if (!candidate?.renderToString) {
        throw new Error('KaTeX module does not expose renderToString');
      }

      return candidate;
    });
  }

  return cachedKatex;
}

function wrapAnchors(root: HTMLElement) {
  const spans = root.querySelectorAll('span[id]');

  spans.forEach((node) => {
    const element = node as HTMLElement;
    const id = element.getAttribute('id');
    const parent = element.parentElement;

    if (!id || !parent || parent.classList.contains('motor-mv-anchor')) {
      return;
    }

    const wrapper = root.ownerDocument?.createElement('span') ?? document.createElement('span');
    wrapper.className = 'motor-mv-anchor';
    wrapper.setAttribute('data-anchor-id', id);
    wrapper.id = id;

    element.removeAttribute('id');
    parent.replaceChild(wrapper, element);
    wrapper.appendChild(element);
  });
}

export async function render(selector: string, expr: string, opts?: RenderOpts): Promise<void> {
  const target = document.querySelector<HTMLElement>(selector);

  if (!target) {
    throw new Error(`micro-viewer: unable to find target for selector "${selector}"`);
  }

  const katex = await ensureKatex(opts);
  const html = katex.renderToString(expr, {
    throwOnError: false,
    strict: 'ignore',
    trust: (context: any) => context?.command === '\\htmlId' || context?.command === '\\htmlClass',
  });

  const temp = document.createElement('div');
  temp.innerHTML = html;
  wrapAnchors(temp);

  target.innerHTML = '';
  while (temp.firstChild) {
    target.appendChild(temp.firstChild);
  }
}
