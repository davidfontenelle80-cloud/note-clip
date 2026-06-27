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
Stage 16D is authorized. Stage 16C remains code implemented and needs live approval.

## Stage 16D objective
Fix the category color mismatch and improve the card action layout in one tight sweep.

## Required behavior
- The selected category color must match the final card color.
- Stop hidden pastel conversion after selection.
- Provide both pastel and stronger color choices in the category editor.
- The whole category card should use the chosen color.
- Text must remain readable.
- Pencil/edit button should sit above the plus button as a vertical action rail.
- Pencil still opens category management.
- Plus still opens category create menu.
- Card body still opens category notes.
- Long press still opens category management.
- Global FAB remains unchanged.

## Files likely allowed
- `js/cat-accent-apply.js`
- `js/category-card-polish.js`
- `css/category-card-pastel-color.css`
- possible tiny category color override file
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Files not allowed
- Scanner files
- Photo/PDF attachment files
- Storage/cloud/Firebase files
- Notes data model unless inspection proves color saving cannot work otherwise
- Dashboard/list/calendar/settings files

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Pencil appears above plus on each card.
- [ ] Pencil opens management menu.
- [ ] Plus opens create menu.
- [ ] Card body opens category.
- [ ] Color choices include pastel and stronger colors.
- [ ] Selected color matches the full card color.
- [ ] Text remains readable.
- [ ] Global FAB still works.
- [ ] Scanner still opens.

## Stop condition
Stop after Stage 16D only. Do not add OCR, cloud sync, scanner changes, or broad redesign.
