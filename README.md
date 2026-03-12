# AI Study Assistant Frontend

Svelte 5 + Vite frontend for the AI Study Assistant.

## What the UI does

- Authenticates users through Better Auth cookie sessions
- Uploads PDF/DOCX/PPTX documents
- Tracks extraction status from `Document.processingStatus`
- Triggers on-demand generation for summary, flashcards, and exam content
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
- local host -> `http://localhost:3001`
- Vercel stage/preview host -> staging backend
- Vercel production host -> production backend

## Deployment

- Push to `stage` triggers staging/preview deployment
- Push to `production` triggers production deployment

## Styling Layer Conventions

- `src/lib/styles/tokens.css` is the single source of truth for raw color values, semantic aliases, effect tokens, and theme branching (`[data-theme="light"]`).
- `src/styles/global.css` contains foundation-only rules (reset/base/typography/app chrome/form baseline/focus-visible/selection/scrollbar).
- Feature or component class selectors must not be added to `global.css`.
- `.svelte` component styles should use semantic tokens and keep concerns local (layout/structure/state), avoiding new raw palette/shadow constants.

## Visual Refactor Docs

- Phase 1 audit + Vercel-style target spec: `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`
- Phases 2-5 concise checklist: `docs/PHASES_2_5_VISUAL_MIGRATION_CHECKLIST.md`

## Theme Behavior

- Theme mode is global and supports exactly two values: `dark` and `light`.
- Theme state lives in `src/stores/theme.js`.
- The active theme is persisted in browser `localStorage` under `my-ai-assistant:theme`.
- `index.html` applies persisted theme before app bootstrap to avoid first-paint flicker.
- `src/main.js` calls `theme.initializeTheme()` so runtime state and document attributes stay in sync.

Last Updated: March 12, 2026
