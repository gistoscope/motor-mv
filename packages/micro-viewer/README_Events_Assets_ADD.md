## Events & Assets

**Runtime CSS namespace:** all viewer runtime classes are prefixed with `mv-`
(e.g. `mv-hovered`, `mv-selected`) to avoid collisions.

**Idempotent KaTeX assets:** `ensureKatexAssetsOnce(document)` injects the KaTeX
stylesheet once; repeated renders/updates do not multiply `<link>` tags.

**Event API (minimal):**
- `controller.on('hover' | 'select', handler)` / `off` / `once`
- `controller.onHover(tokenId)` — programmatic hover trigger
- `controller.onSelect(tokenOrSubtreeId)` — programmatic select trigger
- `controller.destroy()` — detaches delegated listeners and clears runtime classes

**SSR-safety:** no DOM access at module top-level; call assets/event wiring inside `render()`.
