# Project Structure (Frontend)

This file maps the current `my-ai-assistant` frontend structure from the synced `stage` codebase.

## Shared Documentation Model

- Shared docs are still the correct model.
- The repo structure is mostly environment-agnostic.
- Stage and production differences are documented inline only where deployment mapping or env-driven behavior matters.

## Root Tree

```text
my-ai-assistant/
|-- AGENTS.md
|-- agent.md
|-- README.md
|-- SYSTEM_OVERVIEW.md
|-- PROJECT_STRUCTURE.md
|-- UI_POST_ROLLOUT.md
|-- docs/
|-- audit-screenshots/
|-- index.html
|-- package.json
|-- postcss.config.cjs
|-- svelte.config.js
|-- tailwind.config.js
|-- vite.config.js
`-- src/
```

## `src/` Tree

```text
src/
|-- App.svelte
|-- main.js
|-- config.js
|-- routes.js
|-- components/
|   |-- AdminDashboard.svelte
|   |-- AppHeader.svelte
|   |-- Footer.svelte
|   |-- admin/
|   |-- auth/
|   `-- public/
|-- pages/
|   |-- Landing.svelte
|   |-- Home.svelte
|   |-- StudyHubIndex.svelte
|   |-- StudyHubDocument.svelte
|   |-- DocumentView.svelte
|   |-- Settings.svelte
|   |-- Documents.svelte
|   |-- Flashcards.svelte
|   `-- Exams.svelte
|-- stores/
|   |-- auth.js
|   |-- pageCache.js
|   |-- router.js
|   `-- theme.js
|-- styles/
|   `-- global.css
`-- lib/
    |-- api/
    |   `-- studyHub.js
    |-- components/
    |   |-- layout/
    |   |   |-- ActivityChrome.svelte
    |   |   |-- AppShell.svelte
    |   |   |-- BottomNav.svelte
    |   |   |-- PageLayout.svelte
    |   |   |-- Sidebar.svelte
    |   |   `-- TopBar.svelte
    |   |-- study/
    |   |   |-- DocumentActivityView.svelte
    |   |   `-- StudyActivityShell.svelte
    |   `-- ui/
    |-- config/
    |-- i18n/
    |-- stores/
    |-- styles/
    `-- utils/
```

## Responsibility Map

Routing and app entry:

- `src/App.svelte`: top-level route resolution, public-shell rendering, auth gating, authenticated shell selection, and auth callback bridge handling
- `src/main.js`: bootstrap and theme initialization
- `src/routes.js`: public routes, canonical study routes, legacy routes, redirect normalization, and redirect sanitization helpers
- `src/stores/router.js`: hash parsing, hash query parsing, and navigation store

Public marketing and auth shell:

- `src/pages/Landing.svelte`: Study Maxing landing content and section targets
- `src/components/public/PublicHeader.svelte`: public brand bar, theme toggle, public section links, and auth CTA routing
- `src/components/public/PublicFooter.svelte`: shared public footer and footer navigation
- `src/components/auth/SignIn.svelte`: sign-in card surface
- `src/components/auth/SignUp.svelte`: sign-up card surface
- `src/components/auth/ForgotPassword.svelte`: password reset request flow
- `src/components/auth/ResetPassword.svelte`: password reset completion flow
- `src/components/auth/VerifyEmail.svelte`: email verification status and resend flow

Canonical authenticated study flow:

- `src/pages/Home.svelte`: authenticated upload entry plus guided post-upload selection and progress flow for single-document uploads
- `src/pages/StudyHubIndex.svelte`: canonical Study Hub Library
- `src/pages/StudyHubDocument.svelte`: canonical Study Hub Document and canonical section handoff

Legacy routes:

- legacy compatibility only, not primary UX
- `src/pages/DocumentView.svelte`: legacy route wrapper
- `src/lib/components/study/DocumentActivityView.svelte`: shared activity implementation used by canonical study routes and legacy routes

Shared UI system:

- `src/lib/styles/tokens.css`: tokens and theme semantics
- `src/styles/global.css`: resets and base-only rules
- `src/lib/components/layout/*`: authenticated shell primitives
- `src/lib/components/ui/*`: shared UI primitives

Data and integration:

- `src/stores/auth.js`: Better Auth session bootstrap, verification/reset callback handling, auth actions, and redirect behavior
- `src/stores/theme.js`: theme persistence and DOM sync
- `src/stores/pageCache.js`: page-level caching helpers
- `src/config.js`: backend resolution, support email, Turnstile site key, and auth callback URL helpers
- `src/lib/api/studyHub.js`: wrappers for canonical study APIs, legacy compatibility writes, and guided upload polling helpers for `/api/document/:id` and `/api/jobs/:id`

## Notes on Legacy Files

- `Documents.svelte`, `Flashcards.svelte`, and `Exams.svelte` are non-canonical legacy compatibility files, not primary UX.
- `DocumentView.svelte` is the only legacy route surface that remains connected to current canonical study behavior.
- `AppHeader.svelte` and `Footer.svelte` remain only for the shell fallback path when `VITE_FEATURE_APPSHELL=false`.

## Environment Mapping Notes

Stage:

- deployment-specific backend mapping is selected in `src/config.js`
- Vercel preview and stage-style hosts resolve to the staging backend unless `VITE_API_BASE_URL` overrides them

Production:

- production hosts also resolve in `src/config.js`
- `studymaxing.com`, `www.studymaxing.com`, and `my-ai-assistant.vercel.app` are explicitly treated as production frontend hosts

Environment differences:

- there is no separate stage-only or production-only source tree in this repo
- verified differences are env and host mapping concerns, not divergent component ownership

## Docs in This Repo

- `SYSTEM_OVERVIEW.md`: primary runtime and lifecycle source of truth
- `PROJECT_STRUCTURE.md`: file and folder ownership source of truth
- `UI_POST_ROLLOUT.md`: current UI state, constraints, and guarantees
- `README.md`: high-level entry only; should defer detail to the three files above
- `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`: archival phase-1 audit/spec, not current runtime source of truth
- `docs/PHASES_2_5_VISUAL_MIGRATION_CHECKLIST.md`: archival rollout checklist, not current runtime source of truth
- `audit-screenshots/admin-ui/ADMIN_UI_AUDIT.md`: archival visual QA evidence for the admin console, not current runtime source of truth

Last Updated: April 30, 2026
