# UI Post-Rollout Status

Date: March 23, 2026

This file reflects the current verified post-rollout state. It is the current UI status note, not a future rollout plan.

## Current Source of Truth

- `src/lib/styles/tokens.css` is the default token source of truth.
- `src/styles/global.css` is foundation-only.
- `src/lib/components/ui/*` is the default shared UI primitive layer.
- `src/lib/components/layout/*` owns the shared authenticated shell.
- `PageHeader`, `DocumentCard`, `StudyActionCard`, `DataSurface`, and related primitives are the default composition tools for shared surfaces.

Route ownership and lifecycle behavior are documented in `SYSTEM_OVERVIEW.md`.

## Verified Current UI State

- The app ships with the post-rollout primitive-first shell and page composition.
- Major authenticated screens use the shared shell and shared page header pattern.
- Dense admin views use `DataSurface`.
- Tokens and primitives, not page-local one-off styles, are the default design contract.

## Remaining Verified Deferred Items

- Sticky table headers are not implemented for dense admin/data tables.
- Visual regression screenshot automation is not present in the repo.
- The legacy non-default shell path still exists through `AppHeader.svelte` when `VITE_FEATURE_APPSHELL=false`.

Last Updated: March 23, 2026
