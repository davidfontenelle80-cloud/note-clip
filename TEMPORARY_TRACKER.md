# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup + UI polish pass + attachment roadmap Stage A/B.

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
- [x] Keep Edit/Delete behavior available from the menu.
- [x] Make category icons larger and more visually balanced.
- [x] Add subtle category accent corners.
- [x] Lighten paper texture and improve spacing/shadows.
- [x] Bump service worker cache so polish assets load.

### 11. Editable category accent colors
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Add Card Accent Color to Add/Edit Category modal.
- [x] Add No Color option.
- [x] Save selected accent color on the category record.
- [x] Apply saved category color back onto cards after render.
- [x] Bump service worker cache so accent script loads.

### 12. Category card create menu / attachment roadmap Stage A-B
Status: Code-level implemented, awaiting live phone verification

Objective:
- Add the category-card plus workflow now, without enabling risky attachment storage yet.

Tasks:
- [x] Add a small + button to each category card.
- [x] Tapping category card still opens that category.
- [x] Tapping three-dot menu still opens Edit/Delete.
- [x] Tapping category-card + opens Create in [Category].
- [x] New Note works and preselects that category.
- [x] Photo appears as Coming next placeholder.
- [x] PDF appears as Coming next placeholder.
- [x] No storage schema change yet for attachments.
- [x] Bump service worker cache so new script loads.

Implementation notes:
- Added `js/category-card-add-menu.js`.
- Added category-card + button styling and create-menu styling to `css/category-card-polish.css`.
- `sw.js` now precaches and injects `js/category-card-add-menu.js`.
- Cache bumped to `note-clip-v77-category-create-menu`.
- New Note opens the existing note modal and sets the selected category.
- Photo/PDF intentionally show Coming next until local attachment storage is built.

Commits:
- `89fd6cf17659417fa5117764bd8850c5e089cf4b` — Add category card create menu.
- `6a7dee74d3787c6ea9e213c5d1ccd643684dade6` — Style category card create menu.
- `e7d108984961f44602b78a1b8618180660e5178e` — Load category card create menu.

## Attachment feature roadmap

### Stage C — Local attachment MVP
Pending. Add image/PDF file picker, local storage strategy, attachment metadata on notes, and safe file-size limits.

### Stage D — Attachment viewer/delete
Pending. Add full-screen image viewer, PDF card/open behavior, delete attachment, and note render support.

### Stage E — Backup/sync attachments
Pending. Add cloud backup/sync after local storage is stable.

## Latest code checkpoint
- `sw.js` still owns HTML patching until `index.html` can be safely full-file edited.
- `js/dashboard.js` greeting logic now treats early morning as morning.
- `js/fab-hotfix.js` owns robust floating + button routing, category modal fallback, and category accent editing.
- `css/category-card-polish.css`, `js/category-card-polish.js`, and `js/cat-accent-apply.js` own the refreshed category-card UI and editable corner accent.
- `js/category-card-add-menu.js` owns the category-card + create menu.

## Smoke test checklist
- [ ] Dashboard loads.
- [x] Dashboard greeting says Good morning in early morning hours.
- [x] Bottom nav tabs switch correctly.
- [x] Active tab has glow/card but no dot.
- [x] Categories + opens Add Category.
- [ ] Category cards show only the more button, not separate edit/delete circles.
- [ ] More button opens Edit / Delete menu.
- [ ] Edit opens edit category modal.
- [ ] Card Accent Color appears in Add/Edit Category.
- [ ] No Color removes the card corner accent.
- [ ] Color choice saves and appears on the category card.
- [ ] Category-card + appears on each category card.
- [ ] Category-card + opens Create in [Category].
- [ ] New Note from category-card + opens note modal with that category selected.
- [ ] Photo placeholder shows Coming next.
- [ ] PDF placeholder shows Coming next.
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
