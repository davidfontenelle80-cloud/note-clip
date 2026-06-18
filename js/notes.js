/**
 * notes.js — Note Clip PWA
 * Notes + Categories tab. Full CRUD. Pastel cards. Delete visible on card.
 */
(function (App) {
  'use strict';

  let _view = 'categories'; // 'categories' | 'notes' | 'note-list'
  let _filterCatId = null;
  let _filterStatus = 'active';
  let _searchQuery = '';
  let _dateFilter = null;
  let _editingNoteId = null;
  let _editingCatId  = null;

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const CAT_ICON_CLASS = {
    ic_cat_work: 'work',
    ic_cat_medical: 'medical',
    ic_cat_personal: 'personal',
    ic_cat_home: 'home',
    ic_cat_documents: 'documents',
    ic_cat_followup: 'followup',
    ic_cat_orders: 'orders',
    ic_cat_ideas: 'ideas',
  };

  // Render category icons as the same paper/stationery family as the nav.
  function _iconHtml(icon, cls) {
    if (!icon) return '';
    const catClass = CAT_ICON_CLASS[String(icon)];
    if (catClass && cls === 'chip-icon-img') {
      return `<span class="cat-chip-stationery cat-${catClass}" aria-hidden="true"></span>`;
    }
    if (catClass) {
      return `<span class="cat-stationery cat-${catClass}" aria-hidden="true"><span class="cat-mark"></span></span>`;
    }
    if (String(icon).startsWith('ic_')) {
      return `<img src="./icons/${icon}.png" class="${cls || 'cat-icon-img'}" alt="" loading="lazy">`;
    }
    return _esc(icon);
  }

  // ── Status Tabs ───────────────────────────────────────────────────
  function buildStatusTabs() {
    const statuses = ['active','awaiting','followup','hold','toread','completed','archived'];
    return `<div class="status-tabs">
      ${statuses.map(s => `
        <button class="status-tab${_filterStatus === s ? ' active' : ''}"
          onclick="App.Notes._setStatus('${s}')">
          ${App.I18n.t('status_'+s)}
        </button>`).join('')}
    </div>`;
  }

  // ── Category Grid ─────────────────────────────────────────────────
  function buildCategoryGrid(state) {
    if (!state.categories.length) {
      return `<div class="empty-state">
        <div class="empty-state-icon"><span class="empty-stationery empty-notes" aria-hidden="true"><span></span></span></div>
        <div class="empty-state-text">${App.I18n.t('categories')}</div>
        <div class="empty-state-sub">${App.I18n.t('tap_plus')}</div>
      </div>`;
    }
    const cards = state.categories.map(cat => {
      const count = state.notes.filter(n => n.categoryId === cat.id).length;
      const catClass = CAT_ICON_CLASS[String(cat.icon)] || 'custom';
      return `<div class="category-card category-${catClass}" role="button" tabindex="0"
        onclick="App.Notes._viewCat('${cat.id}')"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.Notes._viewCat('${cat.id}')}">
        <div class="category-card-top">
          <div class="category-icon-wrap">${_iconHtml(cat.icon)}</div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="card-delete-btn"
              onclick="event.stopPropagation();App.Notes._editCat('${cat.id}')" title="Edit">✎</button>
            <button class="card-delete-btn"
              onclick="event.stopPropagation();App.Notes._deleteCat('${cat.id}')" title="Delete">×</button>
          </div>
        </div>
        <div class="category-name">${_esc(cat.name)}</div>
        <div class="category-count">${count} ${App.I18n.t('notes')}</div>
      </div>`;
    }).join('');
    return `<div class="category-grid">${cards}</div>`;
  }

  // ── Note Card ─────────────────────────────────────────────────────
  function buildNoteCard(note, state) {
    const cat = state.categories.find(c => c.id === note.categoryId);
    const title = note.title || note.body.slice(0, 50);
    const body  = note.body && note.title ? note.body : '';
    const date  = note.dueDate
      ? new Date(note.dueDate).toLocaleDateString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })
      : new Date(note.createdAt).toLocaleDateString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' });
    const pClass = {
      critical:'priority-urgent', urgent:'priority-urgent',
      high:'priority-high', medium:'priority-medium',
      low:'priority-low', optional:'priority-low'
    }[note.priority] || 'priority-medium';

    return `<div class="note-card" data-color="${_esc(note.color || 'yellow')}" role="button" tabindex="0"
      onclick="App.Notes._editNote('${note.id}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.Notes._editNote('${note.id}')}">
      <div class="note-card-header">
        <div class="note-card-title">${_esc(title)}</div>
        <button class="card-delete-btn"
          onclick="event.stopPropagation();App.Notes._deleteNote('${note.id}')" title="Delete">×</button>
      </div>
      ${body ? `<div class="note-card-body">${_esc(body.slice(0,120))}${body.length>120?'…':''}</div>` : ''}
      <div class="note-card-footer">
        <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
          ${note.priority !== 'medium' ? `<span class="priority-badge ${pClass}">${App.I18n.t('priority_'+note.priority)}</span>` : ''}
          ${cat ? `<span class="chip">${_iconHtml(cat.icon,'chip-icon-img')} ${_esc(cat.name)}</span>` : ''}
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <span class="note-card-date">${date}</span>
          ${note.status !== 'active'
            ? `<span class="chip" style="font-size:0.65rem">${App.I18n.t('status_'+note.status)}</span>`
            : ''}
        </div>
      </div>
      ${note.address ? `<div style="font-size:var(--text-xs);color:rgba(0,0,0,.5);margin-top:4px">${_esc(note.locationName || note.address)}</div>` : ''}
    </div>`;
  }

  // ── Notes Grid View ───────────────────────────────────────────────
  function buildNotesGrid(state) {
    let notes = state.notes;
    if (_filterCatId) notes = notes.filter(n => n.categoryId === _filterCatId);

    // Status filter
    if (_filterStatus === 'archived') {
      notes = notes.filter(n => n.archived);
    } else if (_filterStatus === 'completed') {
      notes = notes.filter(n => n.completed && !n.archived);
    } else {
      notes = notes.filter(n => !n.archived && !n.completed && n.status === _filterStatus);
    }

    // Date filter (from calendar tap)
    if (_dateFilter) {
      notes = notes.filter(n => n.dueDate && n.dueDate.slice(0,10) === _dateFilter);
    }

    // Search filter
    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body  || '').toLowerCase().includes(q)
      );
    }

    // Sort: overdue → today → future (date asc) → no-date; then priority, then newest
    const today = new Date().toISOString().slice(0, 10);
    const _priOrder = { critical:0, urgent:0, high:1, medium:2, low:3, optional:4 };
    notes = [...notes].sort((a, b) => {
      const ad = a.dueDate || null, bd = b.dueDate || null;
      const aScore = !ad ? 3 : ad < today ? 0 : ad === today ? 1 : 2;
      const bScore = !bd ? 3 : bd < today ? 0 : bd === today ? 1 : 2;
      if (aScore !== bScore) return aScore - bScore;
      if (ad && bd && ad !== bd) return ad.localeCompare(bd);
      const ap = _priOrder[a.priority] ?? 2, bp = _priOrder[b.priority] ?? 2;
      if (ap !== bp) return ap - bp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    const searchBar = `
      <div class="search-bar-wrap" style="margin-bottom:var(--space-md)">
        <input id="notes-search" class="form-input" type="search"
          placeholder="${App.I18n.t('notes_search')}"
          value="${_esc(_searchQuery)}"
          oninput="App.Notes._setSearch(this.value)">
      </div>`;

    if (!notes.length) {
      return searchBar + `<div class="empty-state">
        <div class="empty-state-icon"><span class="empty-stationery empty-notes" aria-hidden="true"><span></span></span></div>
        <div class="empty-state-text">${App.I18n.t('no_notes')}</div>
        <div class="empty-state-sub">${_searchQuery ? 'No results — try a different search' : App.I18n.t('tap_plus')}</div>
      </div>`;
    }
    return searchBar + `<div class="notes-grid">${notes.map(n => buildNoteCard(n, state)).join('')}</div>`;
  }

  // ── Main Render ───────────────────────────────────────────────────
  function render() {
    const el = document.getElementById('pane-notes');
    if (!el) return;
    const state = App.Storage.getState();

    const catName = _filterCatId
      ? (state.categories.find(c => c.id === _filterCatId)?.name || '')
      : '';

    const viewTabs = `
      <div class="status-tabs" style="margin-bottom:var(--space-md)">
        <button class="status-tab${_view==='categories'?' active':''}"
          onclick="App.Notes._setView('categories')">${App.I18n.t('by_category')}</button>
        <button class="status-tab${_view!=='categories'?' active':''}"
          onclick="App.Notes._setView('notes')">${App.I18n.t('all_notes')}</button>
      </div>`;

    let content = '';
    if (_view === 'categories') {
      content = buildCategoryGrid(state);
    } else if (_view === 'notes') {
      content = buildStatusTabs() + buildNotesGrid(state);
    } else if (_view === 'note-list') {
      // Notes for a specific category
      content = `
        <button class="btn btn-secondary btn-sm" onclick="App.Notes._setView('categories')" style="margin-bottom:var(--space-md)">
          ← ${App.I18n.t('categories')}
        </button>
        <div class="section-header">
          <span class="section-title">${_esc(catName)}</span>
        </div>
        ${buildStatusTabs()}
        ${buildNotesGrid(state)}`;
    }

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${_view === 'note-list' ? '' : App.I18n.t(_view==='categories'?'categories':'all_notes')}</span>
      </div>
      ${_view !== 'note-list' ? viewTabs : ''}
      ${content}
    `;
  }

  // ── Navigation ────────────────────────────────────────────────────
  function _setView(v) {
    _view = v;
    if (v !== 'note-list') _filterCatId = null;
    render();
  }

  function _viewCat(catId) {
    _filterCatId = catId;
    _view = 'note-list';
    render();
  }

  function _setStatus(s) {
    _filterStatus = s;
    render();
  }

  function _setSearch(q) {
    _searchQuery = q || '';
    // Debounce: re-render on input without full page rebuild
    const state = App.Storage.getState();
    const gridEl = document.querySelector('.notes-grid, .empty-state');
    const wrapEl = gridEl ? gridEl.closest('.notes-grid, .search-bar-wrap')?.parentElement : null;
    render();
  }

  // ── Note Modal ────────────────────────────────────────────────────
  function _openNoteModal(note) {
    const state = App.Storage.getState();
    const isEdit = !!note;
    const n = note || {
      title: '', body: '', color: 'yellow', categoryId: null,
      priority: 'medium', status: 'active',
      dueDate: '', dueTime: '', reminder: '',
      appointmentName: '', appointmentDatetime: '', leaveBy: '',
      locationName: '', address: '',
    };

    const colorRow = App.Storage.NOTE_COLORS.map(c => {
      const hex = { lavender:'#D4C5E2', sky:'#BDD5EA', mint:'#C5E2C5', yellow:'#F7F0B6', coral:'#F2C4B0', peach:'#F7D9B0' }[c];
      return `<div class="color-swatch${n.color===c?' selected':''}" style="background:${hex}"
        data-color="${c}" onclick="App.Notes._pickColor('${c}')"></div>`;
    }).join('');

    const catOptions = state.categories.map(c =>
      `<option value="${c.id}"${n.categoryId===c.id?' selected':''}>${_esc(c.name)}</option>`
    ).join('');

    const priorityOpts = ['critical','high','medium','low','optional'].map(p =>
      `<option value="${p}"${n.priority===p?' selected':''}>${App.I18n.t('priority_'+p)}</option>`
    ).join('');

    const statusOpts = ['active','awaiting','followup','hold','toread'].map(s =>
      `<option value="${s}"${n.status===s?' selected':''}>${App.I18n.t('status_'+s)}</option>`
    ).join('');

    const mapsBlock = n.address ? `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-sm)">
        <button class="share-btn" onclick="App.Notes._openAppleMaps()">${App.I18n.t('open_maps')}</button>
        <button class="share-btn" onclick="App.Notes._openGoogleMaps()">${App.I18n.t('open_gmaps')}</button>
        <button class="share-btn copy" onclick="App.Notes._copyAddress()">${App.I18n.t('copy_address')}</button>
      </div>` : '';

    const html = `
      <div id="note-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_note') : App.I18n.t('add_note')}</div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_title')}</label>
            <input id="note-title" class="form-input" placeholder="${App.I18n.t('note_title_ph')}" value="${_esc(n.title)}">
          </div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_body')}</label>
            <textarea id="note-body" class="form-textarea" placeholder="${App.I18n.t('note_body_ph')}">${_esc(n.body)}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${App.I18n.t('note_priority')}</label>
              <select id="note-priority" class="form-select">${priorityOpts}</select>
            </div>
            <div class="form-group">
              <label class="form-label">${App.I18n.t('note_status')}</label>
              <select id="note-status" class="form-select">${statusOpts}</select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_category')}</label>
            <select id="note-cat" class="form-select">
              <option value="">— none —</option>
              ${catOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_color')}</label>
            <div class="color-row" id="color-row">${colorRow}</div>
          </div>

          <details open style="margin-bottom:var(--space-md)">
            <summary style="font-size:var(--text-sm);font-weight:600;cursor:pointer;padding:8px 0;color:var(--color-text-muted)">
              ${App.I18n.t('note_due_reminder')}
            </summary>
            <div style="padding-top:var(--space-sm)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_due')}</label>
                  <input type="date" id="note-due" class="form-input" value="${_esc(n.dueDate)}">
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_due_time')}</label>
                  <input type="time" id="note-due-time" class="form-input" value="${_esc(n.dueTime)}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_reminder')}</label>
                <select id="note-reminder" class="form-select">
                  <option value="">— none —</option>
                  <option value="same_day"${n.reminder==='same_day'?' selected':''}>Same day (8am)</option>
                  <option value="day_before"${n.reminder==='day_before'?' selected':''}>Day before</option>
                  <option value="1h_before"${n.reminder==='1h_before'?' selected':''}>1 hour before</option>
                  <option value="2h_before"${n.reminder==='2h_before'?' selected':''}>2 hours before</option>
                </select>
              </div>
            </div>
          </details>

          <details style="margin-bottom:var(--space-md)">
            <summary style="font-size:var(--text-sm);font-weight:600;cursor:pointer;padding:8px 0;color:var(--color-text-muted)">
              ${App.I18n.t('note_appt_location')}
            </summary>
            <div style="padding-top:var(--space-sm)">
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_appt')}</label>
                <input id="note-appt-name" class="form-input" placeholder="Appointment name…" value="${_esc(n.appointmentName)}">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_appt_dt')}</label>
                  <input type="datetime-local" id="note-appt-dt" class="form-input" value="${_esc(n.appointmentDatetime)}">
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_leave_by')}</label>
                  <input type="time" id="note-leave" class="form-input" value="${_esc(n.leaveBy)}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_location')}</label>
                <input id="note-location" class="form-input" placeholder="Location name…" value="${_esc(n.locationName)}">
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_address')}</label>
                <input id="note-address" class="form-input" placeholder="Full address…" value="${_esc(n.address)}">
              </div>
              ${mapsBlock}
            </div>
          </details>

          <div class="modal-actions sticky-actions">
            ${isEdit ? `
              <button class="btn btn-danger btn-sm" onclick="App.Notes._deleteNote('${n.id}',true)">
                ${App.I18n.t('delete')}
              </button>
              ${n.completed
                ? `<button class="btn btn-secondary btn-sm" onclick="App.Notes._reopenNote('${n.id}')">↩ Reopen</button>`
                : `<button class="btn btn-secondary btn-sm" onclick="App.Notes._completeNote('${n.id}')">✓</button>`}
              ${n.archived
                ? `<button class="btn btn-secondary btn-sm" onclick="App.Notes._restoreNote('${n.id}')">${App.I18n.t('restore')}</button>`
                : `<button class="btn btn-secondary btn-sm" onclick="App.Notes._archiveNote('${n.id}')">${App.I18n.t('archive')}</button>`}
            ` : ''}
            <button class="btn btn-secondary" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Notes._saveNote('${isEdit ? n.id : ''}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('note-modal');
    document.getElementById('note-title').focus();
    _selectedNoteColor = n.color || 'yellow';
  }

  let _selectedNoteColor = 'yellow';

  function _pickColor(c) {
    _selectedNoteColor = c;
    document.querySelectorAll('#color-row .color-swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.color === c);
    });
  }

  function _saveNote(id) {
    const title    = document.getElementById('note-title')?.value.trim() || '';
    const body     = document.getElementById('note-body')?.value.trim()  || '';
    const priority = document.getElementById('note-priority')?.value || 'medium';
    const status   = document.getElementById('note-status')?.value   || 'active';
    const catId    = document.getElementById('note-cat')?.value       || null;
    const dueDate  = document.getElementById('note-due')?.value       || '';
    const dueTime  = document.getElementById('note-due-time')?.value  || '';
    const reminder = document.getElementById('note-reminder')?.value  || '';
    const apptName = document.getElementById('note-appt-name')?.value || '';
    const apptDt   = document.getElementById('note-appt-dt')?.value   || '';
    const leaveBy  = document.getElementById('note-leave')?.value     || '';
    const locName  = document.getElementById('note-location')?.value  || '';
    const address  = document.getElementById('note-address')?.value   || '';

    if (!title && !body) { App.showToast(App.I18n.t('toast_enter_title'), 'error'); return; }

    const patch = {
      title, body, priority, status, color: _selectedNoteColor,
      categoryId: catId || null,
      dueDate, dueTime, reminder, appointmentName: apptName,
      appointmentDatetime: apptDt, leaveBy, locationName: locName, address,
    };

    if (id) {
      App.Storage.updateNote(id, patch);
      App.showToast(App.I18n.t('toast_note_updated'), 'success');
    } else {
      App.Storage.addNote(patch);
      App.showToast(App.I18n.t('toast_note_saved'), 'success');
    }
    _closeModal();
    render();
    // Refresh dashboard reminders if visible
    if (document.getElementById('reminders-wrap')) App.Dashboard.render();
  }

  function _editNote(id) {
    const state = App.Storage.getState();
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    _editingNoteId = id;
    _openNoteModal(note);
  }

  function _deleteNote(id, fromModal) {
    if (!confirm('Delete this note?')) return;
    App.Storage.deleteNote(id);
    if (fromModal) _closeModal();
    App.showToast(App.I18n.t('toast_note_deleted'), 'success');
    render();
  }

  function _completeNote(id) {
    App.Storage.updateNote(id, { completed: true, status: 'completed' });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_completed'), 'success');
    render();
  }

  function _archiveNote(id) {
    App.Storage.updateNote(id, { archived: true });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_archived'), 'success');
    render();
  }

  function _restoreNote(id) {
    App.Storage.updateNote(id, { archived: false });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_restored'), 'success');
    render();
  }

  function _reopenNote(id) {
    App.Storage.updateNote(id, { completed: false, status: 'active' });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_reopened'), 'success');
    render();
  }

  function _openAppleMaps() {
    const addr = document.getElementById('note-address')?.value || '';
    if (addr) window.open(`https://maps.apple.com/?q=${encodeURIComponent(addr)}`,'_blank');
  }
  function _openGoogleMaps() {
    const addr = document.getElementById('note-address')?.value || '';
    if (addr) window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`,'_blank');
  }
  function _copyAddress() {
    const addr = document.getElementById('note-address')?.value || '';
    if (addr) {
      navigator.clipboard.writeText(addr).then(() => App.showToast(App.I18n.t('toast_address_copied'),'success'));
    }
  }

  function _closeModal() {
    document.getElementById('note-modal')?.remove();
    document.getElementById('cat-modal')?.remove();
    document.getElementById('cat-delete-modal')?.remove();
    App.restoreFocus?.();
    _editingNoteId = null;
    _editingCatId  = null;
  }

  // ── Category Modal ────────────────────────────────────────────────
  function _openCatModal(cat) {
    const isEdit = !!cat;
    const c = cat || { name: '', icon: 'ic_cat_personal', color: '#F7F0B6' };

    const html = `
      <div id="cat-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_category') : App.I18n.t('add_category')}</div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_name')}</label>
            <input id="cat-name" class="form-input" placeholder="Category name…" value="${_esc(c.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_icon')}</label>
            <input id="cat-icon" class="form-input" placeholder="ic_cat_personal" value="${_esc(c.icon)}" maxlength="40" style="font-size:.85rem">
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Notes._saveCat('${isEdit?c.id:''}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('cat-modal');
    document.getElementById('cat-name').focus();
  }

  function _editCat(id) {
    const state = App.Storage.getState();
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;
    _editingCatId = id;
    _openCatModal(cat);
  }

  function _saveCat(id) {
    const name = document.getElementById('cat-name')?.value.trim() || '';
    const icon = document.getElementById('cat-icon')?.value.trim() || 'ic_cat_personal';
    if (!name) { App.showToast(App.I18n.t('toast_cat_name_req'), 'error'); return; }
    if (id) {
      App.Storage.updateCategory(id, { name, icon });
      App.showToast(App.I18n.t('toast_cat_updated'), 'success');
    } else {
      App.Storage.addCategory({ name, icon });
      App.showToast(App.I18n.t('toast_cat_added'), 'success');
    }
    _closeModal();
    render();
  }

  function _deleteCat(id) {
    const state = App.Storage.getState();
    const noteCount = state.notes.filter(n => n.categoryId === id).length;
    if (noteCount > 0) {
      // Show choose modal
      const html = `
        <div id="cat-delete-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
          <div class="modal-sheet">
            <div class="modal-handle"></div>
            <div class="modal-title">${App.I18n.t('delete_category')}</div>
            <p style="margin-bottom:var(--space-md);color:var(--color-text-muted)">${App.I18n.t('cat_delete_q')}</p>
            <div class="modal-actions" style="flex-direction:column">
              <button class="btn btn-secondary w-full" onclick="App.Notes._confirmDeleteCat('${id}',false)">
                ${App.I18n.t('cat_delete_tag')}
              </button>
              <button class="btn btn-danger w-full" onclick="App.Notes._confirmDeleteCat('${id}',true)">
                ${App.I18n.t('cat_delete_all')}
              </button>
              <button class="btn btn-secondary w-full" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', html);
      App.enhanceModal?.('cat-delete-modal');
    } else {
      if (!confirm('Delete this category?')) return;
      App.Storage.deleteCategory(id, false);
      App.showToast(App.I18n.t('toast_cat_deleted'), 'success');
      render();
    }
  }

  function _confirmDeleteCat(id, deleteNotes) {
    App.Storage.deleteCategory(id, deleteNotes);
    App.showToast(App.I18n.t('toast_cat_deleted'), 'success');
    _closeModal();
    render();
  }

  // ── FAB handler (called by app.js) ─────────
  function onFab() {
    if (_view === 'categories') {
      _openCatModal(null);
    } else {
      _openNoteModal(null);
    }
  }

  // ── Date filter (called from calendar date tap) ───────────────────
  function filterByDate(dateStr) {
    _dateFilter = dateStr || null;
    _view = 'notes';
    render();
    // Auto-clear after 10s so normal browsing resumes
    setTimeout(() => {
      if (_dateFilter === dateStr) {
        _dateFilter = null;
        render();
      }
    }, 10000);
  }

  App.Notes = {
    render, onFab, filterByDate,
    _setView, _viewCat, _setStatus, _setSearch,
    _editNote, _deleteNote, _completeNote, _archiveNote, _restoreNote, _reopenNote,
    _openNoteModal, _closeModal, _saveNote, _pickColor,
    _editCat, _saveCat, _deleteCat, _confirmDeleteCat,
    _openAppleMaps, _openGoogleMaps, _copyAddress,
  };

})(window.App = window.App || {});
