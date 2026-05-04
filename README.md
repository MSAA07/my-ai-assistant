# Study Maxing Frontend

Current frontend for the Study Maxing public entry, auth experience, and authenticated study workflow.

## What This Repo Owns

- Svelte/Vite frontend runtime
- hash-based routing across public, auth, and authenticated surfaces
- refreshed public marketing and auth shell
- canonical authenticated study flow under `#/study`
- Better Auth browser-session integration
- backend API consumption for upload, study, admin, settings, and auth utility flows

## Quick Orientation

- public landing route: `#/`
- public auth routes: `#/sign-in`, `#/sign-up`, `#/forgot-password`, `#/reset-password`, `#/verify-email`
- canonical study routes: `#/study` and `#/study/:id/:section?`
- canonical Study Hub surfaces: `src/pages/StudyHubIndex.svelte` and `src/pages/StudyHubDocument.svelte`
- legacy route surface: `src/pages/DocumentView.svelte`, compatibility only

## Environment Notes

- `VITE_API_BASE_URL` overrides all host-derived backend resolution.
- Without an override, `src/config.js` resolves backend base URL from the deployment host.
- Vercel preview/stage-style frontend hosts resolve to the staging backend by default.
- `studymaxing.com`, `www.studymaxing.com`, `my-ai-assistant.vercel.app`, and production-like hosts resolve to the production backend by default.
- Additional frontend env variables are documented in `SYSTEM_OVERVIEW.md`.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Related Docs

- `SYSTEM_OVERVIEW.md`: runtime, route, auth, and lifecycle source of truth
- `PROJECT_STRUCTURE.md`: file and folder ownership
- `UI_POST_ROLLOUT.md`: current UI guarantees and deferred items
- `src/lib/components/ui/PRIMITIVES.md`: primitive usage guidance
- `src/lib/components/ui/DATA_SURFACE_PATTERN.md`: dense admin/data-surface guidance
- `docs/*`: archival rollout references, not current runtime source of truth
- `audit-screenshots/admin-ui/ADMIN_UI_AUDIT.md`: archival admin visual QA evidence

Last Updated: April 30, 2026
