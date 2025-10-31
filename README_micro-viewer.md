# Micro Viewer

@motor/micro-viewer provides a single `render` helper that ensures a lightweight KaTeX runtime is present and injects anchor-aware markup for hover interactions.

## Local demo

```bash
pnpm mv:dev
```

Then open http://localhost:5173/mv (or whichever port your Vite dev server reports).

## Embedding example

```ts
import { render } from '@motor/micro-viewer';

async function boot() {
  const selector = '#mv-root';
  const expr = '\\frac{a+b}{c-d}';

  await render(selector, expr);

  const host = document.querySelector(selector);
  if (!host) throw new Error('missing host');

  host.addEventListener('mouseenter', () => {
    console.log('hovered micro expression');
  });
}

boot().catch(console.error);
```
