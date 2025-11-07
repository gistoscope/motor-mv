# I3 Fix (v0.1.1)

This script patches the inline I3 adapter inside `packages/micro-viewer/src/app.s6.3.js` to:
- make `adapter.request` **synchronous** (matches current S6.3 code paths),
- delegate `adapter.classify` to the existing `engineStub.classify` (restores green/purple gating).

## Usage

```powershell
# Apply fix
powershell -ExecutionPolicy Bypass -File tools\i3-fix.ps1

# Verify
Select-String -Path packages\micro-viewer\src\app.s6.3.js -Pattern "i3_adapter\.request|i3_adapter\.classify"

# If needed, manual revert using backup:
copy packages\micro-viewer\src\app.s6.3.js.bak.i3fix packages\micro-viewer\src\app.s6.3.js
```