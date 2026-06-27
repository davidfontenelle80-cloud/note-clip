# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 16C — Card Edit Icon + Full Pastel Color

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 16C is authorized. Stage 16B remains code implemented and needs live approval.

## Recent checkpoints
Stage 16A cleaned up category-card interactions.
Stage 16B changed the category return button to `← Back` and bumped cache to `note-clip-v93-back-button-polish`.

## Stage 16C objective
Improve clarity and polish on category cards without changing layout or app behavior.

## Stage 16C scope
Allowed:
- Replace the category manage `...` visual with a pencil/edit icon.
- Make category card color apply to the whole card, not only the corner accent.
- Use lighter pastel card colors for readability.
- Preserve card body tap, card `+`, management menu, long press, and global FAB behavior.
- Minimal CSS/JS only.
- Service worker cache bump.
- Tracker update.

Files likely allowed:
- `js/category-card-polish.js`
- `js/cat-accent-apply.js`
- `css/category-card-polish.css`
- `sw.js`
- `TEMPORARY_TRACKER.md`

Files not allowed:
- Scanner files
- Photo/PDF attachment files
- Storage/cloud/Firebase files
- Notes data model
- Dashboard/list/calendar/settings files unless absolutely required

## Required behavior
- Category manage button displays a pencil/edit icon, not `...`.
- Management menu still opens from that button.
- Long press still opens management menu.
- The selected category color should tint the whole card softly.
- Text remains readable on all colors.
- The category create `+` button remains unchanged.

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Confirm card manage button shows a pencil/edit icon.
- [ ] Tap pencil and confirm management menu opens.
- [ ] Tap card `+` and confirm create menu still opens.
- [ ] Tap card body and confirm category opens.
- [ ] Long press card body and confirm management menu opens.
- [ ] Change category color and confirm whole card changes softly.
- [ ] Confirm text remains readable.
- [ ] Confirm global FAB still works.

## Stop condition
Stop after Stage 16C only. Do not add OCR, cloud sync, scanner changes, or redesign.
