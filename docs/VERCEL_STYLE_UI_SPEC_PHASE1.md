# Phase 1 UI Audit and Spec

Date: March 23, 2026
Status: Archival design-spec record

This file is preserved as the historical phase-1 audit/spec that preceded the visual rollout. It should not be treated as the current runtime source of truth.

## What This Document Represents

- the pre-rollout audit of the old frontend styling system
- the target visual direction that guided the migration
- the reasoning behind moving to token-led, primitive-first UI composition

## What Now Owns Current Runtime Truth

Use these files for the current implemented state instead:

- `../SYSTEM_OVERVIEW.md`
- `../PROJECT_STRUCTURE.md`
- `../UI_POST_ROLLOUT.md`
- `../src/lib/components/ui/PRIMITIVES.md`
- `../src/lib/components/ui/DATA_SURFACE_PATTERN.md`

Use `../README.md` only as the high-level repo entry point.

## Still-Deferred Items Verified in Repo

- sticky table headers are not implemented
- visual regression screenshot automation is not present
- the fallback non-default shell path remains available when `VITE_FEATURE_APPSHELL=false`
- the admin QA tab added after this audit now uses the same primitive-first composition model and is documented in current runtime docs

Last Updated: June 7, 2026
