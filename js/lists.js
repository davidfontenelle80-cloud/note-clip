/**
 * lists.js — Note Clip PWA
 * Lists tab: Reusable, Goal-Based, Template lists. Full CRUD.
 */
(function (App) {
  'use strict';

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── List Card ─────────────────────────────────────────────────────
  function buildListCard(list) {
    const t = App.I18n.t.bind(App.I18n);
    const checked = list.items.filter(i => i.checked).length;
    const total   = list.items.length;
    const typeLabel = t('list_' + list.type);

    const items = list.items.map(item => `
      <div class="list-item">
        <div class="list-item-check${item.checked?' checked':''}"
          onclick="App.Lists._toggleItem('${list.id}','${item.id}')">
          ${item.checked ? '✓' : ''}
        </div>
        <span class="list-item-text${item.checked?' checked':''}">${_esc(item.text)}</span>
        <button class="card-delete-btn" style="width:24px;height:24px;font-size:0.75rem"
          onclick="App.Lists._deleteItem('${list.id}','${item.id}')">×</button>
      </div>`).join('');

    const completedItems = list.items.filter(i => i.checked);
    const completedSection = completedItems.length && list.type === 'reusable'
      ? `<div style="font-size:var(--text-xs);color:var(--color-text-dim);padding:4px var(--space-md)">
           ${checked} of ${total} done
         </div>`
      : '';

    return `<div class="list-card">
      <div class="list-card-header">
        <div>
          <div class="list-title">${_esc(list.name)}</div>
          <span class="list-type-chip">${typeLabel}</span>
        </div>
        <div style="display:flex;gap:4px">
          ${list.type === 'reusable' && checked > 0
            ? `<button class="card-delete-btn" title="Reset" onclick="App.Lists._reset('${list.id}')">↺</button>`
            : ''}
          <button class="card-delete-btn" title="Edit" onclick="App.Lists._editList('${list.id}')">✎</button>
          <button class="card-delete-btn" title="Delete" onclick="App.Lists._deleteList('${list.id}')">×</button>
        </div>
      </div>
      ${completedSection}
      <div class="list-items-wrap">
        ${items || `<div style="color:var(--color-text-dim);font-size:var(--text-sm);padding:var(--space-sm) 0">
          ${t('no_notes')} — add below</div>`}
      </div>
      <div class="list-add-row">
        <input class="list-add-input" id="add-item-${list.id}"
          placeholder="${t('add_item')}"
          onkeydown="if(event.key==='Enter')App.Lists._addItem('${list.id}')">
        <button class="btn btn-primary btn-sm" onclick="App.Lists._addItem('${list.id}')">+</button>
      </div>
    </div>`;
  }

  // ── Render ────────────────────────────────────────────────────────
  function render() {
    const el = document.getElementById('pane-lists');
    if (!el) return;
    const state = App.Storage.getState();
    const t = App.I18n.t.bind(App.I18n);

    const content = state.lists.length
      ? state.lists.map(buildListCard).join('')
      : `<div class="empty-state">
           <div class="empty-state-icon"><span class="icon-wrap icon-wrap-lg"><img src="./icons/ic_nav_lists.png" class="icon-img-lg" alt=""></span></div>
           <div class="empty-state-text">${t('no_lists')}</div>
           <div class="empty-state-sub">${t('tap_plus')}</div>
         </div>`;

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${t('tab_lists')}</span>
      </div>
      ${content}`;
  }

  // ── Item actions ──────────────────────────────────────────────────
  function _toggleItem(listId, itemId) {
    App.Storage.toggleListItem(listId, itemId);
    render();
  }

  function _deleteItem(listId, itemId) {
    App.Storage.deleteListItem(listId, itemId);
    render();
  }

  function _addItem(listId) {
    const input = document.getElementById('add-item-' + listId);
    const text = input?.value.trim();
    if (!text) return;
    App.Storage.addListItem(listId, text);
    input.value = '';
    render();
    // Re-focus the input after re-render
    setTimeout(() => document.getElementById('add-item-' + listId)?.focus(), 50);
  }

  function _reset(listId) {
    App.Storage.resetList(listId);
    App.showToast('List reset', 'success');
    render();
  }

  // ── List Modal ────────────────────────────────────────────────────
  function _openModal(list) {
    const isEdit = !!list;
    const t = App.I18n.t.bind(App.I18n);
    const l = list || { name: '', type: 'reusable' };

    const typeOpts = ['reusable','goal','template'].map(tp =>
      `<option value="${tp}"${l.type===tp?' selected':''}>${t('list_'+tp)}</option>`
    ).join('');

    const html = `
      <div id="list-modal" class="modal-backdrop" onclick="if(event.target===this)App.Lists._closeModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? t('edit_list') : t('add_list')}</div>
          <div class="form-group">
            <label class="form-label">${t('list_name')}</label>
            <input id="list-name" class="form-input" placeholder="My list…" value="${_esc(l.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('list_type')}</label>
            <select id="list-type" class="form-select">${typeOpts}</select>
          </div>
          <div class="modal-actions">
            ${isEdit ? `<button class="btn btn-danger btn-sm" onclick="App.Lists._deleteList('${l.id}',true)">${t('delete')}</button>` : ''}
            <button class="btn btn-secondary" onclick="App.Lists._closeModal()">${t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Lists._saveList('${isEdit?l.id:''}')">${t('save')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('list-name').focus();
  }

  function _editList(id) {
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === id);
    if (list) _openModal(list);
  }

  function _saveList(id) {
    const name = document.getElementById('list-name')?.value.trim();
    const type = document.getElementById('list-type')?.value || 'reusable';
    if (!name) { App.showToast('Enter a list name', 'error'); return; }
    if (id) {
      App.Storage.updateList(id, { name, type });
      App.showToast('List updated', 'success');
    } else {
      App.Storage.addList({ name, type });
      App.showToast('List created', 'success');
    }
    _closeModal();
    render();
  }

  function _deleteList(id, fromModal) {
    if (!confirm('Delete this list and all its items?')) return;
    App.Storage.deleteList(id);
    if (fromModal) _closeModal();
    App.showToast('List deleted', 'success');
    render();
  }

  function _closeModal() {
    document.getElementById('list-modal')?.remove();
  }

  function onFab() { _openModal(null); }

  App.Lists = { render, onFab, _toggleItem, _deleteItem, _addItem, _reset,
    _openModal, _editList, _saveList, _deleteList, _closeModal,
  };

})(window.App = window.App || {});
