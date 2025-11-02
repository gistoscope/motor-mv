@'
# Pull Request — Motor-MV

## Summary
Describe the problem and the intent of this change in 2–3 sentences.

## Changes
- Short, bullet-point list of what changed (source only; no build artifacts).
- Reference issues/PRs if applicable (e.g., Closes #123).

## Verification
- [ ] I ran `pnpm install --frozen-lockfile`
- [ ] I ran `pnpm -r verify` (passed)
- [ ] I ran `pnpm -r test` (passed)
- [ ] CI on this PR is green

## Branch & Scope
- Base branch: `sandbox`
- This PR contains **only** code/docs relevant to the change (no unrelated edits).

## UI / Demo (if applicable)
- Steps to verify locally (e.g., `pnpm -C packages/web dev`, route `/dev/micro-demo`).
- Screenshots or short notes are welcome.

## Checklist
- [ ] No generated artifacts committed (e.g., `dist/`, `*.zip`, `ui-rich/dist`)
- [ ] Docs updated when behavior/flags changed
- [ ] Naming/paths follow repository conventions
'@ | Set-Content -Encoding UTF8 -NoNewline .github\pull_request_template.md
