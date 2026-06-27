# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 16E — Category Editor Cleanup + Color Save Fix

## Current status
Stage 16E is authorized.

## User-confirmed bug
The category editor shows mixed UI systems at once:
- New Card color picker.
- Old Card Accent Color / Preview corner area.
- Icon picker overlaps below the old color area.

The selected color also did not update the card reliably after save.

## Objective
Clean up the category editor and make color selection save/apply correctly.

## Required behavior
- Show only one color system: Card color.
- Hide/remove old Card Accent Color / Preview corner UI.
- Keep category icon picker visible and usable.
- Selected color must save into the category record.
- Full card must update to the selected color after Save.
- Preserve pencil/manage behavior.
- Preserve plus/create behavior.
- Preserve card body open behavior.
- Preserve global FAB.
- Do not touch scanner, cloud, storage schema, attachments, or broad layout.

## Files allowed
- `js/category-color-true-match.js`
- `js/cat-accent-apply.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Open category edit.
- [ ] Confirm old Card Accent Color / Preview corner UI is gone.
- [ ] Confirm Card color picker appears once.
- [ ] Confirm Category Icon picker still appears cleanly below color picker.
- [ ] Pick a pastel color and Save.
- [ ] Confirm full card color changes to selected color.
- [ ] Pick a bold color and Save.
- [ ] Confirm full card color changes to selected color.
- [ ] Confirm pencil opens management menu.
- [ ] Confirm plus opens create menu.
- [ ] Confirm scanner still opens.

## Stop condition
Stop after Stage 16E only.
