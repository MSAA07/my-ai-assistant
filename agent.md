# Agent Documentation (Frontend)

Practical contributor guide for `my-ai-assistant`.

## Stack

- Svelte 5.53.7
- Vite 7.3.1
- TailwindCSS 3.4 + PostCSS
- Better Auth client calls over cookie sessions

## Key Runtime Behavior

- Hash routes are normalized and resolved in `src/routes.js`
- Session is bootstrapped in `src/stores/auth.js`
- `src/config.js` selects backend base URL from env or hostname
- `AppShell.svelte` is the shared authenticated dashboard frame
- `DocumentView.svelte` drives consolidated summary/flashcards/exam UX and polling for legacy activity routes
- `StudyHubDocument.svelte` is the canonical document hub for `/study/:id/:section?`

## Important flows

1. Auth
- Sign in/up via `/api/auth/*/email`
- Store session in Svelte store

2. Upload
- `Home.svelte` posts multipart form to `/api/upload`
- On success, navigate to `/study?highlight=:id`

3. Document processing and generation
- Poll `GET /api/document/:id` while extraction or generation is active
- Load excerpts from `/api/document/:id/excerpts`
- Queue on-demand generation with `POST /api/document/:id/generations`

4. Learning interactions
- Save flashcard progress with `/api/flashcard/progress`
- Save exam attempts with `/api/exam/attempt`

## Folder Map

- `src/pages`: page containers and route-level behavior
- `src/components`: auth/admin feature components
- `src/lib/components/layout`: shared dashboard shell pieces
- `src/lib/components/ui`: reusable design-system primitives and dense data surfaces
- `src/stores`: global auth/router stores
- `src/lib/i18n`: dictionaries and translator helper

## Current page ownership

- `Home.svelte`: dashboard landing, stats, upload surface
- `StudyHubIndex.svelte`: library grid of uploaded documents
- `StudyHubDocument.svelte`: document hub with Summary / Flashcards / Mock Exam action cards
- `DocumentView.svelte`: consolidated study states for summary, flashcards, and exam
- `Settings.svelte`: grouped account/theme/language settings
- `AdminDashboard.svelte`: premium admin shell + tabs

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`

## Git Workflow

- Push to `stage` for staging deploy and QA
- Push to `production` only on explicit request

## Environment

- `VITE_API_BASE_URL` (optional override)

Host-derived defaults in code:
- local: `http://localhost:3001`
- staging preview hosts: staging Railway backend
- production host: production Railway backend

Last Updated: March 13, 2026
