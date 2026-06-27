# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 15 Document Scanner MVP.

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
Status: Code-level implemented, live phone verified with observation: first reader view was too small.

### 14B. Full-Screen PDF Reader
Status: Code-level implemented, awaiting live phone verification

### 15. Document Scanner MVP
Status: Code-level implemented, awaiting live phone verification

Objective:
- Add Scan Document from the category + menu so a camera/photo capture can become a saved PDF attachment.

Scope:
- MVP scanner only.
- Uses camera/photo picker.
- Enhances contrast/brightness.
- Converts captured image into a one-page PDF.
- Saves scanned PDF into the selected category as a note attachment.
- Uses existing storage guardrails.

Tasks:
- [x] Add `js/document-scanner.js`.
- [x] Add Scan Document action to category-card + menu.
- [x] Open camera/image picker for scan.
- [x] Enhance captured image for document readability.
- [x] Convert captured image into a one-page PDF Data URL.
- [x] Save scan as PDF attachment in selected category.
- [x] Reuse existing PDF viewer/card behavior.
- [x] Reuse existing 5 MB per-attachment / 250 MB total safety limits.
- [x] Precache and inject scanner script through `sw.js`.
- [x] Bump service worker cache.

Implementation notes:
- Added `js/document-scanner.js`.
- Updated `js/category-card-add-menu.js` to show `Scan Document`.
- Updated `sw.js` to precache and inject `js/document-scanner.js`.
- Cache bumped to `note-clip-v83-document-scanner-mvp`.
- Current MVP does not yet do auto-edge detection or manual crop. That belongs to the next scanner polish stage.

Commits:
- `6f49262f383e1c1f4b900a57fa89dfae9a3cf0e2` — Add document scanner MVP.
- `dc2097daed77cbc8237e6a1902228d6170dd446d` — Add scan document action to category menu.
- `c4f5c02d89e96c328d37600ea706301fa1487a8b` — Load document scanner MVP.

## Attachment feature roadmap

### Stage 15B — Scanner crop/edge polish
Pending. Add manual crop first, then automatic edge detection after scanner MVP is stable.

### Stage 16 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

### Stage 17 — OCR/search inside documents
Pending. Add document text extraction/search after scanner flow is stable.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/photo-attachments.js` owns local photo attachment behavior and storage checks.
- `js/pdf-attachments.js` owns local PDF attachment behavior, storage checks, and full-screen reader.
- `js/document-scanner.js` owns scan-to-PDF MVP.
- `js/attachment-meter.js` owns attachment stats, Settings meter, and Manage Storage actions.
- `css/attachment-meter.css` owns storage meter, storage actions, PDF cards, and full-screen reader visuals.

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
- [ ] Scan creates a PDF note in correct category.
- [ ] Scanned PDF opens in PDF viewer.
- [ ] Photo workflow still works.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
