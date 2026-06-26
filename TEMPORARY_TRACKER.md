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
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Move keyboard-safe modal behavior into source CSS.
- [x] Keep icon picker scrollable on mobile.
- [x] Ensure Save/Cancel do not float over icon cards.

Implementation notes:
- Added `css/category-modal-source.css` with mobile-safe category modal rules.
- Removed category-modal CSS rules from the service-worker inline style block.
- `sw.js` now precaches `css/category-modal-source.css` and injects a stylesheet link for it until the later source-markup cleanup can place the link directly in `index.html`.
- The remaining `sw.js` inline style is now only the temporary bottom-nav selected-dot override for Item 3.

Verification notes:
- Repo verified after commit: `css/category-modal-source.css` exists and contains only category modal layout rules.
- Repo verified after commit: `sw.js` includes `./css/category-modal-source.css` in `PRECACHE_URLS`.
- Repo verified after commit: old `<style id="noteclip-category-modal-hotfix">` category modal block is removed from `sw.js` and replaced with a source CSS link plus a temporary nav-dot-only style.
- Issue #1 has not yet been refreshed after Item 2; tracker is source of truth until next issue sync.

Commits:
- `5c3dcd634a9d533e4314b23d76254a5bda6013a1` — Move category modal layout CSS into source file.
- `55249539a708ad416b900728a7f7dcfd1c1fc5a5` — Load category modal CSS from source file.
- `ad012d36687e33bfaed022d0f9c1fb40f5b1e26d` — Update tracker after category CSS source move.
- `8c50bd2aba58cbfbe523d3cba899427f511621a9` — Add Item 2 verification note.

### 3. Bottom nav selected-dot source removal
Status: Code-level implemented, awaiting live phone verification

Tasks:
- [x] Remove selected-tab dot at source.
- [x] Keep approved glow/card/icon/label active state.

Implementation notes:
- Removed the temporary `NAV_DOT_STYLE` override from `sw.js`.
- `sw.js` no longer injects `.nav-tab.active::after` / `:after` dot-hiding CSS.
- This leaves the approved active tab indication to the existing glow/card/icon/label styles.
- Cache bumped to `note-clip-v68-nav-dot-source-removed`.

Verification notes:
- Repo verified after commit: `sw.js` no longer defines `NAV_DOT_STYLE`.
- Repo verified after commit: `sw.js` no longer injects `noteclip-nav-dot-source-pending` style content.
- Repo verified after commit: `sw.js` still removes any stale cached `noteclip-nav-dot-source-pending` block from HTML before injecting current source assets.

Commit:
- `3c5c6bee956aa7217049098447e112974711f49f` — Remove bottom nav dot override source.

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
- `sw.js` no longer contains the category modal CSS block.
- `css/category-modal-source.css` owns category modal mobile layout CSS.
- `sw.js` still injects the stylesheet link for `css/category-modal-source.css` until later HTML/source cleanup.
- `sw.js` no longer injects the bottom-nav selected-dot override.
- Recent commits:
  - `3c5c6bee956aa7217049098447e112974711f49f` — Remove bottom nav dot override source.
  - `8c50bd2aba58cbfbe523d3cba899427f511621a9` — Add Item 2 verification note.
  - `ad012d36687e33bfaed022d0f9c1fb40f5b1e26d` — Update tracker after category CSS source move.
  - `55249539a708ad416b900728a7f7dcfd1c1fc5a5` — Load category modal CSS from source file.
  - `5c3dcd634a9d533e4314b23d76254a5bda6013a1` — Move category modal layout CSS into source file.
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
