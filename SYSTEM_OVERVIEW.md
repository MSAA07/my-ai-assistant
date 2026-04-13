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
- `src/stores/auth.js`

Current behavior:

- The browser hash is the route source of truth.
- `App.svelte` resolves the normalized route and renders the active page.
- `AppShell.svelte` is the default authenticated shell.
- `AppHeader.svelte` + `Footer.svelte` remain only for the non-default fallback shell path when `VITE_FEATURE_APPSHELL=false`.
- Public routes are exactly `#/`, `#/sign-in`, and `#/sign-up`.
- All other routes are protected by default.
- Canonical study routes are the only primary user-facing Study Hub model.
- Legacy route normalization runs before auth-guard checks, so older document routes still resolve onto canonical study routes before redirect handling.

Public auth routes:

- `#/`
- `#/sign-in`
- `#/sign-up`

Canonical study routes:

- `#/study`
- `#/study/:id/:section?`

Legacy routes:

- legacy compatibility only, not primary UX

- `#/legacy/documents/:id/:section?`
- `#/documents-legacy/:id/:section?`

Compatibility normalization also maps older routes like `#/documents/:id/:section?`, `#/document/:id`, `#/flashcards`, and `#/exams` onto the canonical study routes.

## Page Ownership

- `Home.svelte`: authenticated upload/dashboard entry
- `StudyHubIndex.svelte`: canonical Study Hub Library
- `StudyHubDocument.svelte`: canonical Study Hub Document
- `DocumentView.svelte`: legacy route wrapper
- `DocumentActivityView.svelte`: shared summary/flashcards/exam activity implementation
- `Settings.svelte`: settings and preferences
- `AdminDashboard.svelte`: admin console

Important distinction:

- Canonical study routes are the user-facing route model.
- `DocumentView.svelte` is kept for legacy compatibility only, not primary UX.
- On canonical routes, activity sections are rendered from `StudyHubDocument.svelte` through `DocumentActivityView.svelte`.

## Lifecycle and State Model

Document processing lifecycle:

- source: `Document.processingStatus`
- values: `queued`, `processing`, `complete`, `failed`
- UI meaning: extraction readiness for the document

Generation lifecycle:

- source of truth: `DocumentGeneration`
- frontend payload projection: `document.generationState`
- keys: `summary`, `flashcards`, `exam`
- values: `not_requested`, `queued`, `running`, `complete`, `failed`

Job execution lifecycle:

- source: `Job.status (worker-only)`
- values surfaced through `/api/jobs/:id`
- used for queue/progress visibility and execution tracking, not as the page-rendering source of truth

Compatibility mirrors still present in document payloads:

- `document.summary`
- `document.flashcards`
- `document.examQuestions`

## Generation System Contract

- `DocumentGeneration` is the source of truth for summary, flashcards, and exam state.
- The frontend reads `document.generationState` as the document payload projection of `DocumentGeneration`.
- `Document.processingStatus` remains the source of truth for extraction readiness.
- `document.summary`, `document.flashcards`, and `document.examQuestions` are compatibility mirrors and content carriers, not lifecycle ownership.
- `Job.status (worker-only)` and `/api/jobs/:id` are execution-tracking inputs only. The UI does not use jobs as truth for readiness or completion.
- Canonical study surfaces derive readiness from `Document.processingStatus`, `DocumentGeneration`, and compatibility-mirror content together.
- Regeneration requests support `options.regenerationGuidance` when users regenerate summary, flashcards, or exam content from the guided regenerate flow.

## Data Flow

Home flow:

- `Home.svelte` loads `GET /api/user/me`
- upload posts `POST /api/upload`
- successful single-document upload stays on `#/home` for a guided post-upload selection step
- the guided step can request one or more generations through `POST /api/document/:id/generations`
- `Home.svelte` polls `GET /api/jobs/:id` plus `GET /api/document/:id` for staged progress while keeping `Document.processingStatus` and `DocumentGeneration` as UI truth
- the guided flow hands off to the canonical document route `#/study/:documentId`

Study Hub Library:

- `StudyHubIndex.svelte` loads `GET /api/user/me`
- supports rename via `PATCH /api/document/:id`
- supports delete via `DELETE /api/document/:id`

Study Hub Document:

- `StudyHubDocument.svelte` loads `GET /api/document/:id`
- when extraction or generation is active, it polls the same document endpoint
- it queues generation via `POST /api/document/:id/generations`
- it uses `DocumentGeneration` plus compatibility mirror content to determine feature readiness
- the completed backend prompt-engineering rollout did not change the frontend route model or generation request shape
- prompt-version metadata, routing metadata, and benchmark linkage stay internal to backend job and usage metadata and are not required for page rendering

Study activities:

- `DocumentActivityView.svelte` consumes `GET /api/document/:id`
- legacy compatibility writes:
  - `POST /api/flashcard/progress`
  - `POST /api/exam/attempt`
- canonical study artifact APIs are wrapped in `src/lib/api/studyHub.js`

## I18N Rules (STRICT)

- Canonical application surfaces must route user-facing copy through the translation layer in `src/lib/i18n/*`.
- New user-facing copy must not be hardcoded in components in English or Arabic on canonical application surfaces.
- `App.svelte` remounts on language change with `{#key $language}`, and `src/lib/stores/language.js` reapplies `lang`, `dir`, and font settings, so language switching fully re-renders the canonical application UI.
- Mixed-language UI state is not allowed on canonical application surfaces.
- Current exception: `src/pages/Landing.svelte` still contains hardcoded marketing copy and is not yet aligned to this strict contract.

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
- app bootstraps the current session on load before protected content renders
- successful sign-up creates a session immediately in this phase; there is no email-verification holding state
- unauthenticated access to protected routes redirects to `#/sign-in?redirect=<safe-path>`
- authenticated access to `#/`, `#/sign-in`, or `#/sign-up` redirects to the sanitized target or `#/home`
- redirect sanitization only accepts safe internal hash paths and rejects auth-route loops, malformed values, and external URLs
- logout clears frontend auth state, clears session-dependent page cache, and redirects once to `#/sign-in`
- expired or invalid sessions resolve to an unauthenticated state and redirect to `#/sign-in` without rendering stale protected content
- cross-tab auth changes are synchronized through lightweight browser storage events

## API Base Resolution

`src/config.js` resolves the backend base URL in this order:

1. `VITE_API_BASE_URL`
2. host-derived mapping
3. local fallback

Current host-derived mapping:

- Vite dev localhost -> same-origin dev proxy
- local non-dev host -> staging backend
- Vercel preview/stage hosts -> staging backend
- `studymaxing.com`, `www.studymaxing.com`, and production hosts -> production backend

## Maintenance Triggers

Update this file when any of these change:

- canonical study routes or legacy routes
- lifecycle ownership between `Document.processingStatus`, `DocumentGeneration`, and `Job.status (worker-only)`
- page ownership between `StudyHubIndex`, `StudyHubDocument`, `DocumentView`, and `DocumentActivityView`
- shared UI primitive or token ownership
- host-derived API base mapping
- frontend-visible generation contracts, I18N rules, or lifecycle semantics

Last Updated: April 2, 2026
