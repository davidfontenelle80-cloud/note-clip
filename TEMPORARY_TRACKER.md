# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 13C Storage Manager Actions.

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

### 13. Photo Attachments MVP
Status: Code-level implemented, live phone verified

### 13B. Attachment Storage Safety
Status: Code-level implemented, live phone verified

Decisions:
- Total app attachment safety cap: 250 MB.
- Per attachment cap after compression: 5 MB.
- Warning threshold: 80% of the 250 MB cap.
- Current MVP still stores compressed Data URLs inside notes until later blob/file storage work.

### 13C. Storage Manager Actions
Status: Code-level implemented, awaiting live phone verification

Objective:
- Make Manage Storage actually actionable before moving to PDF support.

Tasks:
- [x] Add View button for each attachment in Manage Storage.
- [x] Add Delete button for each attachment in Manage Storage.
- [x] View image opens full-screen photo viewer.
- [x] Delete removes only the attachment, not the note.
- [x] Storage meter refreshes after delete.
- [x] Notes view refreshes after delete.
- [x] Update mobile layout for action buttons.
- [x] Bump service worker cache so actions load.

Implementation notes:
- Updated `js/attachment-meter.js` so storage items carry `noteId`, `id`, and `dataUrl`.
- Added `App.AttachmentMeter.view()` and `App.AttachmentMeter.remove()`.
- Updated `css/attachment-meter.css` for mobile-friendly View/Delete actions.
- Cache bumped to `note-clip-v80-storage-manager-actions`.

Commits:
- `f669b8b4dc91e6e37ef3ccceb8484da11ee69656` — Add view and delete actions to storage manager.
- `0076c5160b4599e76c22eb23001558dcca8cd5cd` — Style storage manager actions.
- `213cfc49da4122b6215ebfb59a49a1c2d1444f70` — Bump cache for storage manager actions.

## Attachment feature roadmap

### Stage 14 — PDF attachment MVP
Pending. Add PDF file picker, PDF metadata, PDF preview card/open behavior, and delete support.

### Stage 15 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

### Stage 16 — Document scanner
Pending. Add document capture, crop/straighten, and PDF creation.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/photo-attachments.js` owns local photo attachment MVP behavior and now checks storage limits.
- `js/attachment-meter.js` owns attachment stats, Settings meter, and Manage Storage actions.
- `css/attachment-meter.css` owns meter/action visuals.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [x] Settings shows Attachments storage section.
- [x] Attachment meter shows used storage / 250 MB.
- [x] Manage Storage opens and lists largest attachments.
- [ ] Manage Storage View opens image viewer.
- [ ] Manage Storage Delete removes only the attachment.
- [ ] Storage meter updates after deleting attachment.
- [ ] Photo from category-card + still opens image picker/camera.
- [ ] Selected photo creates note in correct category.
- [ ] Photo thumbnail appears on note card.
- [ ] Photo appears inside edit note modal.
- [ ] Add Photo works on existing saved note.
- [ ] 5 MB post-compression limit blocks oversized attachment.
- [ ] 80% storage warning appears when applicable.
- [ ] PDF placeholder shows Coming next.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
