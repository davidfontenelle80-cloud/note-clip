# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 15B Scanner Auto-Crop Polish.

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

### 13C. Storage Manager Actions
Status: Code-level implemented, live phone verified

### 14. PDF Attachment MVP
Status: Code-level implemented, live phone verified with observation: first reader view was too small.

### 14B. Full-Screen PDF Reader
Status: Code-level implemented, awaiting live phone verification

### 15. Document Scanner MVP
Status: Code-level implemented, live phone verified with observation: output looked like a photo, not a scanner.

### 15B. Scanner Auto-Crop Polish
Status: Code-level implemented, awaiting live phone verification

Objective:
- Improve scan quality so scanned documents look more like document PDFs and less like raw camera photos.

Tasks:
- [x] Add automatic paper edge bounding-box detection.
- [x] Auto-crop the scan to the detected paper area.
- [x] Add review screen before saving.
- [x] Add Rotate action for sideways/upside-down captures.
- [x] Add Use Full Page fallback.
- [x] Enhance contrast/brightness after crop.
- [x] Convert cropped/enhanced image into a PDF that fills the page better.
- [x] Reuse existing PDF card/viewer/storage behavior.
- [x] Load scanner polish through service worker.

Implementation notes:
- Added `js/document-scanner-edge.js` as an override after the original scanner MVP.
- Added `js/document-scanner-styles.js` for scanner review styling, but the current loader path still needs live confirmation because the service worker was successfully updated for the edge script and not for the style helper.
- Updated `sw.js` to precache and inject `js/document-scanner-edge.js`.
- Cache bumped to `note-clip-v84-scanner-auto-crop`.
- This is still not full Apple/Microsoft Lens quality: no true perspective warp or draggable corner handles yet. It is an automatic bounding crop + rotate + enhanced PDF stage.

Commits:
- `f6fc784383f77ccfb140923dd3d4deeba544d988` — Add auto crop scanner polish.
- `5f83df2d839965cd2832a40d1c234b78a101e164` — Load scanner auto crop polish.
- `f176a4783910b514e484e7e72abf511b49a32ed1` — Inject scanner review styles.

## Attachment feature roadmap

### Stage 15C — Manual corner crop / perspective correction
Pending. Add draggable corners and true perspective correction if browser support is sufficient.

### Stage 16 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

### Stage 17 — OCR/search inside documents
Pending. Add document text extraction/search after scanner flow is stable.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/photo-attachments.js` owns local photo attachment behavior and storage checks.
- `js/pdf-attachments.js` owns local PDF attachment behavior, storage checks, and full-screen reader.
- `js/document-scanner.js` owns scan-to-PDF MVP.
- `js/document-scanner-edge.js` owns auto-crop/rotate/review scanner polish.
- `js/attachment-meter.js` owns attachment stats, Settings meter, and Manage Storage actions.

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
- [x] PDF from category-card + opens file picker.
- [x] Selected PDF creates note in correct category.
- [x] PDF badge appears on note card.
- [x] PDF card appears inside edit note modal.
- [x] Add PDF works on existing saved note.
- [ ] Tapping PDF opens true full-screen reader.
- [ ] Floating X closes PDF reader.
- [ ] PDF reader uses nearly full phone screen.
- [ ] Scan Document appears in category-card + menu.
- [ ] Scan Document opens camera/photo picker.
- [ ] Scan review screen appears.
- [ ] Auto-crop removes most background.
- [ ] Rotate action works.
- [ ] Save PDF creates cropped scanned PDF note.
- [ ] Scanned PDF opens in PDF viewer.
- [ ] Photo workflow still works.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
