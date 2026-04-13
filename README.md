# AI Study Assistant Frontend

Current frontend for the AI Study Assistant Study Hub.

## What This Repo Owns

- Svelte frontend runtime
- hash-based routing and authenticated shell
- canonical Study Hub library/document UX
- shared UI primitives and tokenized styling
- Better Auth browser-session integration
- backend API consumption for upload, study, admin, and settings flows

## Quick Orientation

- canonical study routes live under `#/study`
- public auth routes are `#/`, `#/sign-in`, and `#/sign-up`
- `AppShell` is the default authenticated shell
- `StudyHubIndex.svelte` and `StudyHubDocument.svelte` are the canonical Study Hub screens
- legacy routes remain for legacy compatibility only, not primary UX
- tokens live in `src/lib/styles/tokens.css`
- shared primitives live in `src/lib/components/ui/*`
- runtime detail for `Document.processingStatus`, `DocumentGeneration`, and `Job.status (worker-only)` lives in `SYSTEM_OVERVIEW.md`

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
- `studymaxing.com`, `www.studymaxing.com`, `my-ai-assistant.vercel.app`, and production-like hosts -> production backend

## Related Docs

- `SYSTEM_OVERVIEW.md`: primary runtime, lifecycle, and contract source of truth
- `PROJECT_STRUCTURE.md`: file and folder ownership
- `UI_POST_ROLLOUT.md`: current UI state and guarantees
- `README.md`: this high-level entry point
- `src/lib/components/ui/PRIMITIVES.md`: primitive usage guidance
- `src/lib/components/ui/DATA_SURFACE_PATTERN.md`: dense admin/data-surface guidance
- `docs/*`: archival rollout references, not current runtime source of truth

Last Updated: April 2, 2026
