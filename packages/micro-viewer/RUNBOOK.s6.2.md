# Micro Viewer S6.2 — Range & Context Menu

**Launch** (port 4001)

```powershell
cd D:\work\motor-mv
git switch feature/s6-bootstrap
node packages/micro-viewer/server.mjs
# open http://localhost:4001/public/index.s6.2.html
```

**What to expect**
- Left-drag on Display selects a substring (highlighted).
- Right-click opens a simple context menu near the cursor.
- **Wrap in parentheses** → sends `wrap` to Engine-Stub → wraps selected text in `(...)`.
- **Remove parentheses** → sends `unwrap` to Engine-Stub; allowed only if selection has balanced outer `(...)` (syntactic rule) → removes one outer pair.
- **Explain** → prints a short note in console.
- Input Window still mirrors text and debounces `input-changed` (200 ms).
