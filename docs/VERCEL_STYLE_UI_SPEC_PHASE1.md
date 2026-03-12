# Phase 1: Vercel-Style UI Spec and Frontend Audit

Date: March 12, 2026  
Branch: `stage`  
Scope: Frontend visual system only (no product flow, API, or backend contract changes)

## Intent

Create a single visual source of truth before reskin work.  
Target UI language: dark, minimal, premium, restrained, dense, and consistent with Vercel-like product surfaces (without copying branding/assets).

## Non-goals

- No backend or API changes
- No route or feature redesign
- No page-by-page ad-hoc restyling
- No flashy gradients, glass effects, or oversized consumer-style controls

## 1) Current frontend styling audit

### Token and global style ownership

- Token source: `src/lib/styles/tokens.css`
  - Holds color, typography, spacing, radius, motion, and effect tokens.
  - Includes dark and light theme branches.
  - Includes multiple gradient and glow tokens that drive non-target visuals.
- Global foundation: `src/styles/global.css`
  - Reset/base, typography defaults, links, focus ring, scrollbars.
  - Used correctly as a foundation layer, but currently allows bright accent link behavior.
- Theme runtime: `src/stores/theme.js`, `index.html`, `src/lib/components/ui/ThemeToggle.svelte`
  - Two-mode theme (`dark`/`light`) is active and persisted.
  - Dark is default, but many components still style both modes.

### Layout shell files

- `src/App.svelte` (auth/landing wrappers, loading, 404/access denied)
- `src/lib/components/layout/AppShell.svelte`
- `src/lib/components/layout/Sidebar.svelte`
- `src/lib/components/layout/TopBar.svelte`
- `src/lib/components/layout/BottomNav.svelte`
- Legacy fallback shell: `src/components/AppHeader.svelte`, `src/components/Footer.svelte`

### Shared UI primitives

- Core primitives: `Button`, `Card`, `FieldShell`, `DataSurface`, `Tabs`, `Badge`, `ModalSurface`, `MenuSurface`, `MenuItem`, `Section`, `DrawerShell`
- Supporting primitives: `ConfirmModal`, `GuidedRegenerateModal`, `Upload*`, `EmptyState`, `StatusBadge`, skeleton components
- Primitive docs already exist: `src/lib/components/ui/PRIMITIVES.md`, `src/lib/components/ui/DATA_SURFACE_PATTERN.md`

### Pages/components with heavy local style overrides

Highest style-block concentration and coupling:

| File | Approx style size | Risk |
| --- | ---: | --- |
| `src/pages/DocumentView.svelte` | 200 lines | Dense local states, many `:global()` hooks, custom controls |
| `src/pages/Documents.svelte` | 152 lines | Local card/table density + button targeting |
| `src/pages/StudyHubDocument.svelte` | 150 lines | Multiple local surface variants and state overrides |
| `src/pages/Settings.svelte` | 129 lines | Local button styles bypass primitive button system |
| `src/pages/StudyHubIndex.svelte` | 124 lines | Local menu/card/state wrappers |
| `src/pages/Home.svelte` | 105 lines | Gradient headline, large hero/stat styling |
| `src/pages/Landing.svelte` | 114 lines | Marketing-style gradients, glow, hover lift |
| `src/lib/components/ui/UploadModal.svelte` | 144 lines | Oversized typography and controls |
| `src/lib/components/ui/UploadDropzone.svelte` | 124 lines | Accent-heavy visuals, large icon + CTA |
| `src/lib/components/layout/Sidebar.svelte` | 158 lines | Gradient sidebar, glow active states |
| `src/lib/components/layout/TopBar.svelte` | 121 lines | Backdrop blur/gradient shell styling |

## 2) Vercel-style visual system spec for next phases

### Visual principles

1. Dark neutral-first surfaces with restrained contrast steps.
2. Flat/near-flat composition; shadows are rare and subtle.
3. Thin, visible borders as the primary separation mechanism.
4. Compact density with consistent vertical rhythm.
5. Accent color is limited and functional (focus, selected, links, semantic states).
6. Motion is minimal and non-playful.

### Color role definitions (target contract)

Use one neutral ramp + one restrained accent ramp.

| Role | Target behavior |
| --- | --- |
| `canvas` | near-black app background |
| `surface-1` | primary panel/card background |
| `surface-2` | slightly raised layer (inputs, grouped controls) |
| `surface-3` | hover/selected neutral layer (very subtle delta) |
| `border-subtle` | default 1px border on almost all surfaces |
| `border-strong` | emphasized separators (active table row, selected card edge) |
| `text-primary` | high-contrast body/headline text |
| `text-secondary` | metadata, helper copy |
| `text-muted` | tertiary labels, timestamps, hints |
| `accent` | focus rings, selected tabs/nav, critical action emphasis |
| `semantic-success/warn/danger/info` | status-only usage, no decorative usage |

Required direction changes:

- Remove gradient-driven role tokens from core controls/shell.
- Remove dual-accent visual identity (`accent-primary` + `accent-secondary`) from default states.
- Keep semantic colors for state only.

### Border, radius, and shadow rules

- Border width: `1px` standard.
- Radius scale:
  - `sm`: 6px (inputs/chips)
  - `md`: 8px (buttons, tabs, compact cards)
  - `lg`: 10px (modals/drawers only)
  - pills only for badges and explicit chips.
- Shadow policy:
  - default cards/panels: no drop shadow
  - elevated surfaces (menu/modal): one subtle shadow token only
  - no glow shadows

### Spacing and density rules

- Base spacing remains 4px scale.
- Recommended rhythm for dense app surfaces:
  - control heights: 32px / 36px / 40px
  - card padding: 12px or 16px
  - page content gap: 12px to 16px
  - section blocks: 16px to 24px max
- Avoid oversized visual blocks unless product-critical.

### Typography rules

- Keep current font stack (`Inter`, `Cairo`) for now.
- Hierarchy target:
  - page title: 20px to 24px
  - section title: 16px to 18px
  - body: 14px
  - helper/meta: 12px to 13px
- Secondary text should be muted but readable; no low-contrast decorative styles.

### Interaction rules

- Hover:
  - neutral background delta and/or border tint only
  - no lift (`translateY`) for core enterprise controls
- Focus:
  - 1 clear focus treatment across all controls
  - no thick/glowy multi-ring combinations
- Selected/active:
  - subtle accent tint + border
  - no glow effects

### Component rules for Phases 2-5

#### Buttons

- Primary button becomes understated and solid (no gradient, no glow).
- Secondary/ghost buttons remain dark-neutral and border-led.
- Remove hover lift from all button variants.
- Size defaults should favor compact density.

#### Inputs and form fields

- Input shell must be crisp with dark neutral background and visible border.
- Focus uses accent border + subtle ring.
- Placeholder uses muted text role, not low-opacity hacks.

#### Cards/panels

- Default card style is flat neutral with thin border.
- Raised/elevated cards are opt-in only.
- Avoid dashed/decorative card treatments unless semantically required (for upload empty states only).

#### Tables and data surfaces

- `DataSurface` remains the structural standard for dense datasets.
- Table headers: compact, low-contrast uppercase labels.
- Row height and cell padding remain dense and consistent.
- Keep horizontal overflow scoped to table wrapper only.

#### Modals/drawers/menus

- Overlay darkening should be subtle and clean (no heavy blur dependency).
- Modal/drawer corners and padding should remain compact.
- Use one consistent elevated shadow token for modal/menu/drawer.

#### Navigation (sidebar, topbar, bottom nav)

- Remove shell gradients/glow treatments.
- Keep selected nav states restrained (border/tint, not halo).
- Keep nav icon containers simple and less rounded.

## 3) Current conflicts with target direction

### System-level conflicts

- `src/lib/styles/tokens.css`
  - gradient tokens (`--gradient-*`) and glow tokens (`--color-glow`) are core to current look.
  - accent model is visually colorful instead of restrained.
- `src/styles/global.css`
  - links and focus styles are accent-forward rather than subtle enterprise defaults.
- Active light mode introduces dual visual targets during refactor.

### Shell conflicts

- `src/App.svelte`, `src/lib/components/layout/AppShell.svelte`: radial gradient background usage.
- `src/lib/components/layout/Sidebar.svelte`: gradient sidebar and glow-heavy active nav.
- `src/lib/components/layout/TopBar.svelte`, `BottomNav.svelte`: blurred/glassy top/bottom surfaces.

### Primitive conflicts

- `src/lib/components/ui/Button.svelte`: gradient primary + glow + hover lift.
- `src/lib/components/ui/Card.svelte`, `Section.svelte`: shadow-forward defaults and larger radii.
- `src/lib/components/ui/ModalSurface.svelte`: blur-heavy overlay.
- `src/lib/components/ui/UploadModal.svelte`, `UploadPanel.svelte`, `UploadDropzone.svelte`: oversized text/controls and accent-heavy treatments.

### Local override conflicts

- `src/pages/Landing.svelte`: consumer-marketing style gradients/glow/animated lift.
- `src/pages/Home.svelte`: gradient hero title and oversized stats.
- `src/pages/Settings.svelte`, `Exams.svelte`, `Flashcards.svelte`: local button rules bypass primitive button contract.
- `src/pages/DocumentView.svelte`, `Documents.svelte`, `StudyHubIndex.svelte`, `StudyHubDocument.svelte`: many page-local `:global()` style hooks increase drift risk.

## 4) Controlled migration plan (Phases 2-5)

### Phase 2: Foundations (tokens + shell + primitives)

- Normalize core tokens to dark-neutral system and reduce decorative token set.
- Refactor shell surfaces (`App`, `AppShell`, `Sidebar`, `TopBar`, `BottomNav`) to border-led, low-effect style.
- Update core primitives (`Button`, `Card`, `FieldShell`, `Tabs`, `ModalSurface`, `MenuSurface`) to match the new contract.
- Keep functionality unchanged.

### Phase 3: Data-heavy and settings surfaces

- Apply updated primitives to admin/data surfaces and study/document management pages.
- Remove page-local button/input/card styling where primitive equivalent exists.
- Preserve current interaction flows and table behavior.

### Phase 4: Residual local overrides and consistency cleanup

- Remove remaining decorative/local overrides in `Home`, `Landing`, and detail pages.
- Reduce `:global()` coupling and replace with primitive-level contracts where possible.
- Align empty/error/loading states to one consistent surface language.

### Phase 5: QA, accessibility, and polish lock

- Run responsive checks (mobile/tablet/desktop) for all shell and dense data routes.
- Verify focus visibility, contrast, and keyboard paths after visual normalization.
- Resolve visual regressions and freeze styling rules for future work.

## 5) Minimal safe prep completed in Phase 1

- Added this implementation spec and audit document.
- Added a concise execution checklist document for Phases 2-5.
- Linked documentation from `README.md`.
- No runtime/frontend behavior changed.
