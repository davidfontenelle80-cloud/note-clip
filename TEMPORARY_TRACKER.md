# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 15D — Four Point Page Correction

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Repo sync update
The repo currently includes Stage 15D code in `js/document-scanner-edge.js` and cache version `note-clip-v88-four-corner-scanner` in `sw.js`.

Stage 15D status: code implemented, not live approved.

Files changed in Stage 15D:
- `js/document-scanner-edge.js`
- `sw.js`

Commits:
- `57c70fc31c12a4543f7c05f6a7d1db2aa2d4b23d` — Add four-corner page correction.
- `eadf636196a0ee098adda74b89be7c4d67c45710` — Update cache version for scanner.

## Next authorized work
Stage 15E — Auto-first document workflow.

Required behavior for Stage 15E:
- Auto-select document corners first.
- Auto-create the corrected page preview first.
- Show manual corner adjustment only if the user taps Adjust.
- Preserve PDF naming.
- Preserve PDF viewer.
- Preserve storage limits.
- Do not add cloud sync.
- Do not add text recognition.
- Do not modify unrelated app areas.

## Live test checklist
- [ ] PWA cache updates.
- [ ] Document action opens image capture.
- [ ] Selected page is auto-corrected before manual edit.
- [ ] Adjust opens corner editor.
- [ ] Save creates named PDF.
- [ ] PDF opens full screen.
- [ ] Existing photo and PDF flows still work.

## Known limitations
- Stage 15D correction happens after image capture.
- Stage 15E should improve the workflow so the corrected result is shown first.
