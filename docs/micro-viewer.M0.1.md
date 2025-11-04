# Micro-Viewer — M0.1 (Applied)
- Unified KaTeX asset injection via `ensureKatexAssetsOnce`.
- Exported `MV_KATEX_ASSETS_SELECTOR = '[data-mv-katex]'` from runtime/assets/katex.ts.
- Added public helpers `src/query.ts` (anchors, waitReady, assets detection).
- Added `styles/a11y.m0-1.css` and imported it from `packages/web/src/styles.css`.
- No API changes; no math logic added; expected green CI.
