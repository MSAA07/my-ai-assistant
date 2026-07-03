# Study Experience Mobile UX Audit - 2026-07-04

## Executive Summary

Audit scope covered:
- `src/pages/StudyHubIndex.svelte`
- `src/lib/components/ui/StudyActionCard.svelte`
- `src/lib/components/study/StudyActivityShell.svelte`
- `src/lib/components/ui/GuidedRegenerateModal.svelte` (actual path; not under `study/`)

Test matrix:
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Provenance: temp Playwright/Svelte harness at `%TEMP%\studymaxing-study-experience-harness`, importing real repo components and repo Tailwind/PostCSS config.
- Intercepted endpoint for StudyHubIndex state setup: `GET https://ai-assistant-backend-staging.up.railway.app/api/user/me`
- Live staging note: initial live Study Hub login succeeded once at `360x800`, but follow-up live matrix attempts were blocked by auth `429 Too many attempts`; harness data is the authoritative evidence below for empty/loading/mixed document states.

Totals:
- High: 0
- Medium: 3
- Low: 2

Category totals:
- Typography: 3
- Contrast: 1
- Horizontal overflow: 1

Passes:
- No tap targets under `44x44` in the audited component states.
- No page-level horizontal overflow in the final harness pass.
- `GuidedRegenerateModal` uses `ModalSurface`; mobile shape is bottom-sheet/full-width, not a centered desktop card.
- Arabic pages set `dir="rtl"` correctly in harness.
- No blue/amber non-approved accent colors were detected after the token remap.

## Findings

### 1. StudyHubIndex / StudyActionCard / StudyActivityShell - badge text renders below the 14px mobile minimum

Severity: Medium  
Category: Typography  
State: harness / harness-intercepted  
Files:
- `src/pages/StudyHubIndex.svelte`
- `src/lib/components/ui/StudyActionCard.svelte`
- `src/lib/components/study/StudyActivityShell.svelte`
- Root primitive observed: `src/lib/components/ui/Badge.svelte`

Evidence:
- `StudyHubIndex.svelte:309` PageHeader eyebrow badge renders at `12px`.
  - Selector: `span.ui-badge.inline-flex.w-fit`
  - Text: `Study Hub` and Arabic equivalent
  - Computed: `font-size: 12px`, `height: 22px`
  - Viewports/languages: all 4 widths, English and Arabic
  - Screenshot: `study-exp-hub-populated-en-360x800.png`
- `StudyHubIndex.svelte:353-355` empty-state chips render at `12px`.
  - Text: `Summary`, `Flashcards`, `Exam questions`
  - Screenshot: `study-exp-hub-empty-en-360x800.png`
- `StudyHubIndex.svelte:374-384` document card status badges render at `10px`.
  - Text: `Ready`, `Generating selected`, `Ready to generate`; Arabic equivalents also affected
  - Selector: `span.ui-badge.inline-flex.w-fit`
  - Computed: `font-size: 10px`, `height: 22px`
  - Screenshot: `study-exp-hub-populated-en-360x800.png`
- `StudyActionCard.svelte:52-56` status badges render at `12px`.
  - Text: `Not generated`, `Generating`, `Complete`, `Failed`; Arabic equivalents also affected
  - Screenshot: `study-exp-actions-en-360x800.png`
- `StudyActivityShell.svelte:74-77` mode/file badges render at `12px`.
  - Text: `Flashcards`, `PPTX`; Arabic scenario also affected
  - Screenshot: `study-exp-shell-flashcards-active-en-360x800.png`

Suggested fix approach:
- Map the affected `Badge size="sm"` mobile font size to at least `14px`, or introduce a mobile-only override for study surfaces if global badge sizing has intentionally compact desktop use cases.
- Remove/raise the `DocumentCard` status-badge override that forces `font-size: 0.625rem`.
- Preserve badge height and visual density with minimal line-height/padding adjustment.

### 2. Destructive badges are just below WCAG AA contrast

Severity: Medium  
Category: Contrast  
State: harness / harness-intercepted  
Files:
- `src/pages/StudyHubIndex.svelte`
- `src/lib/components/ui/StudyActionCard.svelte`
- Root primitive observed: `src/lib/components/ui/Badge.svelte`

Evidence:
- `StudyHubIndex.svelte:381` PDF file-type badge uses destructive badge tone.
  - Selector: `span.ui-badge.inline-flex.w-fit`
  - Text: `PDF`
  - Computed foreground: `color(srgb 0.881569 0.282039 0.282039)`
  - Computed blended background: `rgb(41, 20, 20)`
  - Contrast: `4.34:1`
  - Screenshot: `study-exp-hub-populated-en-360x800.png`
- `StudyActionCard.svelte:197-201` failed status badge uses the same destructive treatment.
  - Text: `Failed` and Arabic equivalent
  - Computed foreground/background: same as above
  - Contrast: `4.34:1`
  - Screenshot: `study-exp-actions-en-360x800.png`

Suggested fix approach:
- Keep destructive/red semantics, but slightly lighten the destructive badge foreground or darken the badge background mix enough to clear `4.5:1`.
- Recheck both file-type badges and status badges after changing the shared destructive badge mix.

### 3. GuidedRegenerateModal textarea text is below the 16px mobile input minimum

Severity: Medium  
Category: Typography / input zoom prevention  
State: harness  
Files:
- `src/lib/components/ui/GuidedRegenerateModal.svelte`
- Root primitive observed: `src/lib/components/ui/FieldShell.svelte`

Evidence:
- `GuidedRegenerateModal.svelte:83-90` textarea inherits FieldShell input sizing.
  - Selector: `#regenerate-custom-instruction`
  - Computed: `font-size: 14px`
  - Bounding rect at `360x800`: `x: 18`, `y: 562.203`, `width: 324`, `height: 100`
  - Viewports/languages: all 4 widths, English and Arabic, open and busy states
  - Screenshot: `study-exp-modal-open-en-360x800.png`
- `FieldShell.svelte:86-97` sets input/textarea/select `font-size: var(--font-size-sm)`, currently resolving to `14px`.

Suggested fix approach:
- Apply a mobile-only `font-size: 16px` for `textarea` in `FieldShell`, or scope the override to `GuidedRegenerateModal` if raising FieldShell inputs globally has wider visual implications.
- Keep the existing control height/padding unless 16px text causes clipping.

### 4. GuidedRegenerateModal custom instruction label is below the 14px mobile minimum

Severity: Low  
Category: Typography  
State: harness  
Files:
- `src/lib/components/ui/GuidedRegenerateModal.svelte`
- Root primitive observed: `src/lib/components/ui/FieldShell.svelte`

Evidence:
- `GuidedRegenerateModal.svelte:77-81` uses `FieldShell` for the custom instruction field.
  - Selector: `.ui-field__label span` (scoped selector surfaced as `span.s-jgTZU8BjgIfR`)
  - Text: `Additional instructions` and Arabic equivalent
  - Computed: `font-size: 12px`, `line-height: 18.6px`
  - Bounding rect at `360x800`: `x: 17`, `y: 536.531`, `width: 129.266`, `height: 18.594`
  - Viewports/languages: all 4 widths, English and Arabic, open and busy states
  - Screenshot: `study-exp-modal-open-en-360x800.png`
- `FieldShell.svelte:57` sets field labels to `var(--font-size-xs)`.

Suggested fix approach:
- Raise FieldShell labels to `14px` on mobile, or add a modal-scoped override for this field if the global FieldShell label size is intentionally compact elsewhere.

### 5. StudyActivityShell active flashcards mode has element-level horizontal overflow

Severity: Low  
Category: Horizontal overflow  
State: harness  
File: `src/lib/components/study/StudyActivityShell.svelte`

Evidence:
- Scenario: `shell-flashcards-active`
- Selector: `section.activity-chrome.activity-chrome--sticky.study-activity-shell`
- Computed at `360x800`: bounding rect `x: 16.469`, `width: 327.063`, `right: 343.531`
- Element metrics: `scrollWidth: 344`, `clientWidth: 327`
- Viewports/languages: all 4 widths, English and Arabic
- Screenshot: `study-exp-shell-flashcards-active-en-360x800.png`
- Likely source: `StudyActivityShell.svelte:280-283`
  - `.study-activity-shell--flashcards.study-activity-shell--active-session .activity-chrome__rail`
  - `width: calc(100% + (var(--layout-shell-padding-inline) * 2))`
  - negative inline margins

Notes:
- No page-level horizontal scrolling was detected; this is contained element-level overflow.
- The visual intent appears to be full-bleed rail background extension, so this may be intentional but should be implemented without increasing the parent element's scrollable width.

Suggested fix approach:
- Replace the width-plus-negative-margin approach with an absolutely positioned pseudo/background layer or add an explicit `overflow-x: clip` at the rail/container level after confirming it does not hide focus rings.

## State Coverage

StudyHubIndex:
- Loading: harness-intercepted delayed `/api/user/me`; screenshots `study-exp-hub-loading-*.png`
- Empty: harness-intercepted `/api/user/me` returning `documents: []`; screenshots `study-exp-hub-empty-*.png`
- Populated: harness-intercepted mixed PDF/DOCX/PPTX documents with complete/generating/not-requested/failed states; screenshots `study-exp-hub-populated-*.png`
- Live staging: login initially succeeded once at `360x800`, but later validation was blocked by `429 Too many attempts`; no live findings are counted.

StudyActionCard:
- Statuses checked: `not_generated`, `generating`, `complete`, `failed`, `processing`, `ready`, `info`
- Generating spinner rendered; no tap target or overflow defects found.

StudyActivityShell:
- Modes checked: summary, exam, active flashcards
- Active-session body includes safe-area padding via `padding-bottom: max(var(--ui-space-3), env(safe-area-inset-bottom))`
- No page-level overflow; element-level rail overflow noted above.

GuidedRegenerateModal:
- Open and busy states checked.
- Uses `ModalSurface`, not a custom modal.
- Mobile dialog rect at `360x800`: `x: 0`, `width: 360`, `bottom: 800`, `border-radius: 16px 16px 0 0`
- ModalSurface safe-area padding present: computed `padding-bottom: 16px` in Chromium with zero safe-area inset.

## Prioritized Fix Order

1. Raise GuidedRegenerateModal textarea to `16px` on mobile to avoid iOS zoom risk.
2. Raise study-surface badge/status badge text to at least `14px` on mobile.
3. Adjust destructive badge foreground/background mix to clear `4.5:1`.
4. Raise the GuidedRegenerateModal FieldShell label to `14px` on mobile.
5. Remove or clip the active flashcards rail's contained horizontal overflow.

## Verification Artifacts

Primary screenshots are in untracked `mobile-audit-screenshots/`:
- `study-exp-hub-empty-en-360x800.png`
- `study-exp-hub-populated-en-360x800.png`
- `study-exp-actions-en-360x800.png`
- `study-exp-shell-flashcards-active-en-360x800.png`
- `study-exp-modal-open-en-360x800.png`
- Arabic equivalents are present with `-ar-` filenames.

Raw automated results:
- `mobile-audit-screenshots/study-experience-audit-results.json`
