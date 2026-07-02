# Mobile UX Audit - Studymaxing Staging - 2026-07-02

## Executive summary

Target audited: `https://stage.studymaxing.com` on `360x800`, `375x812`, `390x844`, and `428x926` in English and Arabic. Public marketing/Landing and `src/components/admin/` were excluded.

Relevant evidence set: 540 screenshots were used for findings: live auth/app coverage plus deterministic intercepted document states. A separate rerun produced redirect/rate-limit screenshots after repeated QA logins; those were excluded from findings. Deterministic document states were rendered through the real Svelte app with intercepted `/api/auth/get-session`, `/api/document/:id`, `/api/jobs/:id`, `/api/telegram/status`, and `/api/telegram/link-token`; this was necessary after live QA data did not reliably expose every requested Summary/Flashcards/Mock Exam state at every viewport.

Grouped findings: **11 total**: Critical 0, High 5, Medium 6, Low 0.

Category breakdown: tap targets 3, typography 1, bottom navigation/safe area 2, modals/drawers 1, RTL 1, contrast 1, design tokens 1, upload/study visual polish 2. Automated checks found no actionable horizontal page overflow and no unwrapped tables in the audited states.

## Findings by file/component

### `src/components/auth/*` and `src/components/public/PublicHeader.svelte`

1. **Auth and public-header tap targets are below 44px** - High  
   Viewports: all, worst at `360x800`. Languages: both. Provenance: live.  
   Evidence: `0001-360x800-en-auth-sign-in.png`. Selectors included `button.brand.svelte-r3rxwa` at `82.3x40`, preferences trigger at `40x40`, password show toggle at `54.2x32`, primary sign-in button at `280x36`, and auth switch link at `50.6x18`.  
   Suggested fix: make mobile header/icon buttons and auth form buttons `min-height: 44px`; convert inline auth switch/forgot-password links into block or inline-flex controls with at least 44px hit height.

2. **Auth fine text and labels fall below the requested 14px minimum** - Medium  
   Viewports: all. Languages: both. Provenance: live.  
   Evidence: `0001-360x800-en-auth-sign-in.png`. Examples: auth labels at `12px`, public header labels at `12px`, brand title at `13px`, password toggle text at `12px`. Inputs themselves were acceptable at `16px`, so the iOS zoom bug was not observed on text fields.  
   Suggested fix: raise mobile label/helper/link/button-label type to at least `14px`, or document any intentional fine-print exceptions.

### `src/lib/components/layout/BottomNav.svelte` / `AppShell.svelte`

3. **Bottom navigation visually covers page content** - High  
   Viewports: `360x800`, also visible at larger mobile widths when content passes under the fixed nav. Languages: both. Provenance: live and intercepted.  
   Evidence: `0041-360x800-en-home-dashboard-live.png`, `0095-360x800-en-document-cards-generating.png`, `0117-360x800-ar-document-cards-generating.png`. The nav overlays the Home upload area and intersects the Flashcards generating card/skeleton in the document hub.  
   Suggested fix: add a shell-level mobile bottom padding equal to bottom-nav height plus `env(safe-area-inset-bottom)` and ensure focused/flow layouts reserve that space.

4. **Bottom fixed surfaces do not consistently expose safe-area handling** - Medium  
   Viewports: `360x800`, `375x812`, `390x844`. Languages: both. Provenance: live.  
   Evidence: automated checks flagged fixed modal/backdrop surfaces with `bottom: 0px` and `padding-bottom: 8px` but no detectable `safe-area-inset-bottom`; screenshots include `0047-360x800-en-telegram-connect-live.png`.  
   Suggested fix: apply `padding-bottom: calc(... + env(safe-area-inset-bottom))` to bottom nav and mobile bottom sheets/backdrops.

### `src/pages/Home.svelte` and `src/lib/components/ui/UploadDropzone.svelte`

5. **Upload panel is partially obscured at small width** - High  
   Viewports: `360x800`. Languages: both. Provenance: live/intercepted upload state.  
   Evidence: `0041-360x800-en-home-dashboard-live.png`, `0042-360x800-en-upload-selected-or-uploading.png`, `0043-360x800-en-upload-error.png`. Tap-to-browse is visually primary, but the bottom nav covers the lower upload card content in the first viewport.  
   Suggested fix: solve through the shell bottom padding from finding 3; also check upload stack spacing so the upload CTA remains fully visible above the nav on first load.

### `src/pages/StudyHubDocument.svelte` and `src/lib/components/ui/StudyActionCard.svelte`

6. **Generating feature cards are real and animated, but the nav interrupts the visual flow** - Medium  
   Viewports: all, worst at `360x800`. Languages: both. Provenance: intercepted with real component rendering and two-frame samples.  
   Evidence: `0095-360x800-en-document-cards-generating.png` and frame samples such as `0096-360x800-en-activity-summary-generating.png`. Skeleton/progress animation did not visibly jank or overflow, but the bottom nav sits over the middle card in full-page captures.  
   Suggested fix: no animation change required from this pass; fix content/nav spacing so generating cards can scroll clear of the fixed nav.

7. **Warning/info status accents violate the green-only accent rule** - Medium  
   Viewports: all. Languages: both. Provenance: live and intercepted.  
   Evidence: visible amber PPTX and processing/generating badges in `0044-360x800-en-study-hub-index-live.png` and `0095-360x800-en-document-cards-generating.png`. Source scan found `--foundation-info: #3b82f6/#2563eb` and `--foundation-warning: #f59e0b/#d97706` in `src/lib/styles/tokens.css`, with warning/info tones used by `Badge`, `StatusBadge`, `StudyActionCard`, `DocumentCard`, and `Button`.  
   Suggested fix: remap info/warning/accent states to approved green `#22c55e` or neutral treatments for the mobile app, leaving destructive red only where explicitly required.

### `src/lib/components/study/DocumentActivityView.svelte`

8. **Arabic document activity mixes English generated-state copy into RTL layouts** - Medium  
   Viewports: all. Language: Arabic. Provenance: intercepted.  
   Evidence: `0117-360x800-ar-document-cards-generating.png` shows English strings such as `Reading your document...`, `Scanning for key terms...`, and `Analysing the content...`; mixed LTR text also creates punctuation artifacts such as `.Existing content remains available`.  
   Suggested fix: localize rotating/generating messages and wrap dynamic LTR document titles/copy with `dir="auto"` or `unicode-bidi: plaintext` so punctuation and sentence order remain correct.

### `src/pages/Settings.svelte`

9. **Settings password modal is not a full-screen/bottom-sheet mobile surface** - High  
   Viewports: `360x800`, `375x812`, `390x844`. Languages: English observed live before auth rate limiting; same CSS applies to Arabic. Provenance: live.  
   Evidence: `0046-360x800-en-settings-password-modal-live.png`. Selector `.settings-modal.svelte-1ozf5k3` measured `344x502.6`, top `289.4`, bottom `792` on a `360x800` viewport. Close button was `36x36`.  
   Suggested fix: use `ModalSurface` or match its mobile behavior: full-height or bottom-sheet layout, safe-area padding, and 44px close/action targets.

10. **Settings account actions use undersized buttons** - Medium  
   Viewports: `360x800`, `375x812`, `390x844`. Languages: both. Provenance: live.  
   Evidence: `0045-360x800-en-settings-account-sessions-live.png`; sign-out button measured `294x36` at `360x800`.  
   Suggested fix: align destructive/account actions with the shared Button mobile minimum of 44px height.

11. **Muted settings/study text contrast is borderline or failing** - Medium  
   Viewports: `360x800`, `375x812`, `390x844`. Languages: both. Provenance: live.  
   Evidence: Study Hub upload date text measured contrast `3.98:1` on `0044-360x800-en-study-hub-index-live.png`; settings helper/session text often measured `4.43:1`, just below 4.5:1; sign-out button text measured `3.44:1` against red.  
   Suggested fix: raise muted text tokens for dark theme and adjust destructive button foreground/background pair to pass WCAG AA.

## Phase 1 regression check

- `tokens.css`: regression against the requested audit rule. The shared token set still exposes blue info and amber warning accents, and those colors are visible in app surfaces.
- `Button`: partially regressed on mobile sizing where `size="sm"` and some auth/settings buttons render at `36px` or `40px` high.
- `FieldShell`: input font-size passed the 16px iOS zoom check; labels/hints are often below 14px.
- `MenuItem`, `Tabs`, `Toggle`, `LanguageToggle`, `ThemeToggle`: no major overflow found in audited states, but the top preference/theme trigger presents as a `40x40` target.
- `ModalSurface`: no regression in the primitive itself was proven, but `Settings.svelte` bypasses it with a custom modal that fails the mobile bottom-sheet requirement.
- `TopBar` / `DrawerShell`: no actionable overflow found in audited states.
- `BottomNav`: regression/unfinished mobile behavior. It overlays content and needs consistent safe-area/content padding.

## Prioritized fix order

1. Fix bottom-nav safe-area/content padding globally; this affects Home, Study Hub, DocumentActivityView, and Settings.
2. Replace or restyle the custom Settings modal to use the shared mobile sheet behavior and 44px close/action targets.
3. Normalize mobile tap-target heights across auth, public header, settings, and small Button variants.
4. Resolve the token rule by removing blue/amber/orange accents from post-login mobile surfaces and replacing them with approved green/neutral treatments.
5. Raise mobile small text/label/helper typography to 14px or explicitly document exceptions.
6. Localize Arabic generating messages and harden mixed LTR/RTL text handling with `dir="auto"`/`unicode-bidi`.
7. Tune muted/danger contrast pairs in the dark theme.

## Notes

- No app source files were modified during this audit.
- Screenshots and raw JSON were left under `mobile-audit-screenshots/` and were not staged.
- The QA account became rate-limited after repeated live login attempts; deterministic post-login document states therefore used disclosed Playwright interception while still rendering the real deployed Svelte components.
