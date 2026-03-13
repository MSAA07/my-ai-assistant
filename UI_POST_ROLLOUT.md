# UI Post-Rollout Notes (Phase 5 + Final Parity Sync)

Date: March 13, 2026
Branch: `stage`
Deployment commit: pending next stage push

## Rollout scope

- Phase 2 foundations + tokens
- Phase 3 shared shell and primitive alignment
- Phase 4 core user-facing page composition cleanup
- Phase 5 admin parity pass + dense view consistency + responsive QA cleanup
- Final parity pass: shared hero/meta normalization, upload primitive cleanup, and documentation sync

## Visual QA coverage

Desktop:
- shell + home + study index + study detail + legacy activity detail + settings
- admin overview/users/sessions/storage/audit

Tablet:
- admin filters/actions and table wrappers
- document/study action rows and state panels

Mobile:
- bottom navigation + shell content spacing
- admin tabs/filters/actions (stack/wrap behavior)
- home upload workflow, document list cards, detail action controls

Artifacts are tracked under the local `qa/` workspace directory.

## Final design system usage expectations

- Continue using primitives in `src/lib/components/ui/*` as the default for all shared surfaces.
- Use `tokens.css` semantic tokens (`--ui-*`, `--color-*`, `--space-*`) as the source of visual values.
- Keep `global.css` foundation-only; component visuals stay local to `.svelte` files.
- For new work, do not introduce one-off local button/card/modal styles when `Button`, `Card`, `ModalSurface`, `FieldShell`, `Tabs`, and `Badge` already cover the use case.
- Prefer `MetaPill` for repeated label/value chips in heroes and document metadata rows.
- Treat `DocumentView.svelte` as the consolidated legacy study activity screen; do not split summary/flashcards/exam logic unless routes change intentionally.

## Known remaining issues

1. Extremely narrow admin widths (`<360px`) can still produce dense action wrapping in users table rows.
2. Sticky table headers are not implemented (intentionally deferred).
3. Some page hero compositions are still page-local rather than a single shared `PageHero` primitive.

## Deferred improvements backlog

1. Optional sticky headers for long dense tables.
2. Optional visual regression screenshot automation for key shell/user/admin states.
3. Optional table-level interaction enhancements (sorting/pinning/configurable columns) as separate product work.
