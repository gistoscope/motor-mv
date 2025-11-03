# Micro Viewer — Quickstart (S2–S4)

This README summarizes how to run and embed the **micro‑viewer** after S2–S4.

## Run the standalone demo (port 4001)

```powershell
cd D:\work\motor-mv
pnpm --filter @motor/micro-viewer dev
# → http://localhost:4001
```

## Use directly in a static HTML page (UMD)

The UMD bundle exposes `window.MicroViewer`.

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>micro-viewer — UMD demo</title>
  </head>
  <body>
    <div id="app" style="padding:16px;border:1px solid #ccc;"></div>

    <!-- Use the local built bundle -->
    <script src="../../packages/micro-viewer/dist/umd/micro-viewer.umd.js"></script>
    <script>
      const { createController } = window.MicroViewer;
      const el = document.getElementById('app');

      const mv = createController(el, {
        theme: "light",   // "light" | "dark"
        density: "cozy",  // "compact" | "cozy"
        fontScale: 1.0    // number
      });

      mv.render(String.raw`\\frac{d}{dx}\\left( \\frac{\\sin x}{x^2+1} \\right)`);

      // Events
      mv.on("hover", (ev) => console.log("hover", ev));
      mv.on("select", (ev) => console.log("select", ev));

      // Built-in bracket-pair highlighter supports:
      //  - hover highlight
      //  - pin on click
      //  - unpin on second click or Escape
    </script>
  </body>
</html>
```

> Tip: the KaTeX loader is idempotent and will auto-inject assets. No manual tags required.

## Use as an ES module (no bundler)

You can import the **ESM** build directly from `dist/esm`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>micro-viewer — ESM demo</title>
  </head>
  <body>
    <div id="app" style="padding:16px;border:1px solid #ccc;"></div>

    <script type="module">
      import { createController } from "../../packages/micro-viewer/dist/esm/index.js";

      const el = document.getElementById('app');
      const mv = createController(el, { theme: "light", density: "cozy", fontScale: 1.0 });
      mv.render(String.raw`\\left[\\frac{\\partial}{\\partial x} \\left( \\frac{\\sin(x)}{x^2+1} \\right) + \\Biggl( \\sum_{n=1}^{4} n^2 \\Biggr)\\right]`);
    </script>
  </body>
</html>
```

---

## API sketch

```ts
type MVOptions = {
  theme?: "light" | "dark";
  density?: "compact" | "cozy";
  fontScale?: number;
};

type Events = "hover" | "select";

interface MicroViewerController {
  render(exprLatex: string): void;
  update(opts: MVOptions): void;
  on(ev: Events, handler: (payload: any) => void): void;
  off(ev: Events, handler: (payload: any) => void): void;
  destroy(): void;
}
```

- **Bracket pair plugin** (S3) is enabled by default: hover highlights, click to pin, second click/Escape to unpin.
- **Assets loader** (S2) is idempotent, tries CDN first, falls back to local KaTeX.
- **Distributions** (S4): `dist/esm`, `dist/umd`, `dist/types`. Packing check:

```powershell
pnpm -C packages/micro-viewer pack
# expect: tar with package/dist/esm, dist/umd, dist/types, README.md, package.json
```
