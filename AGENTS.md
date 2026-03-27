# FRONTEND SPECIALIST - AI Study Assistant

Role: Svelte UI, route ownership, session UX, backend API integration, Vercel deployment.

## Scope

This file is for frontend operating instructions, not full runtime reference.

Use these source-of-truth docs instead:

- `SYSTEM_OVERVIEW.md` for routes, lifecycle ownership, and runtime behavior
- `PROJECT_STRUCTURE.md` for file ownership
- `src/lib/components/ui/PRIMITIVES.md` for primitive guidance

## Shared UI System

- tokens source of truth: `src/lib/styles/tokens.css`
- global foundation rules only: `src/styles/global.css`
- shared UI primitives: `src/lib/components/ui/*`
- shared layout primitives: `src/lib/components/layout/*`

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Documentation Triggers

Update docs when:

- runtime truth changes: `SYSTEM_OVERVIEW.md`
- structure changes: `PROJECT_STRUCTURE.md`
- primitive guidance changes: `PRIMITIVES.md`
- agent workflow changes: `AGENTS.md` / `agent.md`

## Study Hub UI Invariants

- Only the actively generating feature card may show live generating or progress UI.
- Completed feature cards must remain visually stable and keep their ready/open CTA while a different feature is generating.
- English and Arabic must use the same lifecycle semantics and labels for Study Hub progress states: `Queued`, `Preparing`, `Generating`, `Ready`, `Failed`.
- Localization must not fork progress smoothing, lifecycle transitions, or feature-card state rules; only copy and layout direction may differ.

Last Updated: March 23, 2026
