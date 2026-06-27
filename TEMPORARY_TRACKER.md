# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 15E — Auto-first document workflow

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 15E is code implemented, not live approved.

## Previous checkpoint
Stage 15D added four-point page correction.

Stage 15D commits:
- `57c70fc31c12a4543f7c05f6a7d1db2aa2d4b23d` — Add four-corner page correction.
- `eadf636196a0ee098adda74b89be7c4d67c45710` — Update cache version for scanner.
- `2b0cf9a4d814a9a8cecdb9e4aed9408ef4ce809b` — Sync tracker with Stage 15D.

## Stage 15E objective
Make the workflow match the modern document app pattern:
- Corrected page preview first.
- Manual corner edit only when the user taps Adjust.
- Save PDF from corrected preview.

## Stage 15E implemented
- After image capture/selection, the app automatically detects the page area.
- The app immediately creates a corrected page preview.
- The review screen opens on the corrected preview, not the corner editor.
- User can save directly if the preview looks right.
- User can tap Adjust Corners if the page detection is wrong.
- Adjust Corners opens the four-point editor.
- Preview returns from the editor back to the corrected-preview screen.
- Filters remain available: Enhanced, Color, and B&W.
- Rotate updates the corrected preview.
- PDF naming remains in the review screen.
- Save PDF uses the corrected preview when available.
- Existing PDF attachment save behavior is preserved.
- Existing storage checks are preserved.
- Cache bumped to `note-clip-v89-auto-first-scanner`.

## Stage 15E files changed
- `js/document-scanner-edge.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Stage 15E commits
- `e002b2a53173bd458acd4ed2f2996408d109125d` — Add auto-first scanner review flow.
- `1ad14cb6ffed1a1a42a63ac61a366e13a7d61835` — Bump cache for auto-first scanner.

## Code-level verification
- `js/document-scanner-edge.js` now starts with Stage 15E auto-first workflow.
- Initial review screen is corrected preview first.
- Manual corner editor is behind Adjust Corners.
- Save path uses `scan-auto-first` as the source marker.
- `sw.js` cache version is `note-clip-v89-auto-first-scanner`.
- No cloud sync, OCR, AI search, or unrelated app areas were added.

## Live phone test checklist
- [ ] Force refresh/update PWA cache on phone.
- [ ] Category card → Scan Document.
- [ ] Capture/select a receipt or paper document.
- [ ] Confirm the first review screen shows a corrected page preview, not crop handles.
- [ ] Confirm the corrected preview removes most background.
- [ ] Confirm the corrected preview is squared/flattened.
- [ ] Rename the PDF.
- [ ] Try Enhanced, Color, and B&W.
- [ ] Tap Rotate and confirm preview updates.
- [ ] Tap Save PDF directly without manual adjustment.
- [ ] Confirm saved PDF opens and looks like the corrected preview.
- [ ] Repeat scan and tap Adjust Corners.
- [ ] Confirm four corner handles appear only after Adjust Corners.
- [ ] Drag all four corners.
- [ ] Tap Preview.
- [ ] Confirm it returns to corrected preview.
- [ ] Save PDF after adjustment.
- [ ] Confirm new note title matches entered name.
- [ ] Confirm storage meter still works.
- [ ] Confirm Photo review/naming still works.
- [ ] Confirm PDF review/naming still works.
- [ ] Confirm Notes, Lists, Calendar, and Settings still open.

## Known limitations
- Stage 15E still uses the iOS image capture handoff.
- It does not yet show live edge overlay before the shutter.
- It does not yet auto-capture while the camera is open.
- The current goal is the OneDrive-style post-capture corrected preview workflow.

## Next authorized stage
Stage 15E live phone verification only.

Do not begin cloud sync, OCR, AI search, or live camera overlay until Stage 15E is live-approved.
