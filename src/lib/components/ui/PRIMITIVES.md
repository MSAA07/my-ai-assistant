# UI Primitive Usage

This folder defines the shared visual primitives for the universal frontend design system. Use these components instead of recreating local button/card/input/modal/dropdown/hero/progress visuals.

## Token source of truth

- Global tokens live in `src/lib/styles/tokens.css`.
- Use semantic tokens first: `--ui-*` for layout/surfaces/typography/motion, and keep `--color-*` / legacy aliases as compatibility only.
- Do not hardcode page-specific hex colors inside components when a semantic token already exists.
- The system is dual-theme: dark is primary, light remains fully supported through semantic token remapping.

## Components

- `Button.svelte`
  - Use for all interactive actions.
  - Variants: `primary`, `secondary`, `outline`, `ghost`, `success`, `destructive`.
  - Backward-compatible aliases: `danger -> destructive`, `back -> outline`, plus legacy `warning`.
  - Sizes: `sm`, `md`, `lg`, `icon`.
  - Supports: `loading`, `disabled`, `block`, `slot="icon"`.

- `Card.svelte`
  - Use for surfaced containers and panel-like groups.
  - Canonical variants: `standard`, `secondary`, `study`, `overlay`.
  - Backward-compatible aliases: `base -> standard`, `raised -> secondary`, `soft -> secondary`.
  - Border styles: `default`, `strong`, `dashed`, `none`.
  - Backward-compatible aliases: `subtle -> default`, `accent -> strong`.
  - Padding: `none`, `sm`, `md`, `lg`.

- `DataSurface.svelte`
  - Use for dense admin/data-heavy shells (tables, filter bars, bulk actions, and state rows).
  - Named slots: `header`, `actions`, `filters`, `panels`, `bulk`, `state`, `table`.
  - Table contract: apply class `.ui-data-table` to the table element for shared cell/header styling.
  - Handles horizontal table overflow at the surface level, not page level.

- `FieldShell.svelte`
  - Use for labeled form controls.
  - Handles label/meta/error and focus/border consistency.
  - Wrap native `input`, `textarea`, or `select` in the default slot.

- `Badge.svelte`
  - Use for status, metadata chips, and compact labels.
  - Tones: `neutral`, `accent`, `info`, `success`, `warning`, `destructive`.
  - Backward-compatible alias: `danger -> destructive`.
  - Variants: `soft`, `outline`, `solid`.
  - Sizes: `xs`, `sm`, `md`.

- `Tabs.svelte`
  - Use for segmented controls and simple tab selectors.
  - Controlled by `value`; emits `change` with `{ value }`.
  - Variants: `pill`, `underline`.
  - Supports stacked labels via `meta` + `stacked`.

- `Toggle.svelte`
  - Use for compact switch-style binary controls.
  - Controlled by `checked`; emits `change` with `{ checked }`.
  - Current connected use: the admin QA Auto Health Monitor toggle.

- `StatCard.svelte`
  - Use for dashboard and analytics metrics.
  - Props: `label`, `value`, `meta`, optional icon slot, and `valueClassName`.

- `MetaPill.svelte`
  - Use for compact label/value metadata chips in page heroes and document headers.
  - Default contract: uppercase muted label + strong value/content.
  - Prefer this over page-local metadata chip markup.

- `ModalSurface.svelte`
  - Use as the base shell for dialogs.
  - Handles backdrop, escape-close, elevation, and width/padding tokens.
  - Emits `close` for overlay/escape dismissals.

- `MenuSurface.svelte` and `MenuItem.svelte`
  - Use for dropdown/overflow menu containers and row actions.
  - Keeps menu border/radius/elevation and item states consistent.

- `Section.svelte`
  - Use for page section wrappers with optional heading/actions layout.

- `PageHeader.svelte`
  - Use for the standard page/header pattern across home, study hub, settings, admin, and document detail screens.
  - Supports eyebrow, title, subtitle, optional `slot="actions"`, and optional `slot="meta"`.
  - Replaces page-local hero card implementations.

- `ProgressBar.svelte`
  - Use for shared horizontal progress rails in study flows, previews, and status surfaces.
  - Props: `value`, `max`, `ariaLabel`.

- `FocusedStudyLayout.svelte`
  - Use for summary, flashcard, and exam-focused layouts.
  - Applies calmer width, centered study content, and shared section spacing.

- `DocumentCard.svelte`
  - Use for study/library document cards.
  - Supports badge, status, metadata, highlight state, and action slot.

- `StudyActionCard.svelte`
  - Use for document-hub feature cards (summary/flashcards/exam) and similar study-entry actions.
  - Supports title, status, description slot, body slot, and actions slot.

## Dense data-surface pattern

Use `DataSurface.svelte` as the shared structure for data-heavy admin screens.

Expected section order (top to bottom):

1. Header (`title/description` or `slot="header"`) + `slot="actions"`
2. `slot="filters"` for query controls and filter fields
3. `slot="panels"` for dense supporting cards/forms that belong to the dataset
4. `slot="bulk"` for selection-aware action rows
5. `slot="state"` for loading/error/empty messaging
6. `slot="table"` containing `<table class="ui-data-table">...</table>` for tabular data
7. default slot for dense non-table content (optional)

Spacing and behavior rules:

- Keep row spacing tokenized through the primitive (`--space-*`); avoid one-off panel spacing classes.
- Keep table overflow scoped to `DataSurface` wrapper (`overflow-x:auto`) so pages do not horizontally scroll.
- Keep filter rows responsive via auto-fit layout; stack to a single column on narrow widths.
- Keep action rows (`actions`, `bulk`) wrap-capable and avoid hard-coded fixed widths.

Detailed reference: `DATA_SURFACE_PATTERN.md` in this folder.

## Patterns to retire

Stop introducing local one-off classes that duplicate primitives:

- `.btn-*` variants for core action buttons.
- bespoke `.menu` / `.menu button` dropdown visuals.
- ad-hoc card panel shells (`border + radius + background + shadow`) when `Card` or `Section` fits.
- custom status chip implementations when `Badge`/`StatusBadge` fits.
- modal overlays/surfaces implemented directly in pages.
- auth form wrappers that do not use `Card + FieldShell + Button`.
- admin action rows that use raw `<button>` styling when `Button` variants already match.

## Common reusable page patterns

- page header card with eyebrow, title, subtitle, optional actions, and optional metadata row
- metadata pill rows (`MetaPill`) for document/settings/admin hero metadata
- focused study shells via `FocusedStudyLayout`
- shared progress rails via `ProgressBar`
- panel header with status badge for study and admin summaries
- dense data-table surfaces via `DataSurface`
- admin QA history, per-test breakdowns, monitor controls, and failure-report dialogs should keep using `DataSurface`, `Badge`, `Button`, `FieldShell`, `Toggle`, and `ModalSurface` rather than local visual shells

## Deferred redesign work

These areas are intentionally left for future structural redesign, not primitive normalization:

- dense data-table UX beyond visual shell normalization (sorting, pinning, column configuration)
- upload-zone interaction ergonomics in `Home.svelte` (behavior and IA decisions)
- legacy `AppHeader` fallback path when `VITE_FEATURE_APPSHELL` is disabled

## Recommended next UI tasks

1. Keep new dense views aligned to `DataSurface` slot contract before introducing local wrappers.
2. Add optional visual regression snapshots for shell + dense data routes.
3. Revisit sticky table headers only if future data density justifies it.

Post-rollout execution notes and backlog are tracked in `UI_POST_ROLLOUT.md` at the frontend root.
Route ownership and runtime behavior live in the frontend `SYSTEM_OVERVIEW.md`.

## Token contract

Primitives consume semantic tokens from `src/lib/styles/tokens.css` (`--ui-*`, `--color-*`, `--space-*`).
Use `--ui-*` as the authoritative API for new work and treat compatibility aliases as transitional only.

Last Updated: June 7, 2026
