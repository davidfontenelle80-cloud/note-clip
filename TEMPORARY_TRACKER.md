# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 17A — Release Candidate Functional Audit

## Current status
Stage 17A is code implemented for notes/categories audit items, not live approved.

## Goal
Move from feature work into release-candidate stabilization. No new features. Only verified bug fixes, cleanup that lowers risk, and QA documentation.

## Stage 17A scope
Audit and stabilize the core workflows touched most recently:
- Notes create/edit/save/delete/archive/complete.
- Category navigation and category context.
- Category edit/manage/create menus.
- Category color picker/pastel swatches.
- Service worker script injection order.
- Duplicate/risky helper scripts.

## Audit findings
- Service worker injects scripts in a coherent order: card polish, color/card apply, safe color picker, category context, category add menu, back button, then attachment/scanner scripts.
- The old risky `category-color-true-match.js` is not injected.
- `category-color-safe-picker.js` is limited to `#cat-modal`; it should not intercept `#note-modal` note saves.
- `category-card-add-menu.js` already sets the chosen category when using the card `+` New Note action.
- `app.js` routes the global FAB in the Notes tab through `App.Notes.onFab()`, so `category-note-context.js` can correctly apply the current category in category note-list view.
- `app.js` routes Dashboard/Calendar FAB directly to `_openNoteModal(null)`, so those paths remain uncategorized by default and do not use stale category context.
- `notes.js` still validates note save with title/body required and writes `categoryId` from `#note-cat`.

## Implemented in Stage 17A
- Tightened `js/category-note-context.js` so brand-new notes opened from inside a category force the selected category into the dropdown.
- Existing-note edits are not forced because the helper only applies context for `!note` new-note modals.
- Cache bumped to `note-clip-v107-tight-category-context`.

## Files changed
- `js/category-note-context.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Commits
- `205cc5f5849dd35af3856264bffbe54b5da3b664` — Authorize release candidate audit.
- `d43c1f6375293fcdbfa5ab7247157f83a852be67` — Tighten category note context default.
- `6f3d789243070e0cf7f295f4654da71ddd2be8bc` — Bump cache for tightened category context.

## Stage 17A audit checklist
- [x] Verify service worker still injects required scripts in safe order.
- [x] Verify no disabled/risky color script is re-enabled.
- [x] Verify category context helper cannot break notes outside a category.
- [x] Verify category card `+` New Note still defaults to the chosen card category.
- [x] Verify global FAB outside category view does not force stale category.
- [x] Verify notes save path still requires title/body and saves category.
- [x] Verify category color helper is limited to category modal and does not intercept core note saving.
- [x] Verify old temporary scripts are either disabled or safe for this stage.

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Tap Work category card body.
- [ ] Tap global `+` from inside Work.
- [ ] Confirm note Category defaults to Work, not None.
- [ ] Save note and confirm it appears under Work.
- [ ] Go back to Categories / All Notes.
- [ ] Create note from global `+` outside a category and confirm it does not incorrectly force Work.
- [ ] Tap a category card `+` and confirm New Note still defaults to that card category.
- [ ] Edit an existing note in another category and confirm category is not overwritten.
- [ ] Confirm category color picker still opens and does not freeze.

## Next recommended stage
Stage 17B — Attachments and Scanner Regression Audit.

## Stop condition
Stop Stage 17A after live verification or proceed only with explicit authorization into Stage 17B.
