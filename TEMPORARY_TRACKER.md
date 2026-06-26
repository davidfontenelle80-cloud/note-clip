# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 13 Photo Attachments MVP.

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Stabilization checklist

### 6. Service worker UI hotfix cleanup
Status: BLOCKED / deferred for safe-source-edit limitation

Tasks:
- [ ] Remove UI CSS/link/markup patching from `sw.js` after source files are complete.
- [x] Keep cache and push behavior intact.
- [ ] Bump cache version once when completed.

Audit notes:
- `sw.js` still has HTML patching responsibilities until `index.html` can be safely edited directly.
- Use local clone/Codex full-file access later.

### 7. List modal keyboard check
Status: Pending

Tasks:
- [ ] Test Lists + workflow.
- [ ] Fix autofocus/keyboard overlap only if confirmed.

### 8. Greeting logic fix
Status: Code-level implemented, live phone verified

### 9. FAB category creation routing fix
Status: Code-level implemented, live phone verified after standalone modal fallback

### 10. Notes category card polish
Status: Code-level implemented, awaiting live phone verification

### 11. Editable category accent colors
Status: Code-level implemented, awaiting live phone verification

### 12. Category card create menu / attachment roadmap Stage A-B
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Add a small + button to each category card.
- [x] Tapping category card still opens that category.
- [x] Tapping three-dot menu still opens Edit/Delete.
- [x] Tapping category-card + opens Create in [Category].
- [x] New Note works and preselects that category.
- [x] PDF appears as Coming next placeholder.
- [x] Bump service worker cache so new script loads.

### 13. Photo Attachments MVP
Status: Code-level implemented, awaiting live phone verification

Objective:
- Enable first local attachment type: photos/images.

Tasks:
- [x] Make category-card + > Photo active.
- [x] Open image picker/camera from Photo action.
- [x] Compress selected photo before saving.
- [x] Create a new note in that category with the photo attached.
- [x] Store photo attachment metadata on the note record.
- [x] Show photo thumbnails on note cards.
- [x] Show attachment gallery inside edit note modal.
- [x] Allow adding another photo to an existing saved note.
- [x] Allow tapping photo to open full-screen viewer.
- [x] Allow deleting a photo from a note.
- [x] Keep PDF as Coming next.
- [x] Bump service worker cache so photo attachment script loads.

Implementation notes:
- Added `js/photo-attachments.js`.
- Uses image file input and client-side canvas compression.
- Stores MVP image data as compressed Data URL inside `note.attachments`.
- Adds note-card thumbnails and edit-modal attachment gallery without changing the base `js/notes.js` save flow.
- Added photo preview/viewer styles to `css/category-card-polish.css`.
- `js/category-card-add-menu.js` now routes Photo to `App.PhotoAttachments.createPhotoNote(cat.id)`.
- `sw.js` now precaches and injects `js/photo-attachments.js`.
- Cache bumped to `note-clip-v78-photo-attachments-mvp`.

Commits:
- `2945feec0ba458e8130a94f58a2ca07944a09713` — Add photo attachment MVP.
- `6065293d4013fc31317d022cd1f820a0fa70073a` — Enable photo action from category create menu.
- `dd40b9fab2516e6497a1fb957dfa965809a5756e` — Style photo attachment previews.
- `e74e4cfa3e748c0bb7fc4e9a53182c45d707e6ae` — Load photo attachment MVP.

## Attachment feature roadmap

### Stage 14 — PDF attachment MVP
Pending. Add PDF file picker, PDF metadata, PDF preview card/open behavior, and delete support.

### Stage 15 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/dashboard.js` greeting logic now treats early morning as morning.
- `js/fab-hotfix.js` owns robust floating + button routing, category modal fallback, and category accent editing.
- `css/category-card-polish.css`, `js/category-card-polish.js`, and `js/cat-accent-apply.js` own the refreshed category-card UI and editable corner accent.
- `js/category-card-add-menu.js` owns the category-card + create menu.
- `js/photo-attachments.js` owns local photo attachment MVP behavior.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [ ] Category cards show only the more button, not separate edit/delete circles.
- [ ] More button opens Edit / Delete menu.
- [ ] Edit opens edit category modal.
- [ ] Card Accent Color appears in Add/Edit Category.
- [ ] No Color removes the card corner accent.
- [ ] Color choice saves and appears on the category card.
- [ ] Category-card + appears on each category card.
- [ ] Category-card + opens Create in [Category].
- [ ] New Note from category-card + opens note modal with that category selected.
- [ ] Photo from category-card + opens image picker/camera.
- [ ] Selected photo creates note in correct category.
- [ ] Photo thumbnail appears on note card.
- [ ] Photo appears inside edit note modal.
- [ ] Add Photo works on existing saved note.
- [ ] Tapping photo opens full-screen viewer.
- [ ] Deleting photo removes it from note.
- [ ] PDF placeholder shows Coming next.
- [ ] Delete category still confirms/deletes correctly.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
