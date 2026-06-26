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

Tasks:
- [x] Treat midnight through 11:59 a.m. as morning.
- [x] Keep afternoon/evening/night thresholds intact after noon.
- [x] Keep greeting icon in sync with greeting text.
- [x] Bump service worker cache so `js/dashboard.js` reloads.

Commits:
- `a90eaa5233640dce0a8007dab0e304e44eb83516` — Fix early morning greeting logic.
- `7552b8f7b603f7962ef9cf0f54d8787962cc07f5` — Bump cache for greeting logic fix.

### 9. FAB category creation routing fix
Status: Code-level implemented, live phone verified after standalone modal fallback

Tasks:
- [x] Ensure the floating + button opens Add Category while Notes is in By Category view.
- [x] Keep + opening Add Note while Notes is in All Notes / note-list view.
- [x] Keep + opening Add List on Lists tab.
- [x] Keep + opening Add Note from Dashboard/Calendar.
- [x] Bump service worker cache so the new routing script loads.

Implementation notes:
- Added `js/fab-hotfix.js`.
- Follow-up fixed real issue: original `_openCatModal` was private inside `js/notes.js`; standalone fallback now opens Add/Edit Category modal directly.
- Cache bumped to `note-clip-v73-category-modal-standalone-fix`.

Commits:
- `6a074e51011a054e33a0182f0730f0e5cd609a52` — Add robust FAB routing hotfix.
- `ccfe4a25d47528e35a5fafcb152a07174cdb3667` — Load robust FAB routing hotfix.
- `219c147a03bba2835642d2e37bf9037a117632a2` — Fix category add and edit modal routing.
- `d7ff4515a0ce1a25efa603aa1dee33a176856bf1` — Bump cache for category modal standalone fix.

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

Implementation notes:
- Added `css/category-card-polish.css` for refreshed card styling.
- Added `js/category-card-polish.js` to transform existing rendered category cards without changing storage data.
- The script hides old edit/delete buttons and appends a `•••` category action button.
- The menu calls existing edit/delete buttons internally, preserving current behavior and confirmations.
- `sw.js` now precaches and injects the card polish CSS/JS.
- Cache bumped to `note-clip-v74-category-card-polish`.

Commits:
- `bb947d14561d3b064581823e76c0b93307cc244d` — Add polished category card UI.
- `8d330bcd6f84aa2f33f49761495a080cd544952a` — Add category card more menu behavior.
- `7b739704796ef178a8edec0c17dbc16dd9c6718e` — Load category card polish assets.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/dashboard.js` greeting logic now treats early morning as morning.
- `js/fab-hotfix.js` owns robust floating + button routing and category modal fallback.
- `css/category-card-polish.css` and `js/category-card-polish.js` own the refreshed category-card UI.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [ ] Category cards show only the more button, not separate edit/delete circles.
- [ ] More button opens Rename / Change Icon / Delete Category menu.
- [ ] Rename opens edit category modal.
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
