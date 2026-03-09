# System Overview (Frontend)

This document describes how the frontend is wired to backend APIs and how UI state maps to backend lifecycle state.

## Stack

- Svelte 5
- Vite 7
- Better Auth cookie sessions
- Hash routing (`#/...`)

## Runtime Architecture

1. Client app (`src/App.svelte`)
- Resolves route from hash path
- Enforces auth and admin route access
- Uses `AppShell` layout by default

2. Route state (`src/stores/router.js` + `src/routes.js`)
- Static routes: dashboard, documents, settings, admin
- Dynamic routes:
  - `/documents/:id/:section?`
  - `/admin/*`

3. Auth state (`src/stores/auth.js`)
- Requests Better Auth endpoints with `credentials: include`
- Bootstraps session on load

4. API base resolution (`src/config.js`)
- Uses `VITE_API_BASE_URL` when set
- Otherwise derives from hostname for local/stage/production

## Core User Flows

### Authentication

- `sign-up`: `POST /api/auth/sign-up/email`
- `sign-in`: `POST /api/auth/sign-in/email`
- `session fetch`: `GET /api/auth/get-session`
- `sign-out`: `POST /api/auth/sign-out`

All calls include credentials so browser session cookies are sent.

### Dashboard and upload

- Dashboard requests `GET /api/user/me`
- Upload sends `POST /api/upload` with `multipart/form-data`
- After upload, UI navigates to `/documents/:id`

### Document view lifecycle behavior

Document page loads:
- `GET /api/document/:id`

If extraction is `queued` or `processing`:
- poll same endpoint until complete/failed

When extraction is complete:
- source excerpts can be loaded with `GET /api/document/:id/excerpts`

On-demand generation actions:
- queue generation: `POST /api/document/:id/generations`
- read generation state: `GET /api/document/:id/generations` (also mirrored in document payload)

Supported generation features in UI:
- summary
- flashcards
- exam

### Progress tracking

- Flashcards progress: `POST /api/flashcard/progress`
- Exam attempts: `POST /api/exam/attempt`

## State Contracts

Extraction status contract:
- backend source: `Document.processingStatus`
- values used by UI: `queued`, `processing`, `complete`, `failed`

Generation status contract:
- backend source: `DocumentGeneration` surfaced as `document.generationState`
- values used by UI: `not_requested`, `queued`, `running`, `complete`, `failed`

Compatibility mirrors still consumed by UI:
- `document.summary`
- `document.flashcards`
- `document.examQuestions`

## Error Handling

- Route/page errors are surfaced as user-facing messages
- Upload/network errors are normalized to translated keys
- Failed processing state shows recovery navigation back to dashboard/documents

## Deployment Mapping

Frontend hosts:
- stage preview: `my-ai-assistant-git-stage-*.vercel.app`
- production: `my-ai-assistant.vercel.app`

Configured backend hosts:
- staging: `https://ai-assistant-backend-staging.up.railway.app`
- production: `https://ai-assistant-backend-production-ddf0.up.railway.app`

## Maintenance triggers

Update this file when:
- routes change
- API endpoints used by UI change
- lifecycle status contract changes
- environment host mapping changes

Last Updated: March 9, 2026
