# Micro Viewer

@motor/micro-viewer ships a lightweight KaTeX embed controller that keeps the DOM in sync with an expression string and wraps KaTeX anchors for hover interactions.

## API

```ts
import { render } from "@motor/micro-viewer";

const viewer = render(hostOrSelector, expr, {
  displayMode: false,
  throwOnError: false,
  strict: "ignore",
  katexVersion: "0.16.11",
});

viewer.update("x^2");
viewer.destroy();
viewer.getHost();
```

The KaTeX runtime and stylesheet are injected once per document from jsDelivr (default version `0.16.11`).
If the host page is in quirks mode (no `<!DOCTYPE>`), KaTeX will emit a warning and rendering may degrade.

## Local demo

```bash
pnpm mv:dev
```

Then open http://localhost:5173/microviewer-s1.html (or whichever port your Vite dev server reports).

## Embedding example

```ts
import { render } from "@motor/micro-viewer";

const viewer = render("#mv-root", "\\frac{a+b}{c-d}");

viewer.getHost().addEventListener("mouseenter", () => {
  console.log("hovered micro expression");
});

setTimeout(() => viewer.update("x^2"), 1500);
```
