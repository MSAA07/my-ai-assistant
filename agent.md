# Agent Documentation (Frontend)

Contributor guide for `my-ai-assistant`.

## Scope

This file is for frontend contributor behavior only.

For routing, lifecycle ownership, and runtime truth:

- see `SYSTEM_OVERVIEW.md`

For file ownership:

- see `PROJECT_STRUCTURE.md`

For primitive usage:

- see `src/lib/components/ui/PRIMITIVES.md`

## UI System Expectations

- Use primitives in `src/lib/components/ui/*` before creating local one-off controls.
- Use layout primitives in `src/lib/components/layout/*` for shared shell behavior.
- Use semantic tokens from `src/lib/styles/tokens.css`.
- Do not add feature styling to `src/styles/global.css`.
- Keep route and lifecycle wording aligned with `SYSTEM_OVERVIEW.md`.

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`

## Environment

- `VITE_API_BASE_URL` optionally overrides host-derived API resolution in `src/config.js`.

## Documentation Triggers

Update docs when any of these change:

- routing or lifecycle truth: update `SYSTEM_OVERVIEW.md`
- file ownership: update `PROJECT_STRUCTURE.md`
- onboarding/setup: update `README.md`
- primitive usage: update `PRIMITIVES.md`
- rollout status/history: update `UI_POST_ROLLOUT.md` or archival docs
- agent workflow rules: update `agent.md` / `AGENTS.md`

Last Updated: March 23, 2026
