# Project Structure (Frontend)

This file maps the current `my-ai-assistant` structure.

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
|   `-- auth/
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

- `App.svelte`: auth gating, route resolution, shell selection
- `main.js`: bootstrap and theme initialization
- `routes.js`: canonical study routes, legacy routes, compatibility redirects
- `stores/router.js`: hash parsing and navigation store

Canonical study flow:

- `pages/Home.svelte`: authenticated upload entry plus guided post-upload selection and progress flow for single-document uploads
- `pages/StudyHubIndex.svelte`: canonical Study Hub Library
- `pages/StudyHubDocument.svelte`: canonical Study Hub Document and canonical section handoff

Legacy routes:

- legacy compatibility only, not primary UX
- `pages/DocumentView.svelte`: legacy route wrapper
- `lib/components/study/DocumentActivityView.svelte`: shared activity implementation used by canonical study routes and legacy routes

Shared UI system:

- `lib/styles/tokens.css`: tokens and theme semantics
- `styles/global.css`: resets and base-only rules
- `lib/components/layout/*`: authenticated shell primitives
- `lib/components/ui/*`: shared UI primitives

Data and integration:

- `stores/auth.js`: Better Auth session bootstrap and auth actions
- `stores/theme.js`: theme persistence and DOM sync
- `stores/pageCache.js`: page-level caching helpers
- `lib/api/studyHub.js`: wrappers for canonical study APIs, legacy compatibility writes, and guided upload polling helpers for `/api/document/:id` and `/api/jobs/:id`
- backend prompt/routing rollout metadata does not require new frontend API wrappers or route branching

## Notes on Legacy Files

- `Documents.svelte`, `Flashcards.svelte`, and `Exams.svelte` are non-canonical legacy compatibility files, not primary UX.
- `DocumentView.svelte` is the only legacy route surface that remains connected to current canonical study behavior.
- `AppHeader.svelte` remains only for the shell fallback path when `VITE_FEATURE_APPSHELL=false`.

## Docs in This Repo

- `SYSTEM_OVERVIEW.md`: primary runtime and lifecycle source of truth
- `PROJECT_STRUCTURE.md`: file and folder ownership source of truth
- `UI_POST_ROLLOUT.md`: current UI state, constraints, and guarantees
- `README.md`: high-level entry only; should defer detail to the three files above
- `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`: archival phase-1 audit/spec, not current runtime source of truth
- `docs/PHASES_2_5_VISUAL_MIGRATION_CHECKLIST.md`: archival rollout checklist, not current runtime source of truth

Last Updated: April 2, 2026
