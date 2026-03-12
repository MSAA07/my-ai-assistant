# UI Primitive Usage

This folder defines the shared visual primitives for dark-first SaaS styling. Use these components instead of recreating local button/card/input/modal/dropdown visuals.

## Components

- `Button.svelte`
  - Use for all interactive actions.
  - Variants: `primary`, `secondary`, `ghost`, `danger`, `success`.
  - Sizes: `sm`, `md`, `lg`, `icon`.
  - Supports: `loading`, `disabled`, `block`, `slot="icon"`.

- `Card.svelte`
  - Use for surfaced containers and panel-like groups.
  - Variants: `base`, `raised`, `soft`, `overlay`.
  - Border styles: `subtle`, `strong`, `accent`, `dashed`, `none`.
  - Padding: `none`, `sm`, `md`, `lg`.

- `DataSurface.svelte`
  - Use for dense admin/data-heavy shells (tables, filter bars, bulk actions, and state rows).
  - Named slots: `header`, `actions`, `filters`, `bulk`, `state`, `table`.
  - Table contract: apply class `.ui-data-table` to the table element for shared cell/header styling.
  - Handles horizontal table overflow at the surface level, not page level.

- `FieldShell.svelte`
  - Use for labeled form controls.
  - Handles label/meta/error and focus/border consistency.
  - Wrap native `input`, `textarea`, or `select` in the default slot.

- `Badge.svelte`
  - Use for status, metadata chips, and compact labels.
  - Tones: `neutral`, `accent`, `info`, `success`, `warning`, `danger`.
  - Variants: `soft`, `outline`, `solid`.
  - Sizes: `xs`, `sm`, `md`.

- `Tabs.svelte`
  - Use for segmented controls and simple tab selectors.
  - Controlled by `value`; emits `change` with `{ value }`.
  - Supports stacked labels via `meta` + `stacked`.

- `ModalSurface.svelte`
  - Use as the base shell for dialogs.
  - Handles backdrop, escape-close, elevation, and width/padding tokens.
  - Emits `close` for overlay/escape dismissals.

- `MenuSurface.svelte` and `MenuItem.svelte`
  - Use for dropdown/overflow menu containers and row actions.
  - Keeps menu border/radius/elevation and item states consistent.

- `Section.svelte`
  - Use for page section wrappers with optional heading/actions layout.

## Dense data-surface pattern

Use `DataSurface.svelte` as the shared structure for data-heavy admin screens.

Expected section order (top to bottom):

1. Header (`title/description` or `slot="header"`) + `slot="actions"`
2. `slot="filters"` for query controls and filter fields
3. `slot="bulk"` for selection-aware action rows
4. `slot="state"` for loading/error/empty messaging
5. `slot="table"` containing `<table class="ui-data-table">...</table>` for tabular data
6. default slot for dense non-table content (optional)

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

## Coverage snapshot

Primitive-driven styling now covers:

- shared app shell and main study surfaces (Phase 2 scope)
- auth screens (`SignIn`, `SignUp`)
- admin overview, users, sessions, storage, audit, and user detail modal

## Deferred redesign work

These areas are intentionally left for future structural redesign, not primitive normalization:

- dense data-table UX beyond visual shell normalization (sorting, pinning, column configuration)
- upload-zone interaction ergonomics in `Home.svelte` (behavior and IA decisions)
- legacy `AppHeader` fallback path when `VITE_FEATURE_APPSHELL` is disabled

## Recommended next UI tasks

1. Adopt `DataSurface` across admin `Users`, `Sessions`, `Storage`, and `Audit` screens.
2. Consolidate table empty/loading/error markup into shared state fragments.
3. Run a focused responsive polish pass on small-screen admin workflows after adoption.

Post-rollout execution notes and backlog are tracked in `UI_POST_ROLLOUT.md` at the frontend root.

## Token contract

Primitives consume semantic tokens from `src/lib/styles/tokens.css` (`--ui-*`, `--color-*`, `--space-*`).
Do not hardcode raw hex values inside local component styles unless there is a domain-specific exception.
