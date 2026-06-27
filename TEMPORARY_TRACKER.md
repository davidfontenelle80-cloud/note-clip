# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

## Current stage
Stage 16D-Final — Category Action Rail

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Current status
Stage 16D-Final is authorized.

## Previous checkpoint
Stage 16D added Pastel/Bold colors and exact selected-card color matching. Cache was bumped to `note-clip-v95-true-color-match`.

## Objective
Move the category edit pencil above the plus button, creating a clear vertical action rail.

## Required behavior
- Pencil appears above plus on each category card.
- Pencil still opens management menu.
- Plus still opens create menu.
- Card body still opens category.
- Long press still opens management.
- Global FAB remains unchanged.
- Do not touch scanner, cloud, storage, attachments, or broad layout.

## Files allowed
- `js/cat-accent-apply.js`
- `sw.js`
- `TEMPORARY_TRACKER.md`

## Live phone test checklist
- [ ] Force refresh/update PWA cache.
- [ ] Pencil appears above plus on each card.
- [ ] Pencil opens management menu.
- [ ] Plus opens create menu.
- [ ] Card body opens category.
- [ ] Global FAB still works.
- [ ] Exact color match still works.

## Stop condition
Stop after this action rail patch only.
