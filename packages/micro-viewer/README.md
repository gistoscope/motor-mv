<!-- PATH: packages/micro-viewer/README.md -->
# @motor/micro-viewer — M0 Quick Start

**What it is:** a thin math viewer on top of KaTeX.  
**M0 scope:** stable `render()` / `update()` / `destroy()`, idempotent KaTeX assets (1×/document), anchor hooks for overlays.

## Install (monorepo)
- Node `20.19.x` + PNPM `9.x` (Corepack)
- KaTeX is a **peerDependency** (`^0.16.11`) — not bundled.
- Package is **ESM-only** (`"type":"module"`, `"exports"`, `"types"`).

```ts
import { render } from '@motor/micro-viewer';

const host = document.getElementById('app')!;
const mv = render(host, 'x + y');

// Later:
mv.update('a + b');

// Cleanup:
mv.destroy();
```

## KaTeX assets
- CSS/fonts are injected **exactly once** per document (idempotent).
- Auto-injection can be disabled at the host level (see project options).

## Invariants & current state
- The project already uses anchors and base highlights (e.g., bracket pairs).  
- **Public events API is *not* part of M0.** Hover/select exist internally and may change — a stable public contract will be documented in **M1**.
- Math transformations/history (×1, fraction↔division, undo/redo) belong to **Engine/TSA/host**, not to the micro-viewer.

## Tests (M0)
- Package-level tests assert idempotent assets and anchor presence.
- Cross-package duplicates are intentionally skipped to avoid drift.

## Notes
- In jsdom you may see KaTeX Quirks warnings — fine for tests. In production always include `<!doctype html>`.
- Do not commit artifacts (`dist/`, `*.zip`) — attach ZIPs to GitHub Releases.
