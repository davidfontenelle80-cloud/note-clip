/**
 * lists.js — Note Clip PWA
 * Lists tab: Reusable, Goal-Based, Template lists. Full CRUD.
 */
(function (App) {
  'use strict';

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _attr(s) {
    return _esc(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _profileName() {
    return (App.Storage.getState().settings.username || '').trim();
  }

  function _num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function _money(value) {
    return '$' + _num(value, 0).toFixed(2);
  }

  function _price(value) {
    return Math.max(0, _num(value, 0));
  }

  function _lineTotal(item) {
    if (!item || !item.checked) return 0;
    return _price(item.price) * _num(item.qty, 1);
  }

  function _groceryTotals(list) {
    const items = Array.isArray(list.items) ? list.items : [];
    const selected = items.reduce((sum, item) => sum + _lineTotal(item), 0);
    const budget = _num(list.budget, 150);
    return { budget, selected, remaining: budget - selected };
  }

  function _buildGroceryItemRow(listId, item) {
    const checked = item.checked ? ' checked' : '';
    const recurring = item.recurring !== false;
    const line = _lineTotal(item);
    return `<div class="grocery-item${checked}">
      <button type="button" class="list-item-check${checked}"
        aria-label="${item.checked ? 'Remove from this trip' : 'Add to this trip'}"
        onclick="App.Lists._toggleItem('${listId}','${item.id}')">${item.checked ? '&#10003;' : ''}</button>
      <div class="grocery-item-main">
        <div class="grocery-item-name">${_esc(item.text)}</div>
        <div class="grocery-item-meta">${recurring ? App.I18n.t('grocery_recurring') : App.I18n.t('grocery_one_time')}</div>
      </div>
      <div class="grocery-price">${_money(_price(item.price))}</div>
      <div class="grocery-qty">x${_num(item.qty, 1)}</div>
      <div class="grocery-total">${_money(line)}</div>
      <button class="card-delete-btn" title="Edit" aria-label="Edit item"
        onclick="App.Lists._editItem('${listId}','${item.id}')">&#9998;</button>
      <button class="card-delete-btn" title="Delete" aria-label="Delete item"
        onclick="App.Lists._deleteItem('${listId}','${item.id}')">&times;</button>
    </div>`;
  }

  function _buildGrocerySection(list, title, items, emptyText) {
    return `<div class="grocery-section">
      <div class="grocery-section-title">${title}</div>
      ${items.length ? items.map(item => _buildGroceryItemRow(list.id, item)).join('') :
        `<div class="grocery-empty">${emptyText}</div>`}
    </div>`;
  }

  function _buildGroceryCard(list) {
    const t = App.I18n.t.bind(App.I18n);
    const items = Array.isArray(list.items) ? list.items : [];
    const recurring = items.filter(item => item.recurring !== false);
    const oneTime = items.filter(item => item.recurring === false);
    const totals = _groceryTotals(list);
    const checked = items.filter(item => item.checked).length;
    const resetBtn = (checked > 0 || oneTime.length > 0)
      ? `<button class="card-delete-btn grocery-reset-btn" title="${t('grocery_reset_week')}"
           onclick="App.Lists._reset('${list.id}')">${t('grocery_reset_week')}</button>`
      : '';

    return `<div class="list-card grocery-card">
      <div class="list-card-header grocery-card-header">
        <div>
          <div class="list-title">${_esc(list.name)}</div>
          <span class="list-type-chip">${t('list_grocery')}</span>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          ${resetBtn}
          <button class="card-delete-btn" title="Edit"
            onclick="App.Lists._editList('${list.id}')">&#9998;</button>
          <button class="card-delete-btn" title="Delete"
            onclick="App.Lists._deleteList('${list.id}')">&times;</button>
        </div>
      </div>
      <div class="grocery-budget-grid">
        <label class="grocery-budget-cell">
          <span>${t('grocery_budget')}</span>
          <input type="number" inputmode="decimal" min="0" step="0.01"
            value="${totals.budget.toFixed(2)}"
            onchange="App.Lists._setGroceryBudget('${list.id}',this.value)">
        </label>
        <div class="grocery-budget-cell">
          <span>${t('grocery_selected')}</span>
          <strong>${_money(totals.selected)}</strong>
        </div>
        <div class="grocery-budget-cell${totals.remaining < 0 ? ' over' : ''}">
          <span>${t('grocery_remaining')}</span>
          <strong>${_money(totals.remaining)}</strong>
        </div>
      </div>
      ${_buildGrocerySection(list, t('grocery_recurring_items'), recurring, t('grocery_no_recurring'))}
      ${_buildGrocerySection(list, t('grocery_one_time_items'), oneTime, t('grocery_no_one_time'))}
      <div class="grocery-add-row">
        <input class="list-add-input" id="add-grocery-name-${list.id}" placeholder="${t('grocery_item_name')}"
          onkeydown="if(event.key==='Enter')App.Lists._addGroceryItem('${list.id}')">
        <input class="grocery-add-price" id="add-grocery-price-${list.id}" type="number" inputmode="decimal" min="0" step="0.01" placeholder="${t('grocery_price')}">
        <input class="grocery-add-qty" id="add-grocery-qty-${list.id}"
          type="text" inputmode="numeric" pattern="[0-9]*"
          value="1" onfocus="this.select()"
          aria-label="${t('grocery_qty')}">
        <button class="btn btn-primary btn-sm" onclick="App.Lists._addGroceryItem('${list.id}')">+</button>
      </div>
      <div class="grocery-add-footer">
        <label class="grocery-recurring-toggle">
          <input id="add-grocery-recurring-${list.id}" type="checkbox">
          <span>${t('grocery_save_recurring')}</span>
        </label>
        <div class="grocery-remaining-pill${totals.remaining < 0 ? ' over' : ''}">
          ${totals.remaining >= 0
            ? _money(totals.remaining) + ' left'
            : _money(Math.abs(totals.remaining)) + ' over'}
        </div>
      </div>
    </div>`;
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
    if (list.type === 'grocery') return _buildGroceryCard(list);
    const checked = list.items.filter(i => i.checked).length;
    const total   = list.items.length;
    const typeLabel = t('list_' + list.type) || t('list_reusable');

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
    if (list?.type === 'grocery') {
      _editItemModal(listId, item);
      return;
    }
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

  function _addGroceryItem(listId) {
    const nameInput = document.getElementById('add-grocery-name-' + listId);
    const priceInput = document.getElementById('add-grocery-price-' + listId);
    const qtyInput = document.getElementById('add-grocery-qty-' + listId);
    const recurringInput = document.getElementById('add-grocery-recurring-' + listId);
    const text = nameInput?.value.trim() || '';
    if (!text) return;
    App.Storage.addListItem(listId, {
      text,
      price: _price(priceInput?.value),
      qty: Math.max(1, _num(qtyInput?.value, 1)),
      recurring: !!recurringInput?.checked,
      checked: true,
    });
    nameInput.value = '';
    if (priceInput) priceInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (recurringInput) recurringInput.checked = false;
    render();
    setTimeout(() => document.getElementById('add-grocery-name-' + listId)?.focus(), 50);
  }

  function _reset(listId) {
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === listId);
    if (list?.type === 'grocery') {
      App.Storage.resetGroceryList(listId);
    } else {
      App.Storage.resetList(listId);
    }
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

    const typeOpts = ['reusable','goal','template','grocery'].map(tp =>
      `<option value="${tp}"${l.type===tp?' selected':''}>${t('list_'+tp)}</option>`
    ).join('');
    const budgetValue = _num(l.budget, 150).toFixed(2);

    const html = `
      <div id="list-modal" class="modal-backdrop" onclick="if(event.target===this)App.Lists._closeModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? t('edit_list') : t('add_list')}</div>
          <div class="form-group">
            <label class="form-label">${t('list_name')}</label>
            <input id="list-name" class="form-input" placeholder="My list…" value="${_attr(l.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('list_type')}</label>
            <select id="list-type" class="form-select" onchange="App.Lists._syncListBudgetField()">${typeOpts}</select>
          </div>
          <div class="form-group grocery-list-budget-field" style="${l.type === 'grocery' ? '' : 'display:none'}">
            <label class="form-label">${t('grocery_budget')}</label>
            <input id="list-budget" class="form-input" type="number" inputmode="decimal" min="0" step="0.01" value="${budgetValue}">
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
    const budget = Math.max(0, _num(document.getElementById('list-budget')?.value, 150));
    if (!name) { App.showToast(App.I18n.t('toast_list_name_req'), 'error'); return; }
    if (id) {
      App.Storage.updateList(id, type === 'grocery' ? { name, type, budget } : { name, type });
      App.showToast(App.I18n.t('toast_list_updated'), 'success');
    } else {
      App.Storage.addList(type === 'grocery' ? { name, type, budget } : { name, type });
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
    App.restoreFocus?.();
  }

  function _openItemModal(listId, item) {
    const t = App.I18n.t.bind(App.I18n);
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === listId);
    const isGrocery = list?.type === 'grocery';
    const groceryFields = isGrocery ? `
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="list-item-price">${t('grocery_price')}</label>
              <input id="list-item-price" class="form-input" type="number" inputmode="decimal" min="0" step="0.01" value="${_attr(_price(item.price).toFixed(2))}">
            </div>
            <div class="form-group">
              <label class="form-label" for="list-item-qty">${t('grocery_qty')}</label>
              <input id="list-item-qty" class="form-input" type="number" inputmode="numeric" min="1" step="1" value="${_attr(_num(item.qty, 1))}">
            </div>
          </div>
          <label class="grocery-recurring-toggle grocery-modal-toggle">
            <input id="list-item-recurring" type="checkbox"${item.recurring !== false ? ' checked' : ''}>
            <span>${t('grocery_save_recurring')}</span>
          </label>` : '';
    const html = `
      <div id="list-item-modal" class="modal-backdrop" onclick="if(event.target===this)App.Lists._closeItemModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${t('list_edit_item')}</div>
          <div class="form-group">
            <label class="form-label" for="list-item-text">${t('list_edit_item')}</label>
            <input id="list-item-text" class="form-input" value="${_attr(item.text)}"
              onkeydown="if(event.key==='Enter')App.Lists._saveItemEdit('${listId}','${item.id}')">
          </div>
          ${groceryFields}
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="App.Lists._closeItemModal()">${t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Lists._saveItemEdit('${listId}','${item.id}')">${t('save')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('list-item-modal');
    const input = document.getElementById('list-item-text');
    input?.focus();
    input?.select();
  }

  function _editItemModal(listId, item) {
    if (item) _openItemModal(listId, item);
  }

  function _saveItemEdit(listId, itemId) {
    const trimmed = document.getElementById('list-item-text')?.value.trim() || '';
    if (!trimmed) return;
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === listId);
    if (list?.type === 'grocery') {
      App.Storage.updateListItem(listId, itemId, {
        text: trimmed,
        price: _price(document.getElementById('list-item-price')?.value),
        qty: Math.max(1, _num(document.getElementById('list-item-qty')?.value, 1)),
        recurring: document.getElementById('list-item-recurring')?.checked !== false,
      });
    } else {
      App.Storage.updateListItem(listId, itemId, trimmed);
    }
    _closeItemModal();
    render();
  }

  function _setGroceryBudget(listId, value) {
    App.Storage.updateList(listId, { budget: Math.max(0, _num(value, 150)) });
    render();
  }

  function _syncListBudgetField() {
    const type = document.getElementById('list-type')?.value || 'reusable';
    const field = document.querySelector('#list-modal .grocery-list-budget-field');
    if (field) field.style.display = type === 'grocery' ? '' : 'none';
  }

  function _closeItemModal() {
    document.getElementById('list-item-modal')?.remove();
    App.restoreFocus?.();
  }

  function onFab() { _openModal(null); }

  App.Lists = {
    render, onFab,
    _toggleItem, _deleteItem, _editItem, _addItem, _addGroceryItem, _reset, _copyList,
    _openModal, _editList, _saveList, _deleteList, _closeModal, _shareList,
    _saveItemEdit, _closeItemModal, _setGroceryBudget, _syncListBudgetField,
  };

})(window.App = window.App || {});
