# Data Surface Pattern

Date: March 12, 2026  
Status: Pattern defined, incremental adoption pending

## Why this exists

Admin/data-heavy screens currently repeat the same visual structure with local class names:

- panel header with title + refresh/actions
- filter controls row
- optional bulk actions row
- loading/error/empty content handling
- horizontal table wrapper

`DataSurface.svelte` defines this structure once so dense surfaces follow the same model.

## When to use this pattern

Use `DataSurface` when a view has one or more of:

- tabular datasets
- multiple filters/search controls
- row selection and bulk actions
- dense operational actions (refresh/revoke/delete/etc.)
- stateful data fetch UI (loading/error/empty)

Do not use it for simple marketing cards, single-action forms, or sparse dashboard hero sections.

## Structural contract

Use sections in this order:

1. Header
2. Filters
3. Panels (optional dense supporting cards/forms)
4. Bulk actions
5. State row
6. Table
7. Optional dense non-table content

Canonical scaffold:

```svelte
<DataSurface title="Users" description="Search and manage accounts.">
  <svelte:fragment slot="actions">
    <Button size="sm" variant="secondary">Refresh</Button>
  </svelte:fragment>

  <svelte:fragment slot="filters">
    <!-- FieldShell controls -->
  </svelte:fragment>

  <svelte:fragment slot="panels">
    <!-- Optional dense supporting cards/forms -->
  </svelte:fragment>

  <svelte:fragment slot="bulk">
    <!-- selection count + bulk buttons -->
  </svelte:fragment>

  <svelte:fragment slot="state">
    <!-- loading / error / empty -->
  </svelte:fragment>

  <svelte:fragment slot="table">
    <table class="ui-data-table">
      <!-- thead/tbody -->
    </table>
  </svelte:fragment>
</DataSurface>
```

## Visual rules

- Use primitive buttons/badges/fields inside the surface (`Button`, `Badge`, `FieldShell`).
- Keep table markup standard (`thead`, `tbody`, semantic `th`).
- Apply `.ui-data-table` class to opt into shared table header/cell styles.
- Keep one surface per primary dataset; avoid nesting one full table surface inside another.

## Spacing rules

- Surface-level vertical rhythm is controlled by `DataSurface` (`gap: var(--space-4)` by default).
- Filters use a responsive grid with `minmax(180px, 1fr)`.
- Action rows (`actions`, `bulk`) use wrap-capable flex rows with `var(--space-2)` gaps.

## Responsive expectations

- Horizontal overflow must be contained to the table wrapper, never at page level.
- Filters collapse to one column on small widths (`<= 640px`).
- Action rows wrap naturally; no fixed-width button groups that force horizontal overflow.
- Use `tableMinWidth` when table density demands minimum readable columns.

## State handling expectations

- Keep fetch states near the data surface in `slot="state"`.
- One of loading/error/empty/data should be prominent at a time.
- Error states should use primitive visual language (`Card` soft + strong border or equivalent).

## Adoption plan

Pattern-first phase only:

1. Establish shared primitive (`DataSurface`) and contract docs.
2. Migrate admin tables incrementally (`Users`, `Sessions`, `Storage`, `Audit`).
3. Normalize remaining dense data surfaces after admin convergence.
