# Admin UI Design Audit

Date: 2026-04-29
Status: Archival visual QA evidence

This file preserves one admin-console audit run and its screenshot evidence. It is not a current runtime source of truth. For current frontend ownership and UI guidance, use `../../SYSTEM_OVERVIEW.md`, `../../PROJECT_STRUCTURE.md`, `../../UI_POST_ROLLOUT.md`, and `../../src/lib/components/ui/DATA_SURFACE_PATTERN.md`.

## PASS/FAIL Summary

**UI status: PASS with one fixed P1 issue.**

The Admin console is visually usable at 1440x900, 1280x720, 768x1024, and 390x844 in dark and light themes. Dense tables stay inside `DataSurface` horizontal scroll containers on tablet/mobile, with no page-level horizontal overflow detected.

**Live credential validation: BLOCKED.** The provided credential `admin@ai.ccom / admin123` was rejected by the proxied staging API with `INVALID_EMAIL_OR_PASSWORD`, then rate limited. The visual audit therefore used mocked admin API/session responses against the real Svelte/Vite UI components.

## Tested Sections

- `#/admin` Overview
- `#/admin` Users
- `#/admin` Usage & Cost
- `#/admin` Limits
- `#/admin` Jobs
- `#/admin` Sessions
- `#/admin` Storage
- `#/admin` Audit Logs

No benchmark/evaluation, anomalies, feature flags, or files/documents admin tabs were reachable from the current Admin UI.

## Evidence

- Full automated metrics: `admin-ui-audit-report.json`
- Full matrix screenshots: `dark|light-{desktop-1440x900|laptop-1280x720|tablet-768x1024|mobile-390x844}-{overview|users|usage|limits|jobs|sessions|storage|audit-logs}.png`
- Post-fix Users screenshots:
  - `postfix-dark-desktop-1440x900-users.png`
  - `postfix-dark-mobile-390x844-users.png`
- Credential failure evidence:
  - `login-failure-debug.png`

Automated result: 64 screenshots captured, 0 console errors, 0 page-level overflow findings, 0 clipped non-table controls/text candidates.

## Issues

### P0

None found in the Admin UI surfaces.

### P1

**Fixed: Users table action column partially hidden on desktop with long account data**

- Location/route: `#/admin`, Users tab
- Viewport/theme: 1440x900 desktop, dark theme
- Problem: Long user values caused the Users table to overflow its `DataSurface` container by 90px at desktop width, leaving the rightmost action button partially out of view without horizontal scrolling.
- Expected: At desktop width, common admin actions should remain visible while long user names/emails wrap safely.
- Fix implemented: Tightened Users table local column minimums and allowed email text to wrap with `overflow-wrap: anywhere`.
- Files involved: `src/components/admin/UserTable.svelte`
- Verification: Post-fix desktop Users capture reports `pageOverflowX: 0`, `tableOverflow: 0`.

### P2

None requiring code changes. Tablet/mobile dense tables intentionally use contained horizontal overflow through `DataSurface`.

### P3

Optional future polish: Add a subtle horizontal-scroll affordance to dense tables on mobile. The current behavior is usable and contained, but first-time users may not immediately notice that wide admin tables scroll horizontally.

## Validation Notes

- Loading, empty, and error state structures were present and visually stable in `DataSurface`.
- Light and dark themes both rendered with acceptable hierarchy and contrast in sampled screenshots.
- Focusable controls use visible browser/design-system focus states.
- No backend API contracts, admin authorization behavior, canonical routes, jobs, study records, or document lifecycle code were changed.

Last Updated: April 30, 2026
