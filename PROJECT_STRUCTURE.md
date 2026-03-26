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
- `routes.js`: canonical study routes, legacy activity routes, compatibility redirects
- `stores/router.js`: hash parsing and navigation store

Canonical study flow:

- `pages/Home.svelte`: authenticated upload entry
- `pages/StudyHubIndex.svelte`: canonical Study Hub Library
- `pages/StudyHubDocument.svelte`: canonical Study Hub Document and canonical activity-route handoff

Legacy activity flow:

- `pages/DocumentView.svelte`: legacy activity route wrapper
- `lib/components/study/DocumentActivityView.svelte`: actual activity implementation used by both route surfaces

Shared UI system:

- `lib/styles/tokens.css`: tokens and theme semantics
- `styles/global.css`: resets and base-only rules
- `lib/components/layout/*`: authenticated shell primitives
- `lib/components/ui/*`: shared UI primitives

Data and integration:

- `stores/auth.js`: Better Auth session bootstrap and auth actions
- `stores/theme.js`: theme persistence and DOM sync
- `stores/pageCache.js`: page-level caching helpers
- `lib/api/studyHub.js`: wrappers for canonical and legacy study APIs

## Notes on Legacy Files

- `Documents.svelte`, `Flashcards.svelte`, and `Exams.svelte` still exist but are not the canonical Study Hub route ownership.
- `AppHeader.svelte` remains only for the shell fallback path when `VITE_FEATURE_APPSHELL=false`.

## Docs in This Repo

- `README.md`: quick runtime reference
- `SYSTEM_OVERVIEW.md`: routing, lifecycle, UI, API overview
- `PROJECT_STRUCTURE.md`: structure map
- `UI_POST_ROLLOUT.md`: current UI post-rollout state
- `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`: archival phase-1 audit/spec
- `docs/PHASES_2_5_VISUAL_MIGRATION_CHECKLIST.md`: archival rollout checklist

Last Updated: March 23, 2026
