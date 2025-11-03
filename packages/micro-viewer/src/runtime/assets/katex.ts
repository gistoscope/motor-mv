/* SSR-safe: no DOM touch at module top-level */
export type KatexAssetsHandle = {
  /** KaTeX assets are persistent; dispose is a no-op to avoid flicker. */
  dispose: () => void;
};

const MARK_ATTR = "data-mv-katex";

/**
 * Ensure KaTeX CSS/fonts are present exactly once in <head>.
 * Subsequent calls are idempotent.
 */
export function ensureKatexAssetsOnce(doc: Document): KatexAssetsHandle {
  // Find existing <link rel="stylesheet" data-mv-katex>
  let link = doc.head.querySelector<HTMLLinkElement>(
    `link[rel="stylesheet"][${MARK_ATTR}]`
  );

  if (!link) {
    link = doc.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute(MARK_ATTR, "1");
    // Public CDN is fine for runtime; in your bundler this may be inlined/aliased.
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css";
    doc.head.appendChild(link);
  }

  // We intentionally keep assets resident across renders.
  return { dispose: () => { /* no-op */ } };
}
