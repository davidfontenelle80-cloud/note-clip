/**
 * fab-hotfix.js — robust FAB/category routing for Note Clip.
 * Keeps the global + button aligned with the currently visible tab and provides
 * a standalone Add/Edit Category modal when older source patches cannot reach
 * the original private category modal function.
 */
(function (App) {
  'use strict';

  const CATEGORY_ICONS = [
    '💼','📋','📊','📈','📉','🖥️','💻','🖨️','📎','🗂️','📁','📂','🗃️','✅','☑️',
    '📝','📄','📃','📜','🗒️','🗓️','📅','📆','🔖','🏷️',
    '💊','🩺','🏃','🧘','💪','🏋️','🥗','🥤','🛌',
    '💰','💳','🛒','🏦','💵','🧾','💸','🏧',
    '🏠','🔧','🪴','🧹','🛋️','🔑','🛁','🏗️',
    '✈️','🚗','🗺️','🧳','🏨','⛽','🚌','🚂','🚢','🏕️',
    '🍽️','👨‍🍳','☕','🥡','🍕','🥘','🍱',
    '📚','🎓','✏️','📐','🧪','🔬','📖','🏫',
    '🎵','🎮','📷','🎨','⚽','🎬','🎸','♟️','🎯','🎲',
    '🌿','☀️','🌊','🐾','🌱','🌍','⛰️','🌸',
    '⭐','🔥','⏰','📍','🔒','💡','🔔','⚡','🎁','❤️','🆘','📌'
  ];

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function activeTabName() {
    const activeNav = document.querySelector('.nav-tab.active[data-tab]');
    if (activeNav?.dataset?.tab) return activeNav.dataset.tab;

    const activePane = document.querySelector('.tab-pane.active[id^="pane-"]');
    if (activePane?.id) return activePane.id.replace(/^pane-/, '');

    return 'dashboard';
  }

  function notesIsCategoryView() {
    const pane = document.getElementById('pane-notes');
    if (!pane?.classList.contains('active')) return false;

    if (pane.querySelector('.category-grid, .category-card')) return true;

    const activeToggle = Array.from(pane.querySelectorAll('.status-tab.active'))
      .find(btn => (btn.textContent || '').trim().toLowerCase().includes('category'));
    return !!activeToggle;
  }

  function setCatIcon(icon) {
    const selected = icon || CATEGORY_ICONS[2];
    const hidden = document.getElementById('cat-icon');
    if (hidden) hidden.value = selected;

    document.querySelectorAll('#cat-icon-grid .cat-icon-option').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.icon === selected);
    });

    const preview = document.getElementById('cat-icon-selected-preview');
    if (preview) preview.textContent = selected;
  }

  function openCategoryModal(cat) {
    document.getElementById('cat-modal')?.remove();

    const isEdit = !!cat;
    const id = isEdit ? cat.id : '';
    const selectedIcon = cat?.icon || CATEGORY_ICONS[2];
    const buttons = CATEGORY_ICONS.map(icon => `
      <button type="button"
        class="cat-icon-option${icon === selectedIcon ? ' selected' : ''}"
        data-icon="${esc(icon)}"
        onclick="window.App.FabHotfix.setCatIcon(this.dataset.icon)">
        <span class="cat-icon-picture">${esc(icon)}</span>
      </button>`).join('');

    const html = `
      <div id="cat-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet cat-modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_category') : App.I18n.t('add_category')}</div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_name')}</label>
            <input id="cat-name" class="form-input" autocomplete="off" autocorrect="off" placeholder="Category name…" value="${esc(cat?.name || '')}">
          </div>

          <div class="form-group cat-icon-form-group">
            <label class="form-label">${App.I18n.t('cat_icon')}</label>
            <input id="cat-icon" type="hidden" value="${esc(selectedIcon)}">
            <div class="cat-icon-selected">
              <div id="cat-icon-selected-preview" class="cat-icon-selected-preview">${esc(selectedIcon)}</div>
              <div><div class="cat-icon-selected-label">${App.I18n.t('cat_icon_selected')}</div></div>
            </div>
            <div class="cat-icon-picker">
              <div id="cat-icon-grid" class="cat-icon-grid">${buttons}</div>
            </div>
          </div>

          <div class="modal-actions cat-actions">
            <button class="btn btn-secondary" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Notes._saveCat('${esc(id)}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('cat-modal');
    const nameInput = document.getElementById('cat-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 50);
    return true;
  }

  function openCategoryById(id) {
    const cat = App.Storage?.getState?.().categories?.find(c => c.id === id);
    if (!cat) return;
    openCategoryModal(cat);
  }

  function patchNotesCategoryApi() {
    if (!App.Notes || App.Notes.__fabCategoryApiPatched) return;
    App.Notes._openCatModal = openCategoryModal;
    App.Notes._editCat = openCategoryById;
    App.Notes._setCatIcon = setCatIcon;
    App.Notes.__fabCategoryApiPatched = true;
  }

  function routeFab(event) {
    const target = event.target?.closest?.('#fab');
    if (!target) return;

    patchNotesCategoryApi();
    const tab = activeTabName();

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    if (tab === 'notes') {
      if (notesIsCategoryView()) {
        openCategoryModal(null);
      } else {
        App.Notes?._openNoteModal?.(null);
      }
      return;
    }

    if (tab === 'lists') {
      App.Lists?.onFab?.();
      return;
    }

    if (tab === 'calendar' || tab === 'dashboard') {
      App.Notes?._openNoteModal?.(null);
    }
  }

  function install() {
    if (window.__noteClipFabHotfixReady) return;
    window.__noteClipFabHotfixReady = true;
    patchNotesCategoryApi();
    setTimeout(patchNotesCategoryApi, 250);
    setTimeout(patchNotesCategoryApi, 1000);
    document.addEventListener('click', routeFab, true);
  }

  App.FabHotfix = { setCatIcon, openCategoryModal, patchNotesCategoryApi };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})(window.App = window.App || {});
