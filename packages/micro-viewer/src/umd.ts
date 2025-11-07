/**
 * Minimal UMD entry so rollup UMD target doesn't fail.
 * Exposes the public API on window.MicroViewer without side effects.
 */
// Using dynamic import to avoid hard-coding internal structure.
(async () => {
  try {
    const api = await import('./public.js').catch(async () => import('./public.ts'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).MicroViewer = api;
  } catch {
    // Swallow: UMD build may not be used in dev.
  }
})();

export {};
