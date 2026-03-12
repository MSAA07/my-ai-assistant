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

## Patterns to retire

Stop introducing local one-off classes that duplicate primitives:

- `.btn-*` variants for core action buttons.
- bespoke `.menu` / `.menu button` dropdown visuals.
- ad-hoc card panel shells (`border + radius + background + shadow`) when `Card` or `Section` fits.
- custom status chip implementations when `Badge`/`StatusBadge` fits.
- modal overlays/surfaces implemented directly in pages.

## Token contract

Primitives consume semantic tokens from `src/lib/styles/tokens.css` (`--ui-*`, `--color-*`, `--space-*`).
Do not hardcode raw hex values inside local component styles unless there is a domain-specific exception.
