# UI Post-Rollout Status

Date: June 7, 2026

This file reflects the current verified post-rollout UI state from the synced `stage` codebase. It is a current-state note, not a future rollout plan.

## Current Source of Truth

- Source-of-truth order for current frontend docs is: `SYSTEM_OVERVIEW.md` -> `PROJECT_STRUCTURE.md` -> `UI_POST_ROLLOUT.md`.
- `README.md` is the high-level repo entry point, not the runtime source of truth.
- `src/lib/styles/tokens.css` is the default token source of truth.
- `src/styles/global.css` is foundation-only.
- `src/lib/components/ui/*` is the default shared UI primitive layer.
- `src/lib/components/layout/*` owns the shared authenticated shell.
- `src/components/public/*` owns the shared public shell chrome used by landing and current public auth pages.
- `PageHeader`, `DocumentCard`, `StudyActionCard`, `DataSurface`, and related primitives are the default composition tools for shared application surfaces.

Route ownership and lifecycle behavior are documented in `SYSTEM_OVERVIEW.md`.

## Verified Current UI State

- The app ships with a refreshed public marketing/auth surface and the post-rollout primitive-first authenticated shell.
- `PublicHeader.svelte` and `PublicFooter.svelte` are real implementation surfaces and are the shared wrappers for landing plus public auth pages.
- Study Maxing naming is present on the public landing and public auth shell.
- Landing CTA routing uses `#/sign-in` and `#/sign-up`.
- Landing section navigation uses router-safe hash query links such as `#/?section=features`.
- The theme toggle is available on landing and on the public auth pages through `PublicHeader.svelte`.
- The authenticated shell remains separate from the public shell.
- Canonical study routes are the only primary user-facing Study Hub model: `#/study` and `#/study/:id/:section?`.
- `StudyHubIndex.svelte` and `StudyHubDocument.svelte` are the canonical Study Hub surfaces.
- Legacy routes remain for legacy compatibility only, not primary UX.
- Auth validation is field-local and blocks invalid submit for required fields, email format, password minimum length, and sign-up password confirmation.
- Auth requests expose explicit loading and disabled states to prevent duplicate submission.
- Session bootstrap gates protected rendering, so protected content does not flash before restore resolves.
- Sign-up currently flows into verification-pending UI instead of directly opening the authenticated shell.
- Sign-in can route into verification UI when the backend reports that verification is still required.
- Logout clears frontend auth state and session-dependent page cache before redirecting to `#/sign-in`.
- Redirect handling only accepts safe internal app paths and rejects auth-page loops and external targets.
- Canonical study surfaces use `Document.processingStatus` and `DocumentGeneration` as UI truth; `Job.status (worker-only)` remains execution tracking only.
- The admin console includes a QA tab with target selection, Auto Health Monitor controls, health/pipeline/full tier cards, active progress, persisted run history, per-test breakdowns, speed verdicts, and copyable failure reports.
- The QA tab uses shared primitives including `PageLayout`, `PageHeader`, `Tabs`, `Card`, `DataSurface`, `FieldShell`, `Button`, `Badge`, `Toggle`, and `ModalSurface`.

## Loading and Progress Rules

- Progress must be monotonic once a canonical Study Hub generation run starts; the displayed value must never decrease during the same run.
- No flickering between loading and ready components is allowed while generation is active; feature cards stay stable and swap state only when `DocumentGeneration` or content readiness changes.
- Progress interpolates smoothly through visual phases instead of jumping directly from low intermediate values to completion.
- The UI must not depend directly on `Job.progressPct` spikes. Raw job progress is capped, smoothed, and checked against `Document.processingStatus` and `DocumentGeneration`.
- `Home.svelte` uses staged weighted progress for the guided upload flow, and `StudyHubDocument.svelte` uses per-feature capped interpolation for in-document generation progress.

## Environment Notes

Stage:

- stage and preview hosts use the same shared UI runtime as production
- verified long-term difference is that stage-style frontend hosts resolve to the staging backend by default

Production:

- production uses the same shared UI runtime as stage
- verified long-term difference is that production hosts resolve to the production backend by default

Environment differences:

- there is no verified long-term visual split between stage and production in this repo
- support email, Turnstile key, and auth callback URLs are env-driven, but this repo does not verify distinct values per environment

## Remaining Verified Deferred Items

- Sticky table headers are not implemented for dense admin/data tables.
- Visual regression screenshot automation is not present in the repo.
- The legacy non-default shell path still exists through `AppHeader.svelte` when `VITE_FEATURE_APPSHELL=false`.
- `PublicFooter.svelte` is implemented and shared, but several footer content areas still contain explicit placeholder copy.
- The refreshed public shell copy is implemented directly in the public surface components rather than through the authenticated i18n contract.
- The April 2026 admin visual audit is archival and does not include the later QA tab.
- Security & Access now combines the former Sessions and Audit Logs tabs while keeping their data surfaces structurally separate; its live KPI, pagination, cross-link, diff-expansion, typed-confirmation, and toast behavior is covered by the September 2026 rebuild.
- Operations now combines the former Issues and Jobs tabs into a source-isolated incident feed plus an independently loading Jobs & Queue inspector. It includes live open counts, explicit severity/status text, stale-source timestamps, Sentry/Job/Cost·Alert filtering, Copy for Codex acknowledgement, reopenable resolution, bulk actions, queue search/pagination, and requeue toasts.

Last Updated: June 7, 2026
