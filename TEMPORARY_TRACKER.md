# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 14 PDF Attachment MVP.

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
Status: Code-level implemented, live phone verified

### 14. PDF Attachment MVP
Status: Code-level implemented, awaiting live phone verification

Objective:
- Enable PDF attachments using the same attachment/storage framework as photos.

Tasks:
- [x] Make category-card + > PDF active.
- [x] Open PDF file picker from PDF action.
- [x] Create a new note in that category with the PDF attached.
- [x] Store PDF attachment metadata on the note record.
- [x] Show PDF badge on note cards.
- [x] Show PDF cards inside edit note modal.
- [x] Allow adding a PDF to an existing saved note.
- [x] Allow tapping PDF to open a full-screen viewer.
- [x] Allow deleting PDF from a note.
- [x] Enforce existing 5 MB per-attachment / 250 MB total safety limits.
- [x] Bump service worker cache so PDF assets load.

Implementation notes:
- Added `js/pdf-attachments.js`.
- Updated `js/category-card-add-menu.js` so PDF launches `App.PdfAttachments.createPdfNote(cat.id)`.
- Added PDF card/viewer styles to `css/attachment-meter.css`.
- Updated `sw.js` to precache and inject `js/pdf-attachments.js`.
- Cache bumped to `note-clip-v81-pdf-attachments-mvp`.

Commits:
- `044e8d838d4253a3d13d3cdcbcac777dd76cab11` — Add PDF attachment MVP.
- `69b900b449f0de1f6abb80b8f21c53f4a36dc1eb` — Enable PDF action from category create menu.
- `8589b8081eb6e4ad9d4599d9c93a6d6bc2be51f7` — Style PDF attachment previews.
- `78fdefbef81fccdc365229ad24275f5ecad28fc0` — Load PDF attachment MVP.

## Attachment feature roadmap

### Stage 15 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

### Stage 16 — Document scanner
Pending. Add document capture, crop/straighten, and PDF creation.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/photo-attachments.js` owns local photo attachment behavior and storage checks.
- `js/pdf-attachments.js` owns local PDF attachment behavior and storage checks.
- `js/attachment-meter.js` owns attachment stats, Settings meter, and Manage Storage actions.
- `css/attachment-meter.css` owns storage meter, storage actions, and PDF preview/viewer visuals.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [x] Settings shows Attachments storage section.
- [x] Attachment meter shows used storage / 250 MB.
- [x] Manage Storage opens and lists largest attachments.
- [x] Manage Storage View opens image viewer.
- [x] Manage Storage Delete removes only the attachment.
- [x] Storage meter updates after deleting attachment.
- [ ] PDF from category-card + opens file picker.
- [ ] Selected PDF creates note in correct category.
- [ ] PDF badge appears on note card.
- [ ] PDF card appears inside edit note modal.
- [ ] Add PDF works on existing saved note.
- [ ] Tapping PDF opens full-screen viewer.
- [ ] Deleting PDF removes it from note.
- [ ] Photo workflow still works.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
