# Sani Log

## 2026-05-27 - Backend recovery prep kickoff
- Checked repo seams for Encore wiring and admin diagnostics.
- Confirmed `sani.md` was missing and created it.
- Identified key files for recovery hardening:
  - `src/lib/api.ts`
  - `src/store/useStore.ts`
  - `src/pages/Admin.tsx`
  - `docs/encore-deployment.md`
- Focus: make missing env vs dead backend states explicit, then tighten deployment handoff.

## 2026-05-27 - backend-wp62 recovery hardening complete
- Tightened API error classification in `src/lib/api.ts`:
  - Added explicit states: `api-unreachable`, `api-route-missing`, `api-server-error`.
  - Added richer request context (`method`, `path`, `url`) on `ApiCapabilityError`.
  - Added `missingAdminAuthConfig` to runtime status.
- Updated catalogue fallback behavior in `src/store/useStore.ts`:
  - Only `api-disabled` now counts as a non-error fallback.
  - Dead/unreachable/misrouted backend states now surface as real catalogue errors.
- Upgraded admin diagnostics in `src/pages/Admin.tsx`:
  - Diagnostics auto-run on admin load.
  - Distinguishes:
    - missing env (`VITE_API_BASE_URL` / `VITE_API_ADMIN_TOKEN`)
    - unreachable backend
    - route missing (404)
    - backend server unhealthy (5xx)
  - Added explicit `Encore Backend Target` panel showing the live target URL and missing env state.
  - Replaced static “System Online” badge with dynamic backend health status.
- Updated deployment handoff in `docs/encore-deployment.md`:
  - Added `backend-wp62` staging recovery runbook:
    - app link
    - secret set
    - staging retrigger
    - health probe
    - frontend repoint
    - final admin diagnostic expectations
- Verification:
  - Ran `npm run lint` (`tsc --noEmit`) successfully.
## 2026-05-27 - Firebase/Google leak hardening and secret-rotation prep
- Audited repo for Firebase/Google assumptions in source and env templates.
- Result: no active Firebase runtime/env assumptions found in app code; only dependency artifacts under ignored `node_modules` caches.
- Hardened `.gitignore` to block common secret-shaped files and config dumps, including `firebase-applet-config.json`, service-account/credentials JSON patterns, and private key/cert extensions.
- Added `scripts/secret-guard.mjs` to fail fast on:
  - blocked secret/config filenames
  - Google API key shape (`AIza...`)
  - private key markers
- Wired guardrail command into `package.json` as `npm run guard:secrets`.
- Verified guardrail with local run: `Secret guard passed.`
- Constraint found: this folder currently has no `.git` metadata, so historical commit cleanup and pre-commit hook installation cannot be validated from here.
