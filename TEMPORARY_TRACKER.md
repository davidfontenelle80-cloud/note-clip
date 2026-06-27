# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 17A — Release Candidate Functional Audit

## Current status
Stage 17A is authorized and in progress.

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

## Guardrails
- Do not add OCR.
- Do not add cloud attachment sync.
- Do not rewrite the app.
- Do not touch Firebase/cloud config.
- Do not modify scanner/photo/PDF code unless a confirmed regression is found.
- Prefer small fixes over broad refactors.
- Bump service worker cache for any loaded JS/CSS change.

## Current known good checkpoint
Stage 16J added category context so opening a category and creating a note from there defaults the note category to the selected category.

## Stage 17A audit checklist
- [ ] Verify service worker still injects required scripts in safe order.
- [ ] Verify no disabled/risky color script is re-enabled.
- [ ] Verify category context helper cannot break notes outside a category.
- [ ] Verify category card `+` New Note still defaults to the chosen card category.
- [ ] Verify global FAB outside category view does not force stale category.
- [ ] Verify notes save path still requires title/body and saves category.
- [ ] Verify category color helper is display-only and does not intercept core note saving.
- [ ] Verify old temporary scripts are either disabled or safe.

## Files allowed for Stage 17A
- `TEMPORARY_TRACKER.md`
- `sw.js`
- small helper scripts only if a verified bug is found

## Stop condition
Stop Stage 17A after notes/categories audit and report. Do not proceed into scanner/attachments until Stage 17A is approved or a separate Stage 17B is authorized.
