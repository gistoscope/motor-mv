# I2/E1 Smoke Tests

This folder adds a minimal "event → intent → response → patch → text" smoke test.
Run from repo root:

```powershell
# one-off
powershell -ExecutionPolicy Bypass -File tools\i2-run.ps1

# watch mode
powershell -ExecutionPolicy Bypass -File tools\i2-run.ps1 -Watch
```