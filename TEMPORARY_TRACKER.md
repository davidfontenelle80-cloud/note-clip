# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 13B Attachment Storage Safety.

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

### 13B. Attachment Storage Safety
Status: Code-level implemented, awaiting live phone verification

Objective:
- Keep attachment growth safe for the shared Firebase free-plan quota.

Decisions:
- Total app attachment safety cap: 250 MB.
- Per attachment cap after compression: 5 MB.
- Warning threshold: 80% of the 250 MB cap.
- Current MVP still stores compressed Data URLs inside notes until later blob/file storage work.

Tasks:
- [x] Add attachment storage meter in Settings.
- [x] Show used storage, safety limit, percent used, photo count, PDF count, and remaining space.
- [x] Add Manage Storage modal showing largest attachments first.
- [x] Enforce 5 MB per-photo limit after compression.
- [x] Enforce 250 MB total attachment safety limit.
- [x] Show warning when storage is above 80%.
- [x] Bump service worker cache so meter and guardrails load.

Implementation notes:
- Added `js/attachment-meter.js`.
- Added `css/attachment-meter.css`.
- Updated `js/photo-attachments.js` to call `App.AttachmentMeter.canAdd()` before saving a photo.
- Updated `sw.js` to precache and inject the meter CSS/JS before photo attachments.
- Cache bumped to `note-clip-v79-attachment-storage-safety`.

Commits:
- `8212cc085af88c0411d66bb0a10bc0c769f2c664` — Add attachment storage meter.
- `408ae82d66a57ecd8e5613feba683b344a4ffadf` — Style attachment storage meter.
- `59d30f263d170cea2ab104ce6d4d3452bd8021b1` — Enforce attachment storage limits for photos.
- `b9e48455cc75c196caf6a069a1742ec1107e7031` — Load attachment storage meter.

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
- `js/attachment-meter.js` owns attachment stats and Settings meter.
- `css/attachment-meter.css` owns meter visuals.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [ ] Settings shows Attachments storage section.
- [ ] Attachment meter shows used storage / 250 MB.
- [ ] Manage Storage opens and lists largest attachments.
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
