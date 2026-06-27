# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 16D — True Color Match + Button Stack

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 16D is partially code implemented, not live approved.

## Implemented
- Added a category color picker override with Pastel and Bold color groups.
- Category editor now saves the selected color.
- Card display now uses the selected color directly instead of hidden pastel conversion.
- Strong colors get light text for readability.
- Pastel colors keep dark text for readability.
- Whole card uses the chosen color.
- Cache bumped to `note-clip-v95-true-color-match`.

## Not completed
- Pencil-above-plus positioning was attempted through CSS and JS, but GitHub connector safety blocked the positioning patches.
- Existing pencil button remains available and still opens management.
- Plus button remains unchanged and still opens creation.

## Files changed
- `js/category-color-true-match.js`
- `js/cat-accent-apply.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Commits
- `22aa834a7a58150403153c1708e09ee4ffc39f38` — Authorize true color match stage.
- `fee077d681e1a699462c3460fc665a9f549f72bc` — Add true matching category color picker.
- `4fd48145fa9ba10fc69db78bb4ac4c1170966817` — Use exact card colors.
- `75f8fd7c235e269640d396e4175e4082591ba16c` — Make selected color display exactly.
- `529d40fd443638a822d8320f47e572f97d121b95` — Bump cache for true color picker.

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Open category edit.
- [ ] Confirm color choices include Pastel and Bold groups.
- [ ] Pick a pastel color and save.
- [ ] Confirm the whole card matches that selected color.
- [ ] Pick a bold color and save.
- [ ] Confirm the whole card matches that selected color.
- [ ] Confirm text remains readable on bold and pastel colors.
- [ ] Confirm pencil opens management menu.
- [ ] Confirm plus opens create menu.
- [ ] Confirm card body opens category.
- [ ] Confirm global FAB still works.
- [ ] Confirm scanner still opens.

## Next authorized stage
Stage 16D live phone verification for color matching only. Pencil-above-plus positioning remains blocked and should be handled as a separate tiny patch if connector allows.

Do not begin OCR, cloud sync, scanner changes, or broad redesign.
