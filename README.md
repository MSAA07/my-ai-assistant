# AI Study Assistant Frontend

Svelte 5 + Vite frontend for the AI Study Assistant.

The current frontend has completed the v0-style visual migration on top of the existing product flows. Routing, API usage, generation behavior, and admin/settings logic were preserved; the work focused on shell/layout, shared UI primitives, tokens, and page composition.

## What the UI does

- Authenticates users through Better Auth cookie sessions
- Uploads PDF/DOCX/PPTX documents
- Provides a shared dashboard shell with sidebar, top bar, and mobile bottom navigation
- Tracks extraction status from `Document.processingStatus`
- Triggers on-demand generation for summary, flashcards, and exam content
- Presents a Study Hub library and per-document study workspace
- Renders legacy study activity modes through a single consolidated `DocumentView.svelte`
- Displays source excerpts from `/api/document/:id/excerpts`

## Lifecycle model used by the UI

Extraction state source of truth:
- `queued`
- `processing`
- `complete`
- `failed`

Generation state source of truth:
- `document.generationState.summary`
- `document.generationState.flashcards`
- `document.generationState.exam`

`/api/jobs/:id` is used for worker status polling, but page rendering is based on document + generation state.

## Backend endpoints used by the frontend

Auth:
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `GET /api/auth/get-session`
- `POST /api/auth/sign-out`

Core:
- `GET /api/user/me`
- `POST /api/upload`
- `GET /api/document/:id`
- `DELETE /api/document/:id`
- `GET /api/document/:id/excerpts`
- `POST /api/document/:id/generations`
- `GET /api/document/:id/generations`
- `GET /api/jobs/:id`
- `POST /api/flashcard/progress`
- `POST /api/exam/attempt`

## Local development

Install:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Environment

Primary frontend env var:
- `VITE_API_BASE_URL`

If `VITE_API_BASE_URL` is not set, the app derives API base from hostname in `src/config.js`:
- local host -> staging backend (`https://ai-assistant-backend-staging.up.railway.app`)
- Vercel stage/preview host -> staging backend
- Vercel production host -> production backend

To run the frontend locally against a different backend, override `VITE_API_BASE_URL` before starting Vite.

## Deployment

- Push to `stage` triggers staging/preview deployment
- Push to `production` triggers production deployment

## Styling Layer Conventions

- TailwindCSS 3 is installed for utility usage, but semantic design tokens remain the source of truth.
- `src/lib/styles/tokens.css` is the single source of truth for raw color values, semantic aliases, effect tokens, and theme branching (`[data-theme="light"]`).
- `src/styles/global.css` contains foundation-only rules (reset/base/typography/app chrome/form baseline/focus-visible/selection/scrollbar).
- Feature or component class selectors must not be added to `global.css`.
- `.svelte` component styles should use semantic tokens and keep concerns local (layout/structure/state), avoiding new raw palette/shadow constants.

## Current frontend structure

Shared shell:
- `src/lib/components/layout/AppShell.svelte`
- `src/lib/components/layout/Sidebar.svelte`
- `src/lib/components/layout/TopBar.svelte`
- `src/lib/components/layout/BottomNav.svelte`

Shared UI primitives:
- `src/lib/components/ui/Button.svelte`
- `src/lib/components/ui/Card.svelte`
- `src/lib/components/ui/Badge.svelte`
- `src/lib/components/ui/StatusBadge.svelte`
- `src/lib/components/ui/Tabs.svelte`
- `src/lib/components/ui/Toggle.svelte`
- `src/lib/components/ui/StatCard.svelte`
- `src/lib/components/ui/MetaPill.svelte`
- `src/lib/components/ui/Section.svelte`
- `src/lib/components/ui/DataSurface.svelte`

Primary page ownership:
- `src/pages/Home.svelte`: dashboard landing + upload workflow
- `src/pages/StudyHubIndex.svelte`: Study Hub library
- `src/pages/StudyHubDocument.svelte`: document hub and study tool launch surface
- `src/pages/DocumentView.svelte`: consolidated summary/flashcards/exam study states for legacy activity routes
- `src/pages/Settings.svelte`: settings/account/theme/language
- `src/components/AdminDashboard.svelte`: admin shell and tabbed admin console

Important route note:
- Existing business logic and route normalization are intentionally preserved in `src/routes.js`.
- Canonical document browsing is `/study` and `/study/:id/:section?`.
- Legacy activity detail remains `/legacy/documents/:id/:section?` and is rendered by `DocumentView.svelte`.

## Visual Refactor Docs

- Phase 1 audit + Vercel-style target spec: `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`
- Phases 2-5 concise checklist: `docs/PHASES_2_5_VISUAL_MIGRATION_CHECKLIST.md`

## Theme Behavior

- Theme mode is global and supports exactly two values: `dark` and `light`.
- Theme state lives in `src/stores/theme.js`.
- The active theme is persisted in browser `localStorage` under `my-ai-assistant:theme`.
- `index.html` applies persisted theme before app bootstrap to avoid first-paint flicker.
- `src/main.js` calls `theme.initializeTheme()` so runtime state, `data-theme`, and the `.dark` class stay in sync.

Last Updated: March 13, 2026
