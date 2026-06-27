# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 16A — Category Card Interaction Cleanup

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 16A is authorized. Scanner Stage 15F Repair remains code implemented but not live approved.

## Previous scanner checkpoint
Stage 15F Repair fixed Auto Crop confidence behavior and bumped cache to `note-clip-v91-auto-crop-repair`.

Scanner repair commits:
- `97dce5b7ca800030ec38f754b758ee9f05c823d3` — Repair scanner auto crop confidence.
- `1761655b28beee0b9599f1a108ab0d05fd9dce05` — Bump cache for auto crop repair.
- `c5f32dac4129f900990efc56769d7d23771f6e73` — Update tracker for auto crop fix.

## Stage 16A objective
Final interaction polish for category cards without changing scanner, storage, cloud sync, attachments, notes data, dashboard layout, or navigation.

## Stage 16A scope
Allowed:
- Category card interaction JS/CSS only.
- Service worker cache bump if loaded files change.
- Tracker update.

Required behavior:
- Tap category card body: open/view notes for that category.
- Tap small category-card `+`: open category-specific create menu.
- Tap category-card `...`: open category management menu.
- Optional long-press card body: open same management menu as `...`.
- Global floating `+`: unchanged.
- Do not mix create actions and management actions in the same menu.
- Add subtle press feedback only if low risk.

Files likely allowed:
- `js/category-card-add-menu.js`
- `js/category-card-polish.js`
- `css/category-card-polish.css`
- `sw.js`
- `TEMPORARY_TRACKER.md`

Files not allowed:
- `js/document-scanner-edge.js`
- scanner/PDF/photo attachment files
- Firebase/cloud sync files
- `storage.js`
- unrelated dashboard/list/calendar/settings files unless inspection proves category-card interactions live there

## Live phone test checklist
- [ ] Tap card body opens that category's notes.
- [ ] Tap small `+` opens only create menu.
- [ ] Create menu actions save into that category.
- [ ] Tap `...` opens only management menu.
- [ ] Management menu has Rename, Change Color, Edit Icon, Delete if currently supported.
- [ ] Long-press opens management menu if implemented.
- [ ] Global FAB behavior is unchanged.
- [ ] Scanner still opens.
- [ ] Photo/PDF review flows still work.

## Stop condition
Stop after Stage 16A only. Do not add OCR, cloud sync, live camera overlay, or broad redesign.
