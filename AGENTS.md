> [!WARNING]
> # PRODUCTION IS OFF LIMITS BY DEFAULT
>
> This project's staging and production environments are distinguished purely by Railway service naming: `studymaxing-backend-staging` and `studymaxing-worker-staging` are staging; `studymaxing-production` and `studymaxing-worker-production` are production. This is **not** Railway's “Environments” feature—do not rely on that UI concept when determining which service you are touching.
>
> Unless a task's instructions explicitly contain the exact phrase **"production readiness"**, never deploy to, run migrations against, run scripts against, or otherwise write to any production-named service or its database. Never select or default to a production URL or target in any admin, QA, or configuration UI you build or modify. Do not read secrets or environment variables scoped to a production service unless explicitly told to.
>
> If a task is ambiguous about which environment it targets, stop and ask rather than guessing. Do not assume staging is safe to extrapolate to production, and do not infer that the user probably means production from context alone.
>
> This rule applies to every task in this repo, regardless of other task instructions, unless the task instructions contain **"production readiness"**.

# FRONTEND SPECIALIST - AI Study Assistant

Role: Svelte UI, route ownership, session UX, backend API integration, Vercel deployment.

## Scope

This file is for frontend operating instructions, not full runtime reference.

Use these source-of-truth docs instead:

- `SYSTEM_OVERVIEW.md` for routes, lifecycle ownership, and runtime behavior
- `PROJECT_STRUCTURE.md` for file ownership
- `UI_POST_ROLLOUT.md` for current verified UI status
- `README.md` for the high-level repo entry
- `src/lib/components/ui/PRIMITIVES.md` for primitive guidance
- `src/lib/components/ui/DATA_SURFACE_PATTERN.md` for dense admin and QA history surfaces

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
- admin QA UI, tier labels, schedule controls, progress, history, or failure-report behavior changes: `SYSTEM_OVERVIEW.md`, `PROJECT_STRUCTURE.md`, and `UI_POST_ROLLOUT.md`
- agent workflow changes: `AGENTS.md` / `agent.md`

## Study Hub UI Invariants

- Only the actively generating feature card may show live generating or progress UI.
- Completed feature cards must remain visually stable and keep their ready/open CTA while a different feature is generating.
- English and Arabic must use the same lifecycle semantics and labels for Study Hub progress states: `Queued`, `Preparing`, `Generating`, `Ready`, `Failed`.
- Localization must not fork progress smoothing, lifecycle transitions, or feature-card state rules; only copy and layout direction may differ.
- Admin QA UI must keep tier labels, progress, history, Auto Health Monitor, and cooldown messages localized through the `adminQA` namespace.

## UI Quality Rules (do not skip)

- Any `<select>`/`<option>` element must have explicit background-color and color set from design tokens — never rely on browser defaults for dark theme. Test in both Chrome and Safari before claiming done.
- A UI fix is not "verified" until tested with real interaction (manual click or Playwright selectOption on native elements — not raw dispatched input/change events, which are unreliable on custom-bound components).
- Before reporting any UI fix as complete, provide a screenshot AND confirm the deployed bundle hash changed (rule out stale cache as a false negative).
- Do not report a fix as "done" or "verified" unless it was actually confirmed working end-to-end, including checking that state changes actually persist after a page reload.

Last Updated: June 7, 2026
