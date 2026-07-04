# Phase 4 Polish Mobile UX Audit - 2026-07-04

## Scope

Audited the remaining Phase 4 polish-sweep components against `https://stage.studymaxing.com` at mobile Chromium viewports `360x800`, `375x812`, `390x844`, and `428x926`, in English and Arabic where the routed surface was available.

Files in scope:

- `src/pages/Documents.svelte`
- `src/pages/Home.svelte`
- `src/pages/LegalDocument.svelte`
- `src/lib/components/layout/Sidebar.svelte`
- `src/lib/components/ui/MetaPill.svelte`
- `src/lib/components/ui/StatCard.svelte`
- `src/lib/components/ui/DataSurface.svelte`
- `src/lib/components/ui/SourceRefsCompact.svelte`

Screenshots and JSON evidence are stored untracked under `mobile-audit-screenshots/phase4-polish/`.

## Executive Summary

Total findings: 5

Severity totals:

| Severity | Count |
| --- | ---: |
| Medium | 2 |
| Low | 3 |
| Critical | 0 |
| High | 0 |

Category totals:

| Category | Count |
| --- | ---: |
| Typography below 14px | 4 |
| Localization/readiness | 1 |
| Tap targets below 44px | 0 in scoped components |
| Page-level horizontal overflow | 0 |
| Fixed bottom safe-area issues | 0 |
| Non-approved accent colors | 0 observed in scoped surfaces |

Overall result:

- `Home.svelte`: passed the scoped mobile checks for the dashboard layout in both populated and empty states. Upload flow internals were intentionally excluded because they were audited separately.
- `LegalDocument.svelte`: mobile layout wraps correctly and the mobile outline uses intentional horizontal scrolling, but outline/meta text renders at 12px.
- `Sidebar.svelte`: not rendered on mobile; desktop sidebar remains visible and already includes bottom safe-area padding.
- `StatCard.svelte`: live admin usage shows 13px label/meta text.
- `DataSurface.svelte`: table overflow handling is correct (`overflow-x: auto`), but table headers render at 12px.
- `MetaPill.svelte` and `SourceRefsCompact.svelte`: no routed Svelte usage found; harness rendering shows 13px labels. `SourceRefsCompact` also contains hardcoded English reference fragments that would leak in Arabic if the component is used.
- `Documents.svelte`: currently appears stale/unrouted. `/documents/*` normalizes to `/study/*`, so its requested empty/populated state could not be verified live as a page.

## Coverage Notes

| Component | Provenance | Notes |
| --- | --- | --- |
| `Home.svelte` | Live staging plus intercepted empty state | Populated dashboard was live. Empty state used `GET **/api/user/me` interception to return no documents. No scoped findings. |
| `LegalDocument.svelte` | Live staging | Checked privacy and terms legal routes. |
| `Sidebar.svelte` | Live staging desktop control plus source | Hidden at mobile breakpoint; desktop control screenshot confirms it remains a desktop navigation pattern. |
| `StatCard.svelte` | Live staging admin overview plus harness | Live usage in `AdminStats`. |
| `DataSurface.svelte` | Live staging admin tabs plus harness | Live usage in admin Users, Jobs, Limits, QA surfaces. |
| `MetaPill.svelte` | Source plus temporary component harness | `rg` found no routed Svelte usage. |
| `SourceRefsCompact.svelte` | Source plus temporary component harness | `rg` found no routed Svelte usage. |
| `Documents.svelte` | Source only | Legacy/stale page; current router redirects `/documents/` to `/study`. |

## Findings

### 1. `LegalDocument.svelte` outline and meta text render at 12px on mobile

- Severity: Medium
- Category: Typography
- State: Live
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic route passes; measurements are locale-independent CSS
- Screenshots:
  - `phase4-legal-privacy-en-360x800.png`
  - `phase4-legal-terms-en-360x800.png`
  - `phase4-legal-privacy-ar-360x800.png`
  - `phase4-legal-terms-ar-360x800.png`

Evidence:

| Selector | Source | Computed value | Bounding rect / notes |
| --- | --- | --- | --- |
| `.legal-outline__label` | `src/pages/LegalDocument.svelte:167` | `font-size: 12px`, `line-height: 18.6px` | Example text `Legal`, rect `336x18.59` at `360x800` |
| `.legal-outline a` | `src/pages/LegalDocument.svelte:194` | `font-size: 12px`, `line-height: 17.4px`, `min-height: 44px` | Example `Privacy Policy`, rect `95.58x44`; tap target height passes |
| `.legal-outline button` | `src/pages/LegalDocument.svelte:194` | `font-size: 12px`, `line-height: 17.4px`, `min-height: 44px` | Example `1. Who we are`, rect `94.02x44`; tap target height passes |
| `.legal-doc-page__meta` | `src/pages/LegalDocument.svelte:269` | `font-size: 12px`, `line-height: 18px` | Metadata block rect `336x132.38` at `360x800` |

The legal body text itself passes: `.legal-doc__p` measured `14px` with `23.8px` line-height and no page-level overflow.

Suggested fix approach:

Raise the mobile legal outline labels, outline controls, and legal meta text to at least `14px` while preserving the existing `min-height: 44px` controls and the current mobile horizontal outline behavior. The outline nav already uses `overflow-x: auto` at `src/pages/LegalDocument.svelte:405`, so this is not an overflow fix.

### 2. `StatCard.svelte` label and meta text render at 13px

- Severity: Low
- Category: Typography
- State: Live and harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Screenshots:
  - `phase4-admin-overview-en-360x800.png`
  - `phase4-admin-overview-ar-360x800.png`
  - `phase4-primitives-en-360x800.png`
  - `phase4-primitives-ar-360x800.png`

Evidence:

| Selector | Source | Computed value | Bounding rect / notes |
| --- | --- | --- | --- |
| `.ui-stat-card__label` | `src/lib/components/ui/StatCard.svelte:73` | `font-size: 13px`, `line-height: 15.6px` | Harness example `Total users`, rect `97.2x15.59` |
| `.ui-stat-card__meta` | `src/lib/components/ui/StatCard.svelte:95` | `font-size: 13px`, `line-height: 16.9px` | Harness example `Active 24h: 12`, rect `109.53x16.89` |

Live usage map:

- `src/components/admin/AdminStats.svelte` imports `StatCard` and renders the overview metric grid.

Suggested fix approach:

Raise `StatCard` label and meta typography to `14px` on mobile. If desktop compact density is intentional, scope the change to the same mobile breakpoint pattern used for prior typography fixes.

### 3. `DataSurface.svelte` table headers render at 12px on mobile

- Severity: Medium
- Category: Typography
- State: Live and harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Screenshots:
  - `phase4-admin-users-en-360x800.png`
  - `phase4-admin-jobs-en-360x800.png`
  - `phase4-admin-limits-en-360x800.png`
  - `phase4-primitives-en-360x800.png`

Evidence:

| Selector | Source | Computed value | Bounding rect / notes |
| --- | --- | --- | --- |
| `.ui-data-surface__table-wrap :global(.ui-data-table th)` | `src/lib/components/ui/DataSurface.svelte:201` | `font-size: 12px`, `line-height: 18.6px` | Admin Users example `USER`, rect `170x63.3` |
| `.ui-data-surface__table-wrap :global(.ui-data-table th)` | `src/lib/components/ui/DataSurface.svelte:201` | `font-size: 12px`, `line-height: 18.6px` | Admin Jobs example `JOB`, rect `150x44.7` |
| `.ui-data-surface__table-wrap :global(.ui-data-table th)` | `src/lib/components/ui/DataSurface.svelte:201` | `font-size: 12px`, `line-height: 18.6px` | Harness example `User`, rect `302.23x44.69` |

Overflow check:

- `DataSurface` table overflow is handled correctly.
- Source: `src/lib/components/ui/DataSurface.svelte:179-180`
- Live admin Users: table wrapper `scrollWidth: 1320`, `clientWidth: 296`, `overflow-x: auto`
- Live admin Jobs: table wrapper `scrollWidth: 1777`, `clientWidth: 296`, `overflow-x: auto`
- Harness: table wrapper `scrollWidth: 760`, `clientWidth: 295`, `overflow-x: auto`
- Page-level overflow remained `0` in the live admin tab passes.

Suggested fix approach:

Raise DataSurface table header text to `14px` on mobile. Keep the existing horizontal scroll strategy; it is working as intended for wide admin tables.

### 4. `MetaPill.svelte` and `SourceRefsCompact.svelte` labels render at 13px when mounted

- Severity: Low
- Category: Typography
- State: Harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic harness directions
- Screenshots:
  - `phase4-primitives-en-360x800.png`
  - `phase4-primitives-ar-360x800.png`

Usage map:

- `rg -n "MetaPill|SourceRefsCompact" src -g "*.svelte"` found no routed Svelte usage for either primitive.
- Because no live routed usage exists, these were rendered in the temporary component harness and labelled as harness provenance.

Evidence:

| Selector | Source | Computed value | Bounding rect / notes |
| --- | --- | --- | --- |
| `.ui-meta-pill__label` | `src/lib/components/ui/MetaPill.svelte:38` | `font-size: 13px`, `line-height: 20.15px` | Harness text `Document status`, rect `293.06x20.14` |
| `.source-refs-label` | `src/lib/components/ui/SourceRefsCompact.svelte:68` | `font-size: 13px`, `line-height: 20.15px` | Harness text `Sources`, rect `327.06x20.14` |

Suggested fix approach:

Raise both primitive label styles to `14px` before these components are introduced into routed mobile surfaces. Since they are currently unused, this is lower priority than the live LegalDocument/DataSurface findings.

### 5. `SourceRefsCompact.svelte` contains hardcoded English reference fragments

- Severity: Low
- Category: Localization/readiness
- State: Source and harness
- Viewports: All mobile viewports if mounted
- Languages: Arabic affected if component is used
- Screenshots:
  - `phase4-primitives-ar-360x800.png`

Evidence:

| Source | Hardcoded fragment | Notes |
| --- | --- | --- |
| `src/lib/components/ui/SourceRefsCompact.svelte:22-43` | `p.`, `chars`, `Ref` | `formatReference()` builds visible chip text internally rather than via i18n. |
| `src/lib/components/ui/SourceRefsCompact.svelte:55` | `+{hiddenCount} more` | Overflow count is hardcoded English. |

The component accepts a localized `label` prop, but the generated reference chip copy is not localized. It is not currently exposed on a routed page, so this is a readiness issue rather than a live production leak in this pass.

Suggested fix approach:

If the component is going to be used in Arabic UI, add i18n keys for the reference fragments and plural/overflow label, or accept formatter props from the parent so the parent can provide localized output.

## Source-Only Coverage Finding: `Documents.svelte`

`Documents.svelte` could not be audited as a live page because the current router normalizes legacy document paths to Study Hub routes:

- `src/routes.js:38`: `['/documents/', '/study']`
- `src/routes.js:184`: `if (path.startsWith('/documents/')) { ... }`
- `src/pages/Documents.svelte:75`: local navigation still sets `window.location.hash = \`/documents/${docId}\``

Source-only observations if this page is retained or revived:

- `.eyebrow` uses `font-size: 0.75rem` at `src/pages/Documents.svelte:231`.
- `.stats dt` uses `font-size: 0.8125rem` at `src/pages/Documents.svelte:319`.

Suggested fix approach:

Confirm whether `Documents.svelte` is intentionally retained as dead/legacy source. If not, remove it. If it is still intended to render in any build or future route, bring the small typography up to the same 14px mobile minimum used elsewhere.

## Passed Checks

### Home

- Provenance: live staging for populated state, intercepted `GET **/api/user/me` for empty-document state.
- Viewports/languages: all four mobile viewports, English and Arabic.
- Screenshots:
  - `phase4-home-populated-en-360x800.png`
  - `phase4-home-populated-ar-360x800.png`
  - `phase4-home-empty-en-360x800.png`
  - `phase4-home-empty-ar-360x800.png`
- Result: no scoped tap-target, input-size, page-overflow, fixed-width, modal-shape, safe-area, non-approved accent, or obvious RTL stability failures found in the Home dashboard layout. Upload internals were excluded because they already have a separate upload-flow audit.

### Sidebar

- Provenance: source and live desktop control.
- Mobile result: hidden on mobile by `@media (max-width: 767px) { .sidebar { display: none; } }`.
- Source:
  - `src/lib/components/layout/Sidebar.svelte:235`
  - `src/lib/components/layout/Sidebar.svelte:264`
- Desktop control screenshot: `phase4-sidebar-desktop-1024x768.png`
- Safe-area note: sidebar footer already includes `env(safe-area-inset-bottom)` at `src/lib/components/layout/Sidebar.svelte:218`.

### Legal Long-Form Layout

- Body text measured `14px`; no page-level horizontal overflow.
- Mobile outline nav intentionally scrolls horizontally and has `overflow-x: auto`.
- No wide tables were present in the sampled legal documents.

### DataSurface Overflow

- Wide tables stayed inside their scroll wrapper.
- No page-level horizontal overflow was observed from `DataSurface` in the live admin passes.
- This audit flags header typography only, not the wide-table scrolling model.

## Incidental Out-of-Scope Notes

These were visible during the Phase 4 pass but are outside the requested component list:

- Admin tabs (`Tabs`/admin shell) render as horizontal scrollable tabs with buttons around `35.1px` tall; the `QA` tab measured about `20.1x35.1`. This is not `DataSurface`, but it is a mobile tap-target issue on admin pages.
- `src/components/admin/UserTable.svelte` row checkboxes measured `16x16`, role selects measured `112x32` with `12px` text, and two bulk action buttons had text clipping (`scrollWidth` greater than `clientWidth`). This is an admin consumer issue, not a Phase 4 primitive issue.
- TopBar account avatar and BottomNav labels still appear in automated small-text output on some admin pages. Those components were outside this Phase 4 batch and had earlier dedicated work.

## Prioritized Fix Order

1. Raise `LegalDocument.svelte` outline/meta text to 14px on mobile. This is live public content and affects both legal navigation and metadata readability.
2. Raise `DataSurface.svelte` table header text to 14px on mobile while preserving the working horizontal scroll wrapper.
3. Raise `StatCard.svelte` label/meta text to 14px on mobile.
4. Decide whether `Documents.svelte` should be deleted as stale legacy source or repaired before future use.
5. Prepare `MetaPill.svelte` and `SourceRefsCompact.svelte` for future routed use by raising labels to 14px and localizing `SourceRefsCompact` generated reference fragments.

## Verification Artifacts

Primary JSON outputs:

- `mobile-audit-screenshots/phase4-polish/phase4-results.json`
- `mobile-audit-screenshots/phase4-polish/phase4-admin-tabs.json`
- `mobile-audit-screenshots/phase4-polish/phase4-primitives-results.json`

Representative screenshots:

- `phase4-home-populated-en-360x800.png`
- `phase4-home-empty-ar-360x800.png`
- `phase4-legal-privacy-en-360x800.png`
- `phase4-legal-terms-ar-360x800.png`
- `phase4-admin-overview-en-360x800.png`
- `phase4-admin-users-en-360x800.png`
- `phase4-admin-jobs-en-360x800.png`
- `phase4-sidebar-desktop-1024x768.png`
- `phase4-primitives-en-360x800.png`
- `phase4-primitives-ar-360x800.png`
