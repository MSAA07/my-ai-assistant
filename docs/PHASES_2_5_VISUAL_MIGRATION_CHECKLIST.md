# Phases 2-5 Visual Migration Checklist

Date: March 23, 2026
Status: Completed archival checklist

This file is an archival rollout record. It is not the current runtime source of truth for routes, lifecycle ownership, or page structure.

## Completed Rollout Summary

- Phase 2 foundations were completed.
- Phase 3 shared shell and primitive normalization was completed.
- Phase 4 core user-facing Study Hub and settings surfaces were completed.
- Phase 5 admin parity and responsive QA pass were completed.
- As of June 7, 2026, the later admin QA tab uses the completed primitive/data-surface system and is documented in the current runtime docs.

## Remaining Verified Deferred Items

- sticky table headers are still not implemented
- visual regression screenshot automation is still not present in the repo
- the fallback non-default shell path still exists behind `VITE_FEATURE_APPSHELL=false`

For current runtime guidance, prefer:

- `../SYSTEM_OVERVIEW.md`
- `../PROJECT_STRUCTURE.md`
- `../UI_POST_ROLLOUT.md`
- `../src/lib/components/ui/PRIMITIVES.md`

Use `../README.md` only as the high-level repo entry point.

Last Updated: June 7, 2026
