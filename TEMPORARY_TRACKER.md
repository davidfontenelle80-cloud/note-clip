# Note Clip Stabilization Tracker

Repo: `davidfontenelle80-cloud/note-clip`

Issue: #1 — Stabilization cleanup: move UI hotfixes into source and smoke-test mobile workflows

## Current stage
Mobile stabilization cleanup.

## Rule
Before each stabilization item:
1. Compare repo against this tracker.
2. If they differ, update this tracker first.
3. Fix one item only.
4. Verify the changed files and commit.
5. Mark the item complete only after the code-level check passes.

## Stabilization checklist

### 1. Category modal source cleanup
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Move category modal workflow into source code via `app.js` source patch.
- [x] Ensure Add/Edit Category visual DOM flow is: Category Name, Category Icon, icon picker, actions.
- [x] Remove forced scroll/focus behavior after icon tap by overriding `_setCatIcon()` in source.
- [x] Keep icon selection updating hidden input, selected class, and preview.

Implementation notes:
- `app.js` now runs `patchCategoryModalWorkflow()` after the existing note modal i18n guard.
- The patch normalizes Add/Edit Category modal ordering after the original `js/notes.js` modal opens.
- The patch overrides `App.Notes._setCatIcon()` so icon taps do not force-scroll or focus the name field.
- Cache bumped in `sw.js` to `note-clip-v66-category-source-patch` so changed `app.js` is picked up.

Commits:
- `bf27a4799fcc0a1f35495b33a7a1c06d2fad92af` — Move category modal workflow into source patch.
- `81b14f000eab0c28d1bf4b27258f24de4c9d4dbb` — Bump cache for category modal source patch.

### 2. Category modal CSS source cleanup
Status: Pending

Tasks:
- [ ] Move keyboard-safe modal behavior into source CSS.
- [ ] Keep icon picker scrollable on mobile.
- [ ] Ensure Save/Cancel do not float over icon cards.

### 3. Bottom nav selected-dot source removal
Status: Pending

Tasks:
- [ ] Remove selected-tab dot at source.
- [ ] Keep approved glow/card/icon/label active state.

### 4. Bottom nav styling consolidation
Status: Pending

Tasks:
- [ ] Reduce overlapping nav style systems.
- [ ] Keep approved visual design.

### 5. Retired Shared tab cleanup
Status: Pending

Tasks:
- [ ] Remove retired Shared tab from source markup.
- [ ] Remove runtime removal only after source no longer needs it.
- [ ] Preserve stored shared data unless separately approved.

### 6. Service worker UI hotfix cleanup
Status: Pending

Tasks:
- [ ] Remove UI CSS injection after source fixes are complete.
- [ ] Keep cache and push behavior intact.
- [ ] Bump cache version once when completed.

### 7. List modal keyboard check
Status: Pending

Tasks:
- [ ] Test Lists + workflow.
- [ ] Fix autofocus/keyboard overlap only if confirmed.

## Latest code checkpoint
- `sw.js` still contains temporary UI hotfix CSS injection for category modal and bottom-nav selected dot.
- Category modal behavior now also has a source-level patch in `app.js`; next pass should move the CSS portion into `css/styles.css` and then remove it from `sw.js` after verification.
- Recent commits:
  - `81b14f000eab0c28d1bf4b27258f24de4c9d4dbb` — Bump cache for category modal source patch.
  - `bf27a4799fcc0a1f35495b33a7a1c06d2fad92af` — Move category modal workflow into source patch.
  - `fc92b0fee79d1d389e0f45f2f8d7ef3b30cfbc0b` — category modal keyboard polish.
  - `abf9316b250bce6fb83b5183eeddfc0c7dfaa9a4` — initial category modal hotfix.

## Smoke test checklist
- [ ] Dashboard loads.
- [ ] Bottom nav tabs switch correctly.
- [ ] Active tab has glow/card but no dot.
- [ ] Categories + opens Add Category.
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
