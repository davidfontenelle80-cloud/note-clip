# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 15F — Level Two Scanner Polish

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 15F is code implemented, not live approved.

## Previous checkpoint
Stage 15E added the auto-first corrected preview workflow.

Stage 15E commits:
- `e002b2a53173bd458acd4ed2f2996408d109125d` — Add auto-first scanner review flow.
- `1ad14cb6ffed1a1a42a63ac61a366e13a7d61835` — Bump cache for auto-first scanner.
- `ce848dc84dcbe6f85f30c2c56064ed59bab86e2c` — Update tracker for Stage 15E.

## Stage 15F objective
Improve the scanner toward Level Two quality inside the PWA:
- Better auto crop behavior.
- Confidence scoring.
- Clear Crop and Auto Crop wording.
- Cleaner document enhancement.
- Tighter PDF margins.
- Manual corner adjustment only when needed.

## Stage 15F implemented
- Improved document area detection with brighter-paper and edge-gradient sampling.
- Added detection confidence score.
- Added confidence display in the review screen.
- If confidence is low, app warns that manual adjustment may be needed.
- Changed wording to Crop and Auto Crop.
- Auto Crop reruns the corner detection and refreshes the corrected preview.
- Crop opens the four-corner manual editor.
- Manual editor now says Crop document.
- Manual editor includes Auto Crop, Preview, and Save PDF.
- Added Retake button from review screen.
- Improved Enhanced, Color, and B&W filters.
- Added light sharpening for non-color modes.
- Tightened PDF margins from prior output.
- Save source marker updated to `scan-level-two-auto-crop`.
- Cache bumped to `note-clip-v90-level-two-scanner`.

## Stage 15F files changed
- `js/document-scanner-edge.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Stage 15F commits
- `aff79878e11212cb30c0888549fa7e5cbcb412c2` — Add level two scanner polish.
- `1798160a851224099175bad659ef4391c6fa9231` — Bump cache for level two scanner.

## Code-level verification
- `js/document-scanner-edge.js` now starts with Stage 15F level-two scanner code.
- Auto Crop exists in the corrected-preview screen and manual crop screen.
- Crop opens the four-corner editor.
- Detection confidence is calculated and displayed.
- Save uses source marker `scan-level-two-auto-crop`.
- `sw.js` cache version is `note-clip-v90-level-two-scanner`.
- No cloud sync, text recognition, AI search, or unrelated app areas were added.

## Live phone test checklist
- [ ] Force refresh/update PWA cache on phone.
- [ ] Category card → Scan Document.
- [ ] Capture/select a receipt or paper document.
- [ ] Confirm first review screen shows corrected page preview.
- [ ] Confirm confidence text appears.
- [ ] Confirm Auto Crop button appears.
- [ ] Tap Auto Crop and confirm preview refreshes.
- [ ] Tap Crop and confirm four-corner editor opens.
- [ ] Drag all four corners.
- [ ] Tap Preview and confirm it returns to corrected-preview screen.
- [ ] Try Enhanced, Color, and B&W.
- [ ] Confirm Enhanced improves contrast/readability.
- [ ] Confirm B&W creates high contrast text mode.
- [ ] Tap Retake and confirm scanner restarts.
- [ ] Rename the PDF.
- [ ] Tap Save PDF.
- [ ] Confirm saved PDF is tighter, flatter, and removes most background.
- [ ] Confirm saved PDF opens full screen.
- [ ] Confirm storage meter still works.
- [ ] Confirm Photo review/naming still works.
- [ ] Confirm PDF review/naming still works.
- [ ] Confirm Notes, Lists, Calendar, and Settings still open.

## Known limitations
- Stage 15F is still post-capture scanning inside a web/PWA app.
- It does not include native VisionKit.
- It does not include live edge overlay before taking the picture.
- It does not include auto shutter capture.
- It does not include OCR/text recognition.

## Next authorized stage
Stage 15F live phone verification only.

Do not begin cloud sync, OCR, AI search, or live camera overlay until Stage 15F is live-approved.
