# Phases 2-5 Visual Migration Checklist

Date: March 12, 2026  
Primary spec: `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`

## Phase 2: Foundations

- [ ] Normalize tokens to dark-neutral, border-led contract
- [ ] Deprecate gradient/glow tokens from shell and primary controls
- [ ] Update shell surfaces (`App`, `AppShell`, `Sidebar`, `TopBar`, `BottomNav`)
- [ ] Refit core primitives (`Button`, `Card`, `FieldShell`, `Tabs`, `ModalSurface`, `MenuSurface`)
- [ ] Keep behavior and routing unchanged

## Phase 3: Data and settings surfaces

- [ ] Apply primitive-first styling to document/admin/settings surfaces
- [ ] Replace local button/input/card styles with shared primitives
- [ ] Normalize table/filter density via `DataSurface`
- [ ] Keep table overflow scoped to component wrappers

## Phase 4: Local override cleanup

- [ ] Remove decorative page-specific styling in `Landing`, `Home`, and detail pages
- [ ] Reduce page-level `:global()` hooks where shared primitives can own style
- [ ] Standardize empty/loading/error state visuals

## Phase 5: QA and lock

- [ ] Run responsive QA on shell, study, document, and admin routes
- [ ] Verify keyboard/focus behavior and contrast
- [ ] Remove leftover visual inconsistencies
- [ ] Document final visual contract and enforce primitive usage for new UI work
