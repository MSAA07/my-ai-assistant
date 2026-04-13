# UI Post-Rollout Status

Date: April 2, 2026

This file reflects the current verified post-rollout state. It is the current UI status note, not a future rollout plan.

## Current Source of Truth

- Source-of-truth order for current frontend docs is: `SYSTEM_OVERVIEW.md` -> `PROJECT_STRUCTURE.md` -> `UI_POST_ROLLOUT.md` -> `README.md`.
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
- Canonical study routes are the only primary user-facing Study Hub model: `#/study` and `#/study/:id/:section?`.
- `StudyHubIndex.svelte` and `StudyHubDocument.svelte` are the canonical Study Hub surfaces.
- Legacy routes remain for legacy compatibility only, not primary UX.
- Auth validation is field-local and blocks invalid submit for required fields, email format, password minimum length, and sign-up password confirmation.
- Auth requests expose explicit loading and disabled states to prevent duplicate submission.
- Session bootstrap gates protected rendering, so protected content does not flash before restore resolves.
- Logout clears frontend auth state and session-dependent page cache before redirecting to `#/sign-in`.
- Redirect handling only accepts safe internal app paths and rejects auth-page loops and external targets.
- The completed backend prompt-engineering rollout did not require new frontend screens, route changes, or contract-specific UI branches.
- Canonical study surfaces use `Document.processingStatus` and `DocumentGeneration` as UI truth; `Job.status (worker-only)` remains execution tracking only.

## Loading and Progress Rules

- Progress must be monotonic once a canonical Study Hub generation run starts; the displayed value must never decrease during the same run.
- No flickering between loading and ready components is allowed while generation is active; feature cards stay stable and swap state only when `DocumentGeneration` or content readiness changes.
- Progress interpolates smoothly through visual phases instead of jumping directly from low intermediate values to completion.
- The UI must not depend directly on `Job.progressPct` spikes. Raw job progress is capped, smoothed, and checked against `Document.processingStatus` and `DocumentGeneration`.
- `Home.svelte` uses staged weighted progress for the guided upload flow, and `StudyHubDocument.svelte` uses per-feature capped interpolation for in-document generation progress.

I18N rules and the current landing-page exception are documented in `SYSTEM_OVERVIEW.md`.

## Remaining Verified Deferred Items

- Sticky table headers are not implemented for dense admin/data tables.
- Visual regression screenshot automation is not present in the repo.
- The legacy non-default shell path still exists through `AppHeader.svelte` when `VITE_FEATURE_APPSHELL=false`.
- `Landing.svelte` still contains hardcoded marketing copy and is not yet aligned to the strict canonical i18n contract.

Last Updated: April 2, 2026
