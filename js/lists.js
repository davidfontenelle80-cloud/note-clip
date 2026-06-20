/**
 * lists.js — Note Clip PWA
 * Lists tab: Reusable, Goal-Based, Template lists. Full CRUD.
 */
(function (App) {
  'use strict';

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Item Row Builder ───────────────────────────────────────────────
  // opts: { checkable, restoreMode }
  // restoreMode = show restore button (↩) instead of check toggle label
  function _buildItemRow(listId, item, opts) {
    opts = opts || {};
    const checkable   = opts.checkable !== false;
    const restoreMode = !!opts.restoreMode;
    const checkCls    = item.checked ? ' checked' : '';
    const textCls     = item.checked ? ' checked' : '';

    const checkEl = checkable
      ? `<div class="list-item-check${checkCls}"
           onclick="App.Lists._toggleItem('${listId}','${item.id}')">
           ${item.checked ? '✓' : ''}</div>`
      : `<div class="list-item-check" style="opacity:0.3;cursor:default"></div>`;

    const restoreBtn = restoreMode
      ? `<button class="card-delete-btn" style="width:24px;height:24px;font-size:0.8rem" title="Restore"
           onclick="App.Lists._toggleItem('${listId}','${item.id}')">↩</button>`
      : '';

    return `<div class="list-item">
      ${checkEl}
      <span class="list-item-text${textCls}">${_esc(item.text)}</span>
      ${restoreBtn}
      <button class="bell-btn${item.reminderAt ? ' has-reminder' : ''}"
        title="Set reminder"
        onclick="App.Reminders.openPickerForListItem('${listId}','${item.id}')">⏰</button>
      <button class="card-delete-btn" style="width:24px;height:24px;font-size:0.7rem" title="Edit"
        onclick="App.Lists._editItem('${listId}','${item.id}')">✎</button>
      <button class="card-delete-btn" style="width:24px;height:24px;font-size:0.75rem"
        onclick="App.Lists._deleteItem('${listId}','${item.id}')">×</button>
    </div>`;
  }

  // ── List Card ─────────────────────────────────────────────────────
  function buildListCard(list) {
    const t = App.I18n.t.bind(App.I18n);
    const checked = list.items.filter(i => i.checked).length;
    const total   = list.items.length;
    const typeLabel = t('list_' + list.type);

    // ── Type-differentiated item areas ───────────────────────────────
    let itemsArea = '';
    const noItems = `<div style="color:var(--color-text-dim);font-size:var(--text-sm);padding:var(--space-sm) 0">
      ${t('add_item').replace('…','')} — add below</div>`;

    if (list.type === 'goal') {
      // Active items (unchecked)
      const unchecked = list.items.filter(i => !i.checked);
      const doneItems = list.items.filter(i => i.checked);

      const activeHtml = unchecked.length
        ? unchecked.map(i => _buildItemRow(list.id, i, {})).join('')
        : (doneItems.length
          ? `<div style="color:var(--color-success);font-size:var(--text-sm);padding:var(--space-sm) 0">${t('list_all_done')}</div>`
          : noItems);

      // Completed section
      const completedSection = doneItems.length ? `
        <div style="border-top:1px solid var(--color-border);margin-top:var(--space-sm);padding-top:var(--space-sm)">
          <div style="display:flex;align-items:center;justify-content:space-between;
            font-size:var(--text-xs);color:var(--color-text-dim);margin-bottom:4px">
            <span>${t('list_completed')} (${doneItems.length})</span>
            <button class="card-delete-btn" title="Restore all"
              onclick="App.Lists._reset('${list.id}')">↺</button>
          </div>
          ${doneItems.map(i => _buildItemRow(list.id, i, {restoreMode: true})).join('')}
        </div>` : '';

      itemsArea = activeHtml + completedSection;

    } else if (list.type === 'template') {
      // Template: items shown but checkbox is decorative (not functional)
      itemsArea = list.items.length
        ? list.items.map(i => _buildItemRow(list.id, i, {checkable: false})).join('')
        : noItems;

    } else {
      // Reusable (default): all items inline, checked = strikethrough in place
      itemsArea = list.items.length
        ? list.items.map(i => _buildItemRow(list.id, i, {})).join('')
        : noItems;
    }

    // ── Progress bar ─────────────────────────────────────────────────
    const progressSection = (list.type !== 'template' && total > 0)
      ? `<div style="font-size:var(--text-xs);color:var(--color-text-dim);padding:4px var(--space-md)">
           ${App.I18n.t('list_progress', { checked, total })}
         </div>`
      : '';

    // ── Header buttons ────────────────────────────────────────────────
    const resetBtn = list.type === 'reusable' && checked > 0
      ? `<button class="card-delete-btn" title="${t('list_reset')}"
           onclick="App.Lists._reset('${list.id}')">↺</button>`
      : '';

    const copyBtn = list.type === 'template'
      ? `<button class="card-delete-btn" title="${t('list_copy')}"
           onclick="App.Lists._copyList('${list.id}')">📋</button>`
      : '';

    return `<div class="list-card">
      <div class="list-card-header">
        <div>
          <div class="list-title">${_esc(list.name)}</div>
          <span class="list-type-chip">${typeLabel}</span>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          ${resetBtn}${copyBtn}
          <button class="card-delete-btn" title="${t('share_list')}"
            onclick="App.Lists._shareList('${list.id}')">↗</button>
          <button class="card-delete-btn" title="Edit"
            onclick="App.Lists._editList('${list.id}')">✎</button>
          <button class="card-delete-btn" title="Delete"
            onclick="App.Lists._deleteList('${list.id}')">×</button>
        </div>
      </div>
      ${progressSection}
      <div class="list-items-wrap">
        ${itemsArea}
      </div>
      <div class="list-add-row">
        <input class="list-add-input" id="add-item-${list.id}"
          placeholder="${t('add_item')}"
          onkeydown="if(event.key==='Enter')App.Lists._addItem('${list.id}')">
        <button class="btn btn-primary btn-sm"
          onclick="App.Lists._addItem('${list.id}')">+</button>
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
  function _listReminderSourceId(listId, itemId) {
    return listId + '_' + itemId;
  }

  function _clearListItemPushReminder(listId, itemId) {
    App.Push?.clearReminder?.('list_item', _listReminderSourceId(listId, itemId));
  }

  function _toggleItem(listId, itemId) {
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === listId);
    const item = list && list.items.find(i => i.id === itemId);
    const willComplete = item && !item.checked;
    App.Storage.toggleListItem(listId, itemId);
    if (willComplete) {
      App.Storage.updateListItemReminder(listId, itemId, '');
      _clearListItemPushReminder(listId, itemId);
    }
    render();
  }

  function _deleteItem(listId, itemId) {
    _clearListItemPushReminder(listId, itemId);
    App.Storage.deleteListItem(listId, itemId);
    render();
  }

  function _editItem(listId, itemId) {
    const state = App.Storage.getState();
    const list  = state.lists.find(l => l.id === listId);
    const item  = list && list.items.find(i => i.id === itemId);
    if (!item) return;
    const t = App.I18n.t.bind(App.I18n);
    const newText = prompt(t('list_edit_item') + ':', item.text);
    if (newText === null) return;           // user cancelled
    const trimmed = newText.trim();
    if (!trimmed) return;                   // empty — ignore
    App.Storage.updateListItem(listId, itemId, trimmed);
    render();
  }

  function _addItem(listId) {
    const input = document.getElementById('add-item-' + listId);
    const text  = input && input.value.trim();
    if (!text) return;
    App.Storage.addListItem(listId, text);
    input.value = '';
    render();
    // Re-focus the input after re-render
    setTimeout(() => document.getElementById('add-item-' + listId) &&
      document.getElementById('add-item-' + listId).focus(), 50);
  }

  function _reset(listId) {
    App.Storage.resetList(listId);
    App.showToast(App.I18n.t('list_reset'), 'success');
    render();
  }

  function _copyList(id) {
    const state = App.Storage.getState();
    const tpl   = state.lists.find(l => l.id === id);
    if (!tpl) return;
    const newItems = tpl.items.map(item => ({
      id:        App.Storage.generateId(),
      text:      item.text,
      checked:   false,
      createdAt: new Date().toISOString(),
    }));
    App.Storage.addList({ name: tpl.name + ' ' + App.I18n.t('list_copy_suffix'), type: 'reusable', items: newItems });
    App.showToast(App.I18n.t('list_copy'), 'success');
    render();
  }

  // ── Share List ───────────────────────────────────────────────────────
  function _shareList(id) {
    const state = App.Storage.getState();
    const list  = state.lists.find(l => l.id === id);
    if (!list) return;
    const t = App.I18n.t.bind(App.I18n);

    // Build plain-text representation
    const lines = [`📋 ${list.name}`];
    list.items.forEach(item => {
      lines.push((item.checked ? '✓ ' : '• ') + item.text);
    });
    const text = lines.join('\n');

    if (navigator.share) {
      navigator.share({ title: list.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text)
        .then(() => App.showToast(t('share_list_copied'), 'success'))
        .catch(() => App.showToast(t('toast_copy_failed'), 'error'));
    }
  }

  // ── List Modal ────────────────────────────────────────────────────
  function _openModal(list) {
    const isEdit = !!list;
    const t = App.I18n.t.bind(App.I18n);
    // Use defaultListBehavior for new lists; fall back to 'reusable'
    const defaultType = App.Storage.getState().settings.defaultListBehavior || 'reusable';
    const l = list || { name: '', type: defaultType };

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
    const list  = state.lists.find(l => l.id === id);
    if (list) _openModal(list);
  }

  function _saveList(id) {
    const name = document.getElementById('list-name') && document.getElementById('list-name').value.trim();
    const type = document.getElementById('list-type') && document.getElementById('list-type').value || 'reusable';
    if (!name) { App.showToast(App.I18n.t('toast_list_name_req'), 'error'); return; }
    if (id) {
      App.Storage.updateList(id, { name, type });
      App.showToast(App.I18n.t('toast_list_updated'), 'success');
    } else {
      App.Storage.addList({ name, type });
      App.showToast(App.I18n.t('toast_list_created'), 'success');
    }
    _closeModal();
    render();
  }

  function _deleteList(id, fromModal) {
    if (!confirm('Delete this list and all its items?')) return;
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === id);
    if (list) {
      list.items.forEach(item => _clearListItemPushReminder(id, item.id));
    }
    App.Storage.deleteList(id);
    if (fromModal) _closeModal();
    App.showToast(App.I18n.t('toast_list_deleted'), 'success');
    render();
  }

  function _closeModal() {
    document.getElementById('list-modal') && document.getElementById('list-modal').remove();
  }

  function onFab() { _openModal(null); }

  App.Lists = {
    render, onFab,
    _toggleItem, _deleteItem, _editItem, _addItem, _reset, _copyList,
    _openModal, _editList, _saveList, _deleteList, _closeModal, _shareList,
  };

})(window.App = window.App || {});
