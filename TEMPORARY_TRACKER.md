# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 15C Attachment Review, Naming, Manual Crop, and Scan Quality.

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
- Added scanner review styling inline in the scanner override.
- Updated `sw.js` to precache and inject `js/document-scanner-edge.js`.
- Cache bumped to `note-clip-v84-scanner-auto-crop`, then later `note-clip-v87-attachment-review-naming` in Stage 15C.
- This is still not full Apple/Microsoft Lens quality: no true perspective warp yet.

Commits:
- `f6fc784383f77ccfb140923dd3d4deeba544d988` — Add auto crop scanner polish.
- `5f83df2d839965cd2832a40d1c234b78a101e164` — Load scanner auto crop polish.
- `f176a4783910b514e484e7e72abf511b49a32ed1` — Inject scanner review styles.

### 15C. Attachment Review, Naming, Manual Crop, and Scan Quality
Status: Code-level implemented, awaiting live phone verification

Objective:
- Fix the attachment workflow so photos, PDFs, and scanned documents are reviewable and nameable before final save.
- Make scan output behave more like a document scanner by adding a visible manual crop box and saving only after review.

Tasks:
- [x] Photo capture/select now opens a review screen before save.
- [x] Photo review includes a name field.
- [x] Photo attachment `name` saves from the entered name.
- [x] New photo note title uses the entered name.
- [x] Existing photo compression and attachment storage checks are preserved.
- [x] PDF select now opens a review/name screen before save.
- [x] PDF default name uses the original filename without `.pdf`.
- [x] PDF attachment `name` saves as entered name + `.pdf`.
- [x] New PDF note title uses the entered name.
- [x] Existing PDF storage checks and full-screen viewer are preserved.
- [x] Scan flow opens review after Use Photo and before saving.
- [x] Scan review includes a PDF name field.
- [x] Scan default name uses `Scanned Document MM-DD-YYYY`.
- [x] Scan review includes visible manual crop rectangle with draggable box and corner handles.
- [x] Scan review includes reset/full page, rotate, and save PDF controls.
- [x] Scan saves only after tapping Save PDF.
- [x] New scan note title uses the entered name.
- [x] Scan output crops to the selected rectangle, enhances contrast/brightness, and fills the generated PDF page.
- [x] Service worker cache bumped and existing injection order preserved.

Files changed:
- `js/photo-attachments.js`
- `js/pdf-attachments.js`
- `js/document-scanner-edge.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

Commits:
- `862cc1824db6fcb4104108c7c5bc1a5be080b62e` — Add photo review naming flow.
- `5e26e032716dd920550a3f43c1961b4e0443c31d` — Add PDF review naming flow.
- `03a9ba037a3106b98b1bf28bbfc186e2e75b083f` — Add scanner manual crop naming flow.
- `7f30c31913b27c9dc4d5dcc78ddaf609868c238d` — Bump cache for attachment review naming.

Code-level verification:
- Confirmed `photo-attachments.js` has review modal, name field, Save Photo action, and sets new note title from entered name.
- Confirmed `pdf-attachments.js` has review modal, PDF name field, original filename default, and saves name with `.pdf`.
- Confirmed `document-scanner-edge.js` overrides scanner flow with PDF name field, draggable crop box/corner handles, reset/full page, rotate, save PDF, and note title naming.
- Confirmed `sw.js` cache version is `note-clip-v87-attachment-review-naming`.
- Confirmed injection order remains attachment meter before photo/PDF/scanner scripts.

Live testing checklist:
- [ ] Force refresh/update PWA cache on phone.
- [ ] From a category card, choose Photo.
- [ ] Take/select a photo and confirm review screen appears before save.
- [ ] Rename photo and tap Save Photo.
- [ ] Confirm new note title matches entered photo name.
- [ ] Confirm image attachment still opens in photo viewer.
- [ ] From a category card, choose PDF.
- [ ] Select PDF and confirm review/name screen appears before save.
- [ ] Confirm default PDF name strips `.pdf`.
- [ ] Rename PDF and save.
- [ ] Confirm new note title matches entered name and attachment name ends in `.pdf`.
- [ ] Confirm full-screen PDF reader still opens and floating X closes it.
- [ ] From a category card, choose Scan Document.
- [ ] Use Photo after camera capture and confirm scan review appears.
- [ ] Confirm PDF name defaults to `Scanned Document MM-DD-YYYY`.
- [ ] Drag the crop box and each corner handle on phone.
- [ ] Tap Reset / Full Page and confirm crop returns to full photo.
- [ ] Tap Rotate and save; confirm saved PDF is rotated.
- [ ] Save PDF and confirm new note title matches entered scan name.
- [ ] Open scanned PDF and confirm crop removes table/background as much as selected crop allows.
- [ ] Confirm storage meter still updates and 5 MB / 250 MB limits still block oversized saves.
- [ ] Confirm Notes add/edit/delete still works.
- [ ] Confirm Lists, Calendar, Settings still open.

Known limitations:
- Scanner uses reliable rectangular crop with draggable crop box/corner handles.
- True perspective correction / four-point document warp is intentionally not implemented in this stage and remains future work.
- Live phone verification is still required for touch-drag feel, iOS camera handoff, and PWA cache update behavior.

## Attachment feature roadmap

### Stage 16 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

### Stage 17 — OCR/search inside documents
Pending. Add document text extraction/search after scanner flow is stable.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/photo-attachments.js` owns local photo attachment behavior, storage checks, review/naming, and photo viewer.
- `js/pdf-attachments.js` owns local PDF attachment behavior, storage checks, review/naming, and full-screen reader.
- `js/document-scanner.js` owns scan-to-PDF MVP.
- `js/document-scanner-edge.js` owns scanner review, naming, manual rectangular crop, rotate, reset/full page, contrast/brightness enhancement, and scanned PDF generation.
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
- [ ] Scan name field appears and can be edited.
- [ ] Manual crop box/corner handles drag on phone.
- [ ] Auto-crop removes most background.
- [ ] Rotate action works.
- [ ] Reset / Full Page works.
- [ ] Save PDF creates cropped scanned PDF note.
- [ ] Scanned PDF opens in PDF viewer.
- [ ] Photo workflow shows review/name before save.
- [ ] PDF workflow shows review/name before save.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
