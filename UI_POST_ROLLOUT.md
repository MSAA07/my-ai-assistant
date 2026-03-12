# UI Post-Rollout Notes (Phase 5)

Date: March 12, 2026
Branch: `stage`
Deployment commit: `cc0a81c457a25033c98588405af37015c6925dc7`

## Rollout scope

- Phase 2 foundations + tokens
- Phase 3 shared shell and primitive alignment
- Phase 4 core user-facing page composition cleanup
- Phase 5 admin parity pass + dense view consistency + responsive QA cleanup

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

## Known remaining issues

1. Extremely narrow admin widths (`<360px`) can still produce dense action wrapping in users table rows.
2. Sticky table headers are not implemented (intentionally deferred).

## Deferred improvements backlog

1. Optional sticky headers for long dense tables.
2. Optional visual regression screenshot automation for key shell/user/admin states.
3. Optional table-level interaction enhancements (sorting/pinning/configurable columns) as separate product work.
