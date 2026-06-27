# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 15F Repair — Auto Crop Fix

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 15F Repair is code implemented, not live approved.

## Issue found in live test
Auto Crop reused the same poor crop and showed a misleading high score.

## Repair implemented
- Auto Crop scoring is now stricter.
- The app now checks the page area against the surrounding background.
- Oversized crops and edge-touching crops receive lower scores.
- If Auto Crop returns almost the same points again, the app opens manual Crop mode.
- If Auto Crop is unsure, the app opens manual Crop mode.
- Save source marker is now `scan-level-two-auto-crop-repair`.
- Cache bumped to `note-clip-v91-auto-crop-repair`.

## Files changed
- `js/document-scanner-edge.js`
- `sw.js`

## Commits
- `97dce5b7ca800030ec38f754b758ee9f05c823d3` — Repair scanner auto crop confidence.
- `1761655b28beee0b9599f1a108ab0d05fd9dce05` — Bump cache for auto crop repair.

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Scan the Costco receipt again.
- [ ] Confirm the score is not fake-high when crop is bad.
- [ ] Tap Auto Crop.
- [ ] If the crop is unchanged, confirm manual Crop mode opens.
- [ ] If the crop improves, confirm preview changes.
- [ ] Save PDF.
- [ ] Confirm PDF output is tighter and flatter.
- [ ] Confirm Photo and PDF flows still work.

## Next authorized stage
Stage 15F Repair live phone verification only.

Do not begin cloud sync, OCR, AI search, or live camera overlay until this repair is live-approved.
