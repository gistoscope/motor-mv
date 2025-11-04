// PATH: packages/micro-viewer/src/query.ts
// Public helpers for tests/demos. Tolerant to historical selector variations.

export type MVReadyPayload = {
  injectedAssets?: boolean;
  timings?: { mountMs?: number };
};

/** Find anchor elements used by the micro-viewer overlays. */
export function queryAnchors(root: ParentNode): NodeListOf<HTMLElement> {
  return root.querySelectorAll<HTMLElement>(
    '[data-anchor-id], [data-mv-anchor-id], .motor-mv-anchor, .mv-anchor'
  );
}

/** Await 'ready' if the handle exposes on('ready', ...). */
export function waitReady(handle: any): Promise<MVReadyPayload | void> {
  return new Promise((resolve) => {
    if (handle && typeof handle.on === 'function') {
      const off = handle.on?.('ready', (p: MVReadyPayload) => {
        try { off?.(); } catch {}
        resolve(p);
      });
    } else {
      queueMicrotask(() => resolve());
    }
  });
}

/** Selectors that indicate that KaTeX assets have been injected. */
export const MV_ASSETS_MARKERS: string[] = [
  '[data-mv-katex]',                                   // preferred explicit marker
  'link[rel="stylesheet"][href*="katex"]',             // CDN/local stylesheet
  'style[data-katex]'                                  // inline style fallback
];

/** Heuristic for "assets present" check. */
export function detectAssetsInjected(doc: Document = document): boolean {
  return MV_ASSETS_MARKERS.some((sel) => !!doc.head?.querySelector(sel));
}
