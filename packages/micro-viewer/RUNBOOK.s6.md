# Micro Viewer S6 — Runbook (JS build)

**Launch** (port 4001)

```powershell
cd D:\work\motor-mv
git switch feature/s6-bootstrap
pnpm run verify
pnpm -r test
node packages/micro-viewer/server.mjs
# open http://localhost:4001/public/index.s6.html
```

If your browser shows the old S3/S4 page (with Theme/Density/Font scale), make sure the URL ends with **/public/index.s6.html** and disable cache in DevTools → Network.
