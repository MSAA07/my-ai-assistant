# Frontend Agent Rulebook

Single source of truth for AI-driven work in `my-ai-assistant/`. Follow this file before making changes.

## Purpose

- Optimize for safe, incremental frontend execution.
- Preserve backend contracts and runtime-critical behavior.
- Enforce one shared UI system across the app.
- Keep future prompts short by centralizing rules here.

## Project Snapshot

### Stack

- Svelte 5.53.7
- Vite 7.3.1
- TailwindCSS 3.4 + PostCSS
- Better Auth client calls over cookie sessions

### Key Runtime Behavior

- Hash routes are normalized and resolved in `src/routes.js`.
- Session is bootstrapped in `src/stores/auth.js`.
- API base URL is resolved in `src/config.js` from `VITE_API_BASE_URL` or approved host-derived defaults.
- `src/lib/components/layout/AppShell.svelte` is the shared authenticated dashboard frame.
- `src/pages/StudyHubIndex.svelte` and `src/pages/StudyHubDocument.svelte` are the canonical Study Hub surfaces for `#/study` and `#/study/:id/:section?`.
- `src/pages/DocumentView.svelte` is a legacy compatibility wrapper only.
- `src/lib/components/study/DocumentActivityView.svelte` owns the shared summary, flashcards, and exam activity implementation used by canonical and legacy surfaces.
- `src/components/admin/AdminQA.svelte` owns the connected admin QA tab for `/api/admin/qa/*`.

### Important Flows

1. Auth
- Sign in and sign up via `/api/auth/*/email`.
- Store session in the Svelte auth store.

2. Upload
- `src/pages/Home.svelte` posts multipart form data to `/api/upload`.
- On success, the guided upload flow can request generation and then hands off to `#/study/:documentId`.

3. Document Processing and Generation
- Poll `GET /api/document/:id` while extraction or generation is active.
- Load excerpts from `/api/document/:id/excerpts`.
- Queue on-demand generation with `POST /api/document/:id/generations`.
- Treat `Document.processingStatus`, `DocumentGeneration` via `document.generationState`, and compatibility content together as readiness truth.
- Treat `Job.status` and `/api/jobs/:id` as execution/progress visibility only.

4. Learning Interactions
- Save flashcard progress with `/api/flashcard/progress`.
- Save exam attempts with `/api/exam/attempt`.

5. Admin QA
- Use `src/components/admin/AdminQA.svelte` for health, pipeline, optimized full, and full QA UI.
- Read history/progress/schedule through `/api/admin/qa/history`, `/api/admin/qa/progress`, and `/api/admin/qa/schedule`.
- Start runs through `/api/admin/qa/health`, `/api/admin/qa/pipeline`, and `/api/admin/qa/full`.
- Keep QA copy in the `adminQA` i18n namespace.

### Folder Map

- `src/pages`: route-level containers and page behavior
- `src/components`: auth and admin feature components
- `src/lib/components/layout`: shared shell and navigation structure
- `src/lib/components/ui`: reusable design-system primitives and dense data surfaces
- `src/lib/components/study`: shared study-mode behavior and shells
- `src/lib/styles/tokens.css`: canonical design tokens
- `src/stores`: auth, router, and global UI state
- `src/lib/i18n`: dictionaries and translation helpers

### Current Page Ownership

- `Home.svelte`: dashboard landing, stats, and upload surface
- `StudyHubIndex.svelte`: library grid of uploaded documents
- `StudyHubDocument.svelte`: document hub with Summary, Flashcards, and Mock Exam entry points
- `DocumentView.svelte`: legacy compatibility route wrapper only
- `DocumentActivityView.svelte`: shared summary, flashcards, and exam activity states
- `Settings.svelte`: account, theme, and language settings
- `AdminDashboard.svelte`: admin shell and tabs
- `AdminQA.svelte`: admin QA runner, Auto Health Monitor, progress, history, speed verdicts, and failure reports

## Priority Order

When tradeoffs exist, decide in this order:

1. System safety
2. API and backend stability
3. UI consistency
4. Code cleanliness

## Prompt Dependency Rule

- Always follow `agent.md` before executing any task.
- Treat this file as the highest-priority instruction source for frontend execution.
- If a prompt conflicts with this file, prioritize:

1. System safety
2. Backend and API protection
3. Then prompt instructions

## Mandatory Pre-Execution Rules

- Always confirm the active git branch before implementation.
- Treat `stage` as the staging branch unless the user explicitly says otherwise.
- Always sync with the latest remote state of the staging branch before making changes intended for staging.
- Never work from stale local files. Pull or otherwise refresh local branch state first.
- If the branch, remote state, or deployment target is unclear, stop and clarify before editing.
- Scope the task before coding: identify the exact files, pages, and shared components involved.

## Task Classification

Before implementing any task, classify it as one of:

- `UI Polish`: visual-only work with no logic or API changes
- `Feature`: new functionality that may involve frontend and, if explicitly requested, backend work
- `System/Component`: shared component, design-system, or shared shell change

Behavior rules:

- `UI Polish` -> do not touch logic, state behavior, or APIs.
- `Feature` -> modify only the necessary areas required to deliver the requested functionality.
- `System/Component` -> modify shared components and shared systems, not individual pages, unless page wiring is strictly required.

## System Safety Rules (Critical)

- Do not change API contracts unless the user explicitly requests it.
- Do not modify database schema, migrations, or Prisma models unless the user explicitly requests it.
- Do not break authentication, cookie sessions, or session bootstrap behavior.
- Preserve document lifecycle exactly: `queued -> processing -> complete | failed`.
- Do not change job lifecycle states, transitions, or backend job semantics.
- Do not introduce frontend behavior that assumes new backend fields, new statuses, or new endpoints without approval.
- For existing admin QA endpoints, preserve current tier labels, cooldown handling, progress polling, schedule controls, and failure-report rendering unless the backend contract is explicitly changed.
- Do not use `Job.status` or `/api/jobs/:id` as canonical readiness truth for Study Hub content.

## Frontend Architecture Rules

- All UI must use `src/lib/styles/tokens.css` as the visual foundation.
- Build with shared primitives from `src/lib/components/ui/`.
- Build page and shell structure from `src/lib/components/layout/`.
- Prefer existing study components in `src/lib/components/study/` over new parallel implementations.
- Do not introduce page-specific styling unless it is truly necessary and cannot be expressed through shared primitives.
- Avoid inline styles and one-off CSS.
- Prefer shared primitives over custom implementations.
- If an existing primitive is close but incomplete, extend it carefully instead of creating a duplicate pattern.

## Layout and Shell Rules

- Sidebar must remain fixed or sticky.
- Sidebar must remain collapsible.
- All pages must use a consistent container system.
- Do not allow layout drift between pages.
- Header structure, spacing, and alignment must remain consistent across the app.
- New page work must fit within the established shell, not bypass it with isolated layout logic.

## Study Feature Rules

- Summary, Flashcards, and Exam must share one layout system.
- Do not create separate UI systems for each study mode.
- Preserve generation state behavior.
- Preserve flashcard progress behavior.
- Preserve exam attempts behavior.
- Keep document hub and study activity flows visually and structurally aligned.

## Backend Communication Rules

- Always send authenticated API requests with `credentials: "include"`.
- Source API URLs from `src/config.js` via `API_BASE`, which is backed by `VITE_API_BASE_URL`.
- Do not hardcode backend URLs in pages, components, stores, or utilities.
- Do not bypass the existing API base resolution strategy with ad hoc environment handling.

## Component System Rules

- Reuse shared components whenever possible.
- If a pattern repeats, convert it into a shared component.
- Keep component APIs small, predictable, and reusable.
- Prefer composition over special-case props that only serve one page.
- Before adding a new component, check whether `ui`, `layout`, or `study` already contains the needed pattern.

## Strict Scope Enforcement

- Only modify files explicitly mentioned in the task scope.
- Do not edit additional files unless absolutely required to complete the task safely.
- If additional files are needed, explicitly state them before modifying them.
- Do not refactor unrelated components, pages, or utilities.
- Do not expand a page-level task into a shared-system rewrite unless the task is classified as `System/Component`.

## Allowed vs Not Allowed Changes

### Allowed

- UI refactors
- Component improvements
- Layout standardization
- Shared primitive improvements that reduce duplication without changing contracts

### Not Allowed

- Backend logic changes unless explicitly requested
- Schema changes
- API contract changes
- Auth or session model changes unless explicitly requested

## Task Execution Rules

For every task:

- Clearly identify scope before editing.
- Do not modify unrelated areas.
- Keep changes minimal, controlled, and reversible.
- Prefer incremental updates over large rewrites.
- Preserve existing behavior unless the task explicitly calls for behavior change.
- If a requested change touches shared foundations, update the smallest safe layer that fixes the problem globally.

## Anti-Overengineering Rules

- Do not introduce new abstractions unless necessary.
- Do not rewrite components if a small change solves the problem.
- Do not restructure folders or architecture unless explicitly requested.
- Prefer minimal edits over "clean" rewrites.
- Avoid extracting helpers, wrappers, or configuration layers unless they solve a real repeated need in current scope. 

## Minimal Change Strategy

For every task:

- Solve the problem with the smallest possible change.
- Avoid touching working code.
- Avoid cascading edits.
- Prefer targeted updates over broad cleanup passes.

## UI Consistency Enforcement

- All visual elements must follow tokens and shared primitives.
- Do not introduce inconsistent spacing, colors, radii, shadows, or typography.
- Match the established design system and V0-inspired product direction already present in the app.
- Preserve consistency across dashboard, study, settings, and admin surfaces.
- Dense data views should continue using the shared data-surface patterns in `src/lib/components/ui/`.

## UI Change Discipline

- UI changes must reuse existing tokens and shared primitives.
- UI changes must match the existing layout system.
- Do not introduce new spacing systems.
- Do not introduce new color logic.
- Do not create one-off UI patterns.
- If a visual issue can be solved by applying an existing primitive correctly, do that instead of inventing a new pattern.

## When to Stop

- If scope becomes unclear, stop and report before continuing.
- If the required change affects backend behavior or contracts, stop and report unless that backend work was explicitly requested.
- If the change risks breaking core flows such as auth, document processing, study progress, or sessions, stop and report before proceeding.

## Execution Output Requirements

After completing any task, always report:

- Files changed
- Summary of changes
- Risks or edge cases
- What was not changed

## Git and Delivery Rules

- Use `frontend/` as the git working tree root for branch and sync checks.
- Push to `stage` for staging deploy and QA.
- Push to `production` only on explicit request.
- Do not assume local state is current just because files already exist.

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`


## Working Reminder

- Start from the latest staging-aligned branch state.
- Protect contracts and lifecycles first.
- Reuse the shared UI system.
- Keep changes narrow.
- Report exactly what changed and what stayed untouched.

Last Updated: June 7, 2026
