# Phases 2-5 Visual Migration Checklist

Date: March 12, 2026  
Primary spec: `docs/VERCEL_STYLE_UI_SPEC_PHASE1.md`

## Phase 2: Foundations

- [x] Normalize tokens to dark-neutral, border-led contract
- [x] Deprecate gradient/glow tokens from shell and primary controls
- [x] Update shell surfaces (`App`, `AppShell`, `Sidebar`, `TopBar`, `BottomNav`)
- [x] Refit core primitives (`Button`, `Card`, `FieldShell`, `Tabs`, `ModalSurface`, `MenuSurface`)
- [x] Keep behavior and routing unchanged

## Phase 3: Shared shell and primitives

- [x] Apply primitive-first styling to shell + reusable components
- [x] Replace local button/input/card/menu/modal patterns with shared primitives
- [x] Standardize interaction states (`hover`, `active`, `selected`, `disabled`, `loading`, `focus-visible`)
- [x] Keep table/list overflow scoped to component wrappers

## Phase 4: Core user-facing pages

- [x] Reskin `Home`, `Study`, `Document`, and `Settings` page composition
- [x] Reduce page-level overrides where primitives own the style contract
- [x] Standardize empty/loading/error/state surfaces in primary user workflows

## Phase 5: Admin parity and QA lock

- [x] Reskin admin overview/users/sessions/storage/audit to match the same visual language
- [x] Standardize dense table/filter/bulk/action rows through `DataSurface` + primitive controls
- [x] Run final responsive and overflow QA pass on user + admin routes
- [x] Document final visual contract for post-migration work
