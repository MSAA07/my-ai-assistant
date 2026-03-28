# AI Study Assistant Frontend

Current frontend for the AI Study Assistant Study Hub.

## What This Repo Owns

- Svelte frontend runtime
- hash-based routing and authenticated shell
- Study Hub library/document/activity UX
- shared UI primitives and tokenized styling
- Better Auth browser-session integration
- backend API consumption for upload, study, admin, and settings flows

## Quick Orientation

- canonical study flow lives under `#/study`
- `AppShell` is the default authenticated shell
- `StudyHubIndex.svelte` and `StudyHubDocument.svelte` are the canonical Study Hub screens
- `DocumentView.svelte` remains the legacy activity route surface
- tokens live in `src/lib/styles/tokens.css`
- shared primitives live in `src/lib/components/ui/*`
- the backend AI prompt-engineering rollout is complete without requiring new frontend route or contract changes
- free, pro, and premium behavior stays behind the same backend generation endpoints
- prompt-version, routing, and benchmark metadata remain internal backend concerns and do not change the frontend API envelope

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

Environment:

- `VITE_API_BASE_URL` optionally overrides host-derived backend resolution.

Host-derived backend mapping in `src/config.js`:

- local Vite dev on `localhost` / `127.0.0.1` -> same-origin dev proxy
- local non-dev host -> staging backend
- Vercel preview/stage hosts -> staging backend
- `my-ai-assistant.vercel.app` and production-like hosts -> production backend

## Related Docs

- `SYSTEM_OVERVIEW.md`: routing, lifecycle, runtime, and API behavior
- `PROJECT_STRUCTURE.md`: file and folder ownership
- `UI_POST_ROLLOUT.md`: current UI status and verified deferred items
- `src/lib/components/ui/PRIMITIVES.md`: primitive usage guidance
- `src/lib/components/ui/DATA_SURFACE_PATTERN.md`: dense admin/data-surface guidance

Last Updated: March 28, 2026
