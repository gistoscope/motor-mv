# Micro Viewer S6.1 — Input Window (ASCII/LaTeX)

**Launch** (port 4001)

```powershell
cd D:\work\motor-mv
git switch feature/s6-bootstrap
pnpm run verify
pnpm -r test
node packages/micro-viewer/server.mjs
# open http://localhost:4001/public/index.s6.1.html
```

**What to expect**
- Right panel: Input Window with **Format** (ASCII / LaTeX) and textarea.
- Debounce: 200 ms — type → 'input-changed' intent in console → display mirrors text.
- Toolbar: Undo / Redo / Reset / Help — console logs on click.
- No math evaluation; EngineStub returns OK.
