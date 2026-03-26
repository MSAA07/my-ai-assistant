# System Overview (Frontend)

This document describes the current implemented frontend runtime.

## Stack

- Svelte 5
- Vite 7
- Better Auth cookie-session calls
- Hash-based routing

## Routing and Shell

Routing files:

- `src/stores/router.js`
- `src/routes.js`

Current behavior:

- The browser hash is the route source of truth.
- `App.svelte` resolves the normalized route and renders the active page.
- `AppShell.svelte` is the default authenticated shell.
- `AppHeader.svelte` + `Footer.svelte` remain only for the non-default fallback shell path when `VITE_FEATURE_APPSHELL=false`.

Canonical study routes:

- `#/study`
- `#/study/:id/:section?`

Legacy activity routes:

- `#/legacy/documents/:id/:section?`
- `#/documents-legacy/:id/:section?`

Compatibility normalization also maps older routes like `#/documents/:id/:section?` and `#/document/:id` onto the canonical study routes.

## Page Ownership

- `Home.svelte`: authenticated upload/dashboard entry
- `StudyHubIndex.svelte`: canonical Study Hub Library
- `StudyHubDocument.svelte`: canonical Study Hub Document
- `DocumentView.svelte`: legacy activity route wrapper
- `DocumentActivityView.svelte`: shared summary/flashcards/exam activity implementation
- `Settings.svelte`: settings and preferences
- `AdminDashboard.svelte`: admin console

Important distinction:

- Canonical study routes are the user-facing route model.
- `DocumentView.svelte` is kept to preserve the legacy activity route contract.
- On canonical routes, activity sections are rendered from `StudyHubDocument.svelte` through `DocumentActivityView.svelte`.

## Lifecycle and State Model

Document processing lifecycle:

- source: `Document.processingStatus`
- values: `queued`, `processing`, `complete`, `failed`
- UI meaning: extraction readiness for the document

Generation lifecycle:

- source: `DocumentGeneration`
- surfaced as `document.generationState`
- keys: `summary`, `flashcards`, `exam`
- values: `not_requested`, `queued`, `running`, `complete`, `failed`

Job execution lifecycle:

- source: `Job.status`
- values surfaced through `/api/jobs/:id`
- used for queue/progress visibility, not as the main page-rendering source of truth

Compatibility mirrors still present in document payloads:

- `document.summary`
- `document.flashcards`
- `document.examQuestions`

## Data Flow

Home flow:

- `Home.svelte` loads `GET /api/user/me`
- upload posts `POST /api/upload`
- successful upload navigates to `#/study?highlight=:documentId`

Study Hub Library:

- `StudyHubIndex.svelte` loads `GET /api/user/me`
- supports rename via `PATCH /api/document/:id`
- supports delete via `DELETE /api/document/:id`

Study Hub Document:

- `StudyHubDocument.svelte` loads `GET /api/document/:id`
- when extraction or generation is active, it polls the same document endpoint
- it queues generation via `POST /api/document/:id/generations`
- it uses `generationState` plus compatibility mirror content to determine feature readiness

Study activities:

- `DocumentActivityView.svelte` consumes `GET /api/document/:id`
- legacy compatibility writes:
  - `POST /api/flashcard/progress`
  - `POST /api/exam/attempt`
- canonical study artifact APIs are wrapped in `src/lib/api/studyHub.js`

## Shared UI System

Current UI source of truth:

- tokens: `src/lib/styles/tokens.css`
- global foundations: `src/styles/global.css`
- layout primitives: `src/lib/components/layout/*`
- shared UI primitives: `src/lib/components/ui/*`

Notable current primitives:

- `PageHeader`
- `DocumentCard`
- `StudyActionCard`
- `DataSurface`
- `FocusedStudyLayout`
- `ProgressBar`
- `ConfirmModal`
- `PromptModal`
- `ThemeToggle`
- `LanguageToggle`

## Theme and Session

Theme:

- owned by `src/stores/theme.js`
- values: `dark`, `light`
- persisted in `localStorage` key `my-ai-assistant:theme`
- initialized before and during app bootstrap to keep DOM and store aligned

Session:

- owned by `src/stores/auth.js`
- Better Auth endpoints are called with `credentials: include`
- app bootstraps the current session on load

## API Base Resolution

`src/config.js` resolves the backend base URL in this order:

1. `VITE_API_BASE_URL`
2. host-derived mapping
3. local fallback

Current host-derived mapping:

- Vite dev localhost -> same-origin dev proxy
- local non-dev host -> staging backend
- Vercel preview/stage hosts -> staging backend
- production host -> production backend

## Maintenance Triggers

Update this file when any of these change:

- canonical study routes or legacy activity routes
- lifecycle ownership between document state, job state, and `DocumentGeneration`
- page ownership between `StudyHubIndex`, `StudyHubDocument`, `DocumentView`, and `DocumentActivityView`
- shared UI primitive or token ownership
- host-derived API base mapping

Last Updated: March 23, 2026
