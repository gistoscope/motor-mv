# Micro Viewer S6 Runbook

**Launch demo** (port 4001)

```powershell
cd D:\work\motor-mv
git switch feature/s6-bootstrap
pnpm run verify
pnpm -r test
node packages/micro-viewer/server.mjs
# open http://localhost:4001/public/index.s6.html
```

**Demo expression:**
```
(1 + (2 × 3)) ÷ ((4 + 5) × (6 − 2/3))
```

**Expected behavior:**
- Hover/click/drag produce console logs of intents.
- EngineStub responds OK to valid intents.
- Toolbar (Undo/Redo/Reset/Help) logs actions.
- No actual math changes (visual only).

**End of S6 package.**
