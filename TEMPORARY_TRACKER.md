# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 16I — Color Save Handoff Repair

## Current status
Stage 16I is code implemented, not live approved.

## User-confirmed issue
The pastel swatches appeared in the category editor, but choosing a color and saving did not apply the color to the card.

## Audit findings
- `js/storage.js` is not the problem: `updateCategory(id, patch)` merges arbitrary patch fields and saves them, so `color` is supported.
- The original `js/notes.js` `_saveCat` source function saves only `name` and `icon`, not `color`.
- The previous capture handler was too narrow because it only caught buttons whose inline `onclick` contained `_saveCat`.
- The live modal can still show a primary Save button while the handler misses it.

## Implemented
- Updated `js/category-color-safe-picker.js` with broader Save detection.
- It now treats a category modal button as Save if:
  - its inline handler contains `_saveCat`, or
  - its text contains `Save`, or
  - it has the `btn-primary` class.
- Selected swatch color is now stored immediately on `#cat-modal.dataset.selectedColor` and in `#cat-color`.
- Save uses modal dataset color first, then hidden input, then current category color fallback.
- If the edit id is missing, save attempts a backup lookup by category name before adding a new category.
- No MutationObserver loop was added.
- Old risky `category-color-true-match.js` remains disabled.
- Cache bumped to `note-clip-v105-broader-color-save`.

## Files changed
- `js/category-color-safe-picker.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Commits
- `3958c4d69ee604719c11aae44b0bbce7fda9f650` — Broaden category color save detection.
- `227bf84fc4828beb0f080a7458e905f3b9771628` — Bump cache for broader color save detection.

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Open category edit.
- [ ] Pick Canary Yellow and Save.
- [ ] Confirm card changes color.
- [ ] Reopen category edit and confirm Canary Yellow remains selected.
- [ ] Pick another pastel and Save.
- [ ] Confirm card changes color.
- [ ] Confirm app does not freeze.

## Stop condition
Stop after Stage 16I live verification.
