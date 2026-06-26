# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass.

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

Tasks:
- [ ] Test Lists + workflow.
- [ ] Fix autofocus/keyboard overlap only if confirmed.

### 8. Greeting logic fix
Status: Code-level implemented, live phone verified

### 9. FAB category creation routing fix
Status: Code-level implemented, live phone verified after standalone modal fallback

### 10. Notes category card polish
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Replace always-visible Edit/Delete circles with one clean more menu.
- [x] Keep tap-on-card behavior opening category notes.
- [x] Keep Rename/Change Icon/Delete behavior available from the menu.
- [x] Make category icons larger and more visually balanced.
- [x] Add subtle category accent corners.
- [x] Lighten paper texture and improve spacing/shadows.
- [x] Bump service worker cache so polish assets load.

Commits:
- `bb947d14561d3b064581823e76c0b93307cc244d` — Add polished category card UI.
- `8d330bcd6f84aa2f33f49761495a080cd544952a` — Add category card more menu behavior.
- `7b739704796ef178a8edec0c17dbc16dd9c6718e` — Load category card polish assets.

### 11. Editable category accent colors
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Add Card Accent Color to Add/Edit Category modal.
- [x] Add No Color option.
- [x] Save selected accent color on the category record.
- [x] Apply saved category color back onto cards after render.
- [x] Bump service worker cache so accent script loads.

Implementation notes:
- `js/fab-hotfix.js` now includes accent color choices and saves `color` with category changes.
- `css/category-card-polish.css` now supports `.no-accent` and accent-picker styling.
- `js/cat-accent-apply.js` applies saved category colors to rendered cards.
- `sw.js` now precaches and injects `js/cat-accent-apply.js`.
- Cache bumped to `note-clip-v75-category-accent-edit`.

Commits:
- `61b8ac956f44f0b1d029bda87bd7fa50e75ec8e0` — Add category accent color editing.
- `3d67ae808b22daa1e574789a651c4c1677f564ac` — Style category accent picker.
- `784da806e1094813bd380af644e867f126d40666` — Add category accent application.
- `c15b6b7182fbc826b189338a662f6bc2a118626a` — Load category accent apply script.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/dashboard.js` greeting logic now treats early morning as morning.
- `js/fab-hotfix.js` owns robust floating + button routing, category modal fallback, and category accent editing.
- `css/category-card-polish.css`, `js/category-card-polish.js`, and `js/cat-accent-apply.js` own the refreshed category-card UI and editable corner accent.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [ ] Category cards show only the more button, not separate edit/delete circles.
- [ ] More button opens Rename / Change Icon / Delete Category menu.
- [ ] Rename opens edit category modal.
- [ ] Card Accent Color appears in Add/Edit Category.
- [ ] No Color removes the card corner accent.
- [ ] Color choice saves and appears on the category card.
- [ ] Delete category still confirms/deletes correctly.
- [ ] Category Name is visible immediately.
- [ ] Type category name.
- [ ] Select icon.
- [ ] Save category.
- [ ] Edit category.
- [ ] Delete category.
- [ ] Notes add/edit/delete works.
- [ ] Lists add/edit/check/delete works.
- [ ] Calendar opens and date tap works.
- [ ] Settings opens.
