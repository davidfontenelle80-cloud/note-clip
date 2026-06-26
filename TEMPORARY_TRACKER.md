# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + Stage 14B Full-Screen PDF Reader.

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

Objective:
- Replace the cramped embedded PDF reader with an edge-to-edge reader and floating close button.

Tasks:
- [x] Make PDF viewer fill the entire viewport.
- [x] Remove header bar from PDF reader.
- [x] Add floating translucent X close button at top-right.
- [x] Respect iPhone safe-area insets.
- [x] Prevent background body scroll while PDF reader is open.
- [x] Keep PDF card compact inside the note editor.
- [x] Update PDF card copy to say Open PDF full screen.
- [x] Add Escape key close for desktop testing.
- [x] Bump service worker cache so reader polish loads.

Implementation notes:
- Updated `js/pdf-attachments.js` to create a true full-screen overlay using `pdf-reader-open` body state.
- Added `App.PdfAttachments.closeViewer()`.
- Updated `css/attachment-meter.css` with `.pdf-floating-close`, full-screen iframe rules, and safe-area positioning.
- Cache bumped to `note-clip-v82-fullscreen-pdf-reader`.

Commits:
- `6bc1b19d07d6adf081778257097b1c8eac2bd817` — Make PDF viewer full screen.
- `fa1441ff63850ec6464e705d441d1e6332409bb8` — Polish full screen PDF reader.
- `f57d169c24fa57d6e0d0e3efa6c19b603d141f21` — Bump cache for full screen PDF reader.

## Attachment feature roadmap

### Stage 15 — Attachment backup/sync
Pending. Move beyond local MVP storage after attachment behavior is stable.

### Stage 16 — Document scanner
Pending. Add document capture, crop/straighten, and PDF creation.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/photo-attachments.js` owns local photo attachment behavior and storage checks.
- `js/pdf-attachments.js` owns local PDF attachment behavior, storage checks, and full-screen reader.
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
- [ ] Deleting PDF removes it from note.
- [ ] Photo workflow still works.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
