# Upload Flow Mobile UX Audit - 2026-07-03

## Executive Summary

Audit scope covered:
- `src/lib/components/ui/UploadDropzone.svelte`
- `src/lib/components/ui/UploadFileRow.svelte`
- `src/lib/components/ui/UploadModal.svelte`
- `src/lib/components/ui/UploadPanel.svelte`

Harness:
- Temporary component harness: `%TEMP%\studymaxing-upload-component-harness`
- Playwright runner: `%TEMP%\studymaxing-mobile-audit`
- Screenshots: `mobile-audit-screenshots/`
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- States checked: dropzone idle/drag/surface; file selected/uploading/complete/error/rejected; panel empty/selected/uploading/error/compact; modal empty/selected/uploading/error

Live staging note:
- Live `stage.studymaxing.com` verification was attempted with `qa@studymaxing.com / tester123`, but the QA account hit backend auth rate limiting: `429 Too many attempts. Please wait about 35 seconds and try again.`
- No source files were modified. Upload timing/error states below are from a temp harness rendering the real Svelte source components, not mocked DOM shells. Where live staging was blocked, this report labels that explicitly.

Severity totals:
- Critical: 0
- High: 0
- Medium: 5
- Low: 2

Category totals:
- Typography below 14px: 4
- Tap target below 44px: 1
- Safe-area / bottom sheet risk: 1
- RTL / localization polish: 1

Pass summary:
- No page-level horizontal overflow found in the corrected mobile harness.
- No visible input/textarea text below 16px found. Hidden file inputs were ignored.
- No blue/amber/orange accent colors were detected in upload component surfaces.
- `UploadModal` renders as a bottom sheet on mobile via `ModalSurface`: at `360x800`, selected state measured `left=0`, `right=360`, `width=360`, `bottom=800`, `border-radius=16px 16px 0 0`.
- Primary/cancel/browse/remove/close buttons meet the 44px tap-target minimum after the earlier shared Button work.

## Findings

### `src/lib/components/ui/UploadDropzone.svelte`

#### 1. Medium - secondary dropzone copy renders below the 14px mobile minimum

Evidence:
- State: `dropzone-idle`, `dropzone-drag`, `dropzone-surface`, `panel-compact`
- Source: temp component harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Selectors / computed values:
  - `.upload-dropzone__support`: `font-size=13px`, rect `210.1x18.8` at `360x800`
  - `.upload-dropzone__divider strong`: `font-size=13px`, rect `18.8x20.1` at `360x800`
  - `.upload-dropzone__drag-chip`: `font-size=13px`, rect `153.1x30.4` at `360x800`
  - `.upload-dropzone--compact .upload-dropzone__description`: `font-size=12px`, rect `268x18` at `360x800`
- Screenshot: `upload-flow-harness-dropzone-idle-360x800-en.png`, `upload-flow-harness-dropzone-drag-360x800-en.png`, `upload-flow-harness-panel-compact-360x800-en.png`
- Source lines:
  - `UploadDropzone.svelte:290`
  - `UploadDropzone.svelte:347`
  - `UploadDropzone.svelte:353`
  - `UploadDropzone.svelte:371`

Suggested fix:
- Raise these mobile-visible secondary text rules to at least `14px`.
- The compact description is the worst offender because it uses `var(--font-size-xs)`, which currently resolves to `12px`.
- Preserve visual hierarchy with line-height and muted color rather than sub-14px type.

### `src/lib/components/ui/UploadFileRow.svelte`

#### 2. Medium - file-size metadata renders at 13px

Evidence:
- State: `file-row-selected`, `file-row-uploading`, `file-row-complete`, `file-row-error`, `file-row-rejected`; also inherited inside `UploadPanel` and `UploadModal`
- Source: temp component harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Selector / computed values:
  - `.upload-file-row__size`: `font-size=13px`
  - Selected file example: text `512.0 KB`, rect `194x20.1` at `360x800`
  - Rejected file example: text `26.3 MB`, rect `194x20.1` at `360x800`
- Screenshot: `upload-flow-harness-file-row-selected-360x800-en.png`, `upload-flow-harness-file-row-rejected-360x800-en.png`
- Source line: `UploadFileRow.svelte:118`

Suggested fix:
- Raise `.upload-file-row__size` to `14px` on mobile.
- The remove button itself passes: `.upload-file-row__remove` is `44x44`.

### `src/lib/components/ui/UploadPanel.svelte`

#### 3. Medium - compact details summary is a 20px-tall tap target

Evidence:
- State: `panel-compact`
- Source: temp component harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Selector / computed values:
  - `.upload-panel__details summary`
  - English at `360x800`: text `Accepted formats and limits`, rect `302x20.1`
  - Arabic at `360x800`: localized Arabic summary label, rect `302x20.1`
- Screenshot: `upload-flow-harness-panel-compact-360x800-en.png`, `upload-flow-harness-panel-compact-360x800-ar.png`
- Source line: `UploadPanel.svelte:346`

Suggested fix:
- Give the `summary` a mobile `min-height: 44px`, `display: flex`, and centered alignment.
- Keep the visual style link-like if desired, but make the touch area at least 44px tall.

#### 4. Medium - panel secondary/counter/details copy renders below 14px

Evidence:
- State: `panel-empty`, `panel-selected`, `panel-uploading`, `panel-error`, `panel-compact`
- Source: temp component harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Selectors / computed values:
  - `.upload-panel__support`: `font-size=13px`, rect `294x18.2` at `360x800`
  - `.upload-panel__counter`: `font-size=13px`, text `0/5` or `1/5`, height `20.1`
  - `.upload-panel__details summary`: `font-size=13px`
  - `.upload-panel__details-copy`: `font-size=13px`
- Screenshot: `upload-flow-harness-panel-empty-360x800-en.png`, `upload-flow-harness-panel-selected-360x800-en.png`, `upload-flow-harness-panel-compact-360x800-en.png`
- Source lines:
  - `UploadPanel.svelte:331`
  - `UploadPanel.svelte:349`
  - `UploadPanel.svelte:361`
  - `UploadPanel.svelte:400`

Suggested fix:
- Raise these mobile-visible secondary text rules to `14px`.
- Avoid changing the global `--font-size-xs` token unless the broader app wants that same shift.

### `src/lib/components/ui/UploadModal.svelte`

#### 5. Medium - modal support/error/counter text renders at 13px

Evidence:
- State: `modal-empty`, `modal-selected`, `modal-uploading`, `modal-error`
- Source: temp component harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Selectors / computed values:
  - `.upload-modal__support`: `font-size=13px`, text `PDF, DOCX, PPTX, TXT up to 25 MB.`
  - `.upload-modal__error`: `font-size=13px`
  - `.upload-modal__counter`: `font-size=13px`, text `0/5` or `1/5`
  - Nested `.upload-file-row__size`: `font-size=13px`
- Screenshot: `upload-flow-harness-modal-empty-360x800-en.png`, `upload-flow-harness-modal-selected-360x800-en.png`, `upload-flow-harness-modal-error-360x800-en.png`
- Source lines:
  - `UploadModal.svelte:214`
  - `UploadModal.svelte:220`
  - `UploadModal.svelte:240`

Suggested fix:
- Raise modal secondary and error text to `14px` on mobile.
- Fixing `UploadFileRow.svelte` will also correct the nested file-size text inside the modal.

#### 6. Low - modal bottom-sheet safe-area handling is inherited from a shared primitive and currently measures as zero bottom padding

Evidence:
- State: all modal states
- Source: temp component harness
- Viewports: `360x800`, `375x812`, `390x844`, `428x926`
- Languages: English and Arabic
- Selector / computed values:
  - `.ui-modal-overlay`: `position=fixed`, `bottom=0px`, `padding-bottom=0px`, rect bottom equals viewport bottom
  - `.ui-modal`: bottom-sheet shape passes, but there is no upload-level safe-area padding on the fixed overlay/sheet container
- Screenshot: `upload-flow-harness-modal-selected-360x800-en.png`
- Shared primitive source lines:
  - `ModalSurface.svelte:113`
  - `ModalSurface.svelte:115`
  - `ModalSurface.svelte:116`
  - `ModalSurface.svelte:124`

Suggested fix:
- If `ModalSurface` is intended to own all bottom sheets, consider adding `padding-bottom: env(safe-area-inset-bottom, 0px)` or equivalent footer spacing there.
- If `ModalSurface` was intentionally exempt from safe-area padding because the footer is not fixed, document that decision; upload components themselves do not add any fixed bottom surface.

### `src/lib/components/ui/UploadPanel.svelte` and `src/lib/components/ui/UploadModal.svelte`

#### 7. Low - selected-file list aria label is hardcoded in English

Evidence:
- State: `panel-selected`, `panel-uploading`, `panel-error`, `modal-selected`, `modal-uploading`, `modal-error`
- Source: source audit plus temp component harness
- Viewports: all checked
- Languages: Arabic affected for assistive technology
- Selectors / source:
  - `UploadPanel.svelte:102`: `aria-label="Selected files"`
  - `UploadPanel.svelte:198`: `aria-label="Selected files"`
  - `UploadModal.svelte:100`: `aria-label="Selected files"`
- Screenshot: visual screenshots do not expose this because the label is accessibility-only.

Suggested fix:
- Expose a localized prop for selected-file list labeling, or derive it from the existing i18n layer where these components are used.
- This does not affect visible layout but does leak English into Arabic assistive output.

## Additional Observations

- `UploadDropzone.svelte:177` and `UploadPanel.svelte:337` use `text-align: left` for compact variants. At the audited mobile widths, later mobile rules center the compact support text, so this did not render as a mobile RTL failure. If compact upload panels are used on wider RTL breakpoints, switch these to logical alignment.
- `UploadDropzone.svelte:282` uses physical `right: 0.6rem` for `.upload-dropzone__drag-chip`; the compact override uses `inset-inline-end`, and the mobile rule makes the chip static, so no mobile RTL failure was observed. Prefer `inset-inline-end` for consistency.
- `UploadFileRow` does not own progress or complete UI. Uploading/complete/error states are represented by parent busy/error state plus disabled row behavior in `UploadPanel`, `UploadModal`, or `Home`.
- Drag-hover was simulated by dispatching `dragover` to the real dropzone component. Browser file-picker opening cannot be fully asserted in headless mode, but the visible browse button and root label affordance were measured.

## Prioritized Fix Order

1. Fix the `UploadPanel` compact `<summary>` tap target to at least 44px high.
2. Raise upload-flow secondary text to 14px in the four upload components, scoped locally rather than through a global token unless the product wants broader typography changes.
3. Decide whether `ModalSurface` should own safe-area padding for bottom sheets; if yes, fix it centrally.
4. Localize selected-file list `aria-label` values for Arabic.
5. Replace physical `left`/`right` alignment rules with logical equivalents where practical.

## Verification Artifacts

Representative screenshots:
- `mobile-audit-screenshots/upload-flow-harness-dropzone-idle-360x800-en.png`
- `mobile-audit-screenshots/upload-flow-harness-dropzone-drag-360x800-en.png`
- `mobile-audit-screenshots/upload-flow-harness-file-row-selected-360x800-en.png`
- `mobile-audit-screenshots/upload-flow-harness-file-row-rejected-360x800-en.png`
- `mobile-audit-screenshots/upload-flow-harness-panel-compact-360x800-en.png`
- `mobile-audit-screenshots/upload-flow-harness-panel-compact-360x800-ar.png`
- `mobile-audit-screenshots/upload-flow-harness-modal-selected-360x800-en.png`
- `mobile-audit-screenshots/upload-flow-harness-modal-error-360x800-en.png`

Raw local data:
- `%TEMP%\studymaxing-mobile-audit\upload-flow-audit-results.json`
- `%TEMP%\studymaxing-mobile-audit\upload-summary.json`

Git scope:
- This report is the only tracked file created for the audit.
- Screenshots remain untracked in `mobile-audit-screenshots/`.
