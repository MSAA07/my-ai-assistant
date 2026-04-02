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
- Auth is route-driven through `#/sign-in` and `#/sign-up`; `#/` remains landing-only.
- Auth validation is field-local and blocks invalid submit for required fields, email format, password minimum length, and sign-up password confirmation.
- Auth requests expose explicit loading and disabled states to prevent duplicate submission.
- Session bootstrap gates protected rendering, so protected content does not flash before restore resolves.
- Logout clears frontend auth state and session-dependent page cache before redirecting to `#/sign-in`.
- Redirect handling only accepts safe internal app paths and rejects auth-page loops and external targets.
- The completed backend prompt-engineering rollout did not require new frontend screens, route changes, or contract-specific UI branches.
- Study Hub still relies on the existing document, generation, and job lifecycle surfaces: `Document.processingStatus`, `document.generationState`, and `/api/jobs/:id`.

## Remaining Verified Deferred Items

- Sticky table headers are not implemented for dense admin/data tables.
- Visual regression screenshot automation is not present in the repo.
- The legacy non-default shell path still exists through `AppHeader.svelte` when `VITE_FEATURE_APPSHELL=false`.

Last Updated: March 29, 2026
