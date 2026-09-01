# System Overview (Frontend)

This document describes the current implemented frontend runtime on the synced `stage` codebase. It stays shared across environments and calls out verified stage/production differences only where they affect operation.

## Stack

- Svelte 5
- Vite 7
- Better Auth cookie-session calls
- hash-based routing

## Routing and Shell

Routing files:

- `src/stores/router.js`
- `src/routes.js`
- `src/stores/auth.js`
- `src/App.svelte`

Current behavior:

- The browser hash is the route source of truth.
- `src/stores/router.js` parses hash paths plus hash query params, which is why public section links use forms like `#/?section=features`.
- `App.svelte` resolves the normalized route and renders either the shared public shell or the authenticated shell.
- `AppShell.svelte` is the default authenticated shell.
- `AppHeader.svelte` + `Footer.svelte` remain only for the non-default fallback shell path when `VITE_FEATURE_APPSHELL=false`.
- `PublicHeader.svelte` + `PublicFooter.svelte` wrap the current landing and public auth pages.
- Canonical authenticated study ownership remains under `#/study`.
- Legacy route normalization runs before auth-guard checks, so older document routes still resolve onto canonical study routes before redirect handling.

## Public Routes

Public landing and auth-entry routes:

- `#/`
- `#/sign-in`
- `#/sign-up`

Additional public auth utility routes:

- `#/forgot-password`
- `#/reset-password`
- `#/verify-email`

Public shell behavior:

- `#/` renders `src/pages/Landing.svelte` inside the shared public shell.
- `#/sign-in` and `#/sign-up` render auth cards inside the same public shell, with Study Maxing messaging and CTA framing.
- `#/forgot-password`, `#/reset-password`, and `#/verify-email` also use the same public shell pattern.
- `src/components/public/PublicHeader.svelte` owns Study Maxing branding, section navigation, sign-in/sign-up CTA buttons, and the theme toggle for public pages.
- `src/components/public/PublicFooter.svelte` owns the shared public footer and its public navigation links.
- Landing CTA and footer CTA links route to `#/sign-in` and `#/sign-up`.
- Landing section links use router-safe hash query targets such as `#/?section=features`, `#/?section=how-it-works`, and `#/?section=faq`.
- The theme toggle is available through `PublicHeader.svelte`, so it is present on landing and on the public auth pages that render that header.

## Authenticated Routes

Canonical study routes:

- `#/study`
- `#/study/:id/:section?`

Other authenticated routes:

- `#/home`
- `#/settings`
- `#/admin`
- `#/admin/*`

Legacy routes:

- legacy compatibility only, not primary UX
- `#/legacy/documents/:id/:section?`
- `#/documents-legacy/:id/:section?`

Compatibility normalization also maps older routes like `#/documents/:id/:section?`, `#/document/:id`, `#/flashcards`, and `#/exams` onto the canonical study routes.

## Page Ownership

- `src/pages/Landing.svelte`: public Study Maxing landing page
- `src/components/auth/SignIn.svelte`: sign-in card
- `src/components/auth/SignUp.svelte`: sign-up card
- `src/components/auth/ForgotPassword.svelte`: password reset request card
- `src/components/auth/ResetPassword.svelte`: password reset completion card
- `src/components/auth/VerifyEmail.svelte`: verification status/resend card
- `src/pages/Home.svelte`: authenticated upload/dashboard entry
- `src/pages/StudyHubIndex.svelte`: canonical Study Hub Library
- `src/pages/StudyHubDocument.svelte`: canonical Study Hub Document
- `src/pages/DocumentView.svelte`: legacy route wrapper
- `src/lib/components/study/DocumentActivityView.svelte`: shared summary/flashcards/exam activity implementation
- `src/pages/Settings.svelte`: settings and preferences
- `src/components/AdminDashboard.svelte`: admin console
- `src/components/admin/AdminQA.svelte`: admin QA runner, progress, history, failure report, and automatic health-monitor UI

Important distinction:

- The public shell is now a first-class implementation surface, but it does not own authenticated study flow.
- Canonical study routes remain the user-facing route model after sign-in.
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
- flashcards and exam activity surfaces can send ready canonical study content to Telegram through:
  - `GET /api/telegram/status`
  - `POST /api/telegram/link-token`
  - `POST /api/document/:id/telegram/flashcards/send`
  - `POST /api/document/:id/telegram/exam/send`
- Summary does not expose Telegram delivery actions

Settings:

- `Settings.svelte` loads Telegram connection state from `GET /api/telegram/status`
- users can create a Telegram deep link with `POST /api/telegram/link-token`, refresh status after pressing Start in Telegram, or disconnect with `DELETE /api/telegram/link`

Admin:

- admin user list/detail views display read-only Telegram connection and delivery usage fields returned by the admin user APIs
- the Users tab consumes backend `limit`/`offset`/`total` pagination, distinguishes page selection from all-filtered selection, and previews server-side eligibility before typed bulk confirmation
- user detail is a right-side drawer whose Profile, Files, Sessions, Limits, and Usage sections load and retry independently
- shared stacked toasts report every Users mutation, while the shared confirmation modal supports severity and optional exact typed confirmation
- support login requires a reason, refreshes into a 60-minute impersonated session, and displays a persistent viewing-as banner until the admin session is restored
- `AdminDashboard.svelte` exposes one Security & Access tab in place of the former separate Sessions and Audit Logs tabs
- `SecurityAccess.svelte` switches in place between Sessions and Audit Logs; Sessions has live KPIs, user filtering, pagination, typed bulk revoke, and optimistic revoke counts, while Audit Logs has All/Admin Activity, backend-derived actions, date/user filters, pagination, and accessible inline before/after expansion
- Users and Security & Access deep-link bidirectionally through `#/admin/users?userId=…` and `#/admin/security?view=…&userId=…`; admin names in Admin Activity filter to that actor's activity
- `AdminQA.svelte` calls `GET /api/admin/qa/history`, `GET /api/admin/qa/progress`, `GET /api/admin/qa/schedule`, and `POST /api/admin/qa/schedule`
- `AdminQA.svelte` can start `POST /api/admin/qa/health`, `POST /api/admin/qa/pipeline`, and `POST /api/admin/qa/full`
- the QA tab is locked to a fixed staging target and displays Auto Health Monitor controls, tier cards, active progress, persisted run history, per-test details, speed verdicts, and copyable failure reports
- every QA-tab request uses the required, staging-validated `VITE_QA_STAGING_API_BASE_URL`; it never inherits the app-wide backend URL
- health, pipeline, optimized full, and full labels are frontend-visible tier states; cooldown text is returned from the backend and displayed through the `adminQA` translation namespace

## I18N Rules

- Canonical authenticated application surfaces must route user-facing copy through the translation layer in `src/lib/i18n/*`.
- New user-facing copy must not be hardcoded in components in English or Arabic on canonical authenticated application surfaces.
- `App.svelte` remounts on language change with `{#key $language}`, and `src/lib/stores/language.js` reapplies `lang`, `dir`, and font settings, so language switching fully re-renders the canonical application UI.
- Mixed-language UI state is not allowed on canonical authenticated application surfaces.
- Telegram UI labels use the translation layer; generated flashcard/exam content sent to Telegram is not translated by the frontend.
- Admin QA copy uses the `adminQA` translation namespace in `src/lib/i18n/en.js` and `src/lib/i18n/ar.js`.
- The refreshed public landing and auth shell currently contain product copy directly in `Landing.svelte` and `App.svelte`; that public copy is implemented and intentional in the current stage build.

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
- `ModalSurface`
- `ThemeToggle`
- `LanguageToggle`
- `Toggle`

Integration API wrappers:

- `src/lib/api/studyHub.js` owns authenticated study API calls with `credentials: include`, including Telegram status/link/disconnect/send wrappers.

## Theme and Session

Theme:

- owned by `src/stores/theme.js`
- values: `dark`, `light`
- persisted in `localStorage` key `my-ai-assistant:theme`
- initialized before and during app bootstrap to keep DOM and store aligned
- used by both the shared public shell and the authenticated shell

Session:

- owned by `src/stores/auth.js`
- Better Auth endpoints are called with `credentials: include`
- app bootstraps the current session on load before protected content renders
- unauthenticated access to protected routes redirects to `#/sign-in?redirect=<safe-path>`
- authenticated access to `#/`, `#/sign-in`, or `#/sign-up` redirects to the sanitized target or `#/home`
- redirect sanitization only accepts safe internal hash paths and rejects auth-route loops, malformed values, and external URLs
- sign-in restores the Better Auth session when credentials succeed
- sign-in can route users to `#/verify-email` when the backend reports `email_verification_required`
- sign-up currently routes to `#/verify-email` with a verification-pending state; it does not immediately enter the authenticated shell
- verification and password reset links hand off through same-origin callback URLs by default, then re-enter the hash router via `/?auth_action=verify-email` and `/?auth_action=reset-password`
- logout clears frontend auth state, clears session-dependent page cache, and redirects once to `#/sign-in`
- expired or invalid sessions resolve to an unauthenticated state and redirect to `#/sign-in` without rendering stale protected content
- cross-tab auth changes are synchronized through lightweight browser storage events

## API Base Resolution

`src/config.js` resolves the backend base URL in this order:

1. `VITE_API_BASE_URL`
2. host-derived mapping
3. local fallback

Shared behavior:

- Vite dev on `localhost` or `127.0.0.1` uses same-origin dev proxy behavior
- local non-dev hostnames resolve to the staging backend
- unknown non-local hosts fall back to the production backend

Stage:

- Vercel preview and stage-like hosts for this frontend resolve to `https://ai-assistant-backend-staging.up.railway.app`

Production:

- `studymaxing.com`
- `www.studymaxing.com`
- `my-ai-assistant.vercel.app`
- production-like hosts including names containing `git-production`

These resolve to `https://ai-assistant-backend-production-ddf0.up.railway.app`

Environment differences:

- The verified long-term environment difference in this repo is frontend host to backend mapping.
- Support email, Turnstile site key, and auth callback URLs are environment-configurable through env vars, but this codebase alone does not verify distinct stage versus production values.

Environment variables used by the frontend:

- `VITE_API_BASE_URL`
- `VITE_QA_STAGING_API_BASE_URL` (required for the QA tab; must identify an HTTPS staging host)
- `VITE_AUTH_SUPPORT_EMAIL`
- `VITE_AUTH_TURNSTILE_SITE_KEY`
- `VITE_AUTH_VERIFICATION_CALLBACK_URL`
- `VITE_AUTH_PASSWORD_RESET_CALLBACK_URL`
- `VITE_FEATURE_APPSHELL`

## Maintenance Triggers

Update this file when any of these change:

- public shell ownership or public auth routes
- canonical study routes or legacy routes
- lifecycle ownership between `Document.processingStatus`, `DocumentGeneration`, and `Job.status (worker-only)`
- page ownership between landing/auth/public components and authenticated study surfaces
- shared UI primitive or token ownership
- host-derived API base mapping
- frontend-visible auth callbacks, verification flow, I18N rules, or lifecycle semantics
- frontend-visible Telegram connection or delivery behavior
- frontend-visible admin QA routes, tier labels, schedule controls, progress polling, history columns, or failure-report behavior

Last Updated: June 7, 2026
