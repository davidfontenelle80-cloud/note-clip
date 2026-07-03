/**
 * notes.js — Note Clip PWA
 * Notes + Categories tab. Full CRUD. Pastel cards. Delete visible on card.
 */
(function (App) {
  'use strict';

  /* Push reminders are delivered by a Cloudflare Worker cron that runs every
     REMINDER_CHECK_MINUTES minutes. A reminder fires at the first cron tick
     AT OR AFTER its scheduled time. If the cron schedule ever changes, this
     constant is the only line to edit. */
  const REMINDER_CHECK_MINUTES = 5;

  /* Minimum lead time for a reminder: anything closer than one cron interval
     can be missed by the next worker check. One-line change if needed. */
  const MIN_REMINDER_LEAD_MINUTES = 5;

  // Round a reminder time up to the next cron grid mark, with a safety
  // buffer: if that mark is less than one full interval away, use the next
  // one (the worker may already be mid-run). Past/"now" times become now.
  function computeDeliveryTime(reminderTime) {
    const interval = REMINDER_CHECK_MINUTES * 60 * 1000;
    const now = Date.now();
    let t = (reminderTime instanceof Date) ? reminderTime.getTime() : new Date(reminderTime).getTime();
    if (Number.isNaN(t)) return null;
    if (t < now) t = now;
    let fireTime = Math.ceil(t / interval) * interval;
    if (fireTime - now < interval) {
      fireTime += interval;
    }
    return new Date(fireTime);
  }
  App.REMINDER_CHECK_MINUTES = REMINDER_CHECK_MINUTES;
  App.computeDeliveryTime = computeDeliveryTime;

  let _view = 'categories'; // 'categories' | 'notes' | 'note-list'
  let _filterCatId = null;
  let _filterStatus = 'active';
  let _searchQuery = '';
  let _dateFilter = null;
  let _editingNoteId = null;
  let _editingCatId  = null;

  function _esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  // Render icon: PNG img if ic_ filename, else emoji/text fallback
  function _iconHtml(icon, cls) {
    if (!icon) return '';
    if (String(icon).startsWith('ic_')) {
      return `<img src="./icons/${icon}.png" class="${cls || 'cat-icon-img'}" alt="" loading="lazy">`;
    }
    return _esc(icon);
  }

  // Flat emoji array — 80+ curated icons (ES6 \u{} syntax)
  const CATEGORY_ICON_OPTIONS = [
    '\u{1F4BC}','\u{1F4CB}','\u{1F4CA}','\u{1F4C8}','\u{1F4C9}','\u{1F5A5}\u{FE0F}','\u{1F4BB}','\u{1F5A8}\u{FE0F}','\u{1F4CE}','\u{1F5C2}\u{FE0F}','\u{1F4C1}','\u{1F4C2}','\u{1F5C3}\u{FE0F}','\u{2705}','\u{2611}\u{FE0F}',
    '\u{1F4DD}','\u{1F4C4}','\u{1F4C3}','\u{1F4DC}','\u{1F5D2}\u{FE0F}','\u{1F5D3}\u{FE0F}','\u{1F4C5}','\u{1F4C6}','\u{1F516}','\u{1F3F7}\u{FE0F}',
    '\u{1F476}','\u{1F9D2}','\u{1F466}','\u{1F467}','\u{1F9D1}','\u{1F469}','\u{1F468}','\u{1F9D1}\u{200D}\u{1F91D}\u{200D}\u{1F9D1}','\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}','\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}\u{200D}\u{1F466}',
    '\u{1F48A}','\u{1FA7A}','\u{1F3C3}','\u{1F9D8}','\u{1F4AA}','\u{1FA79}','\u{1F3CB}\u{FE0F}','\u{1F957}','\u{1F964}','\u{1F6CC}',
    '\u{1F4B0}','\u{1F4B3}','\u{1F6D2}','\u{1F3E6}','\u{1F4B5}','\u{1F9FE}','\u{1F4B8}','\u{1F3E7}',
    '\u{1F3E0}','\u{1F527}','\u{1FAB4}','\u{1F9F9}','\u{1F6CB}\u{FE0F}','\u{1F511}','\u{1FA91}','\u{1F6C1}','\u{1FA9F}','\u{1F3D7}\u{FE0F}',
    '\u{2708}\u{FE0F}','\u{1F697}','\u{1F5FA}\u{FE0F}','\u{1F9F3}','\u{1F3E8}','\u{26FD}','\u{1F68C}','\u{1F682}','\u{1F6A2}','\u{1F3D5}\u{FE0F}',
    '\u{1F37D}\u{FE0F}','\u{1F9D1}\u{200D}\u{1F373}','\u{2615}','\u{1F961}','\u{1F355}','\u{1F958}','\u{1F371}',
    '\u{1F4DA}','\u{1F393}','\u{270F}\u{FE0F}','\u{1F4D0}','\u{1F9EA}','\u{1F52C}','\u{1F4D6}','\u{1F3EB}',
    '\u{1F3B5}','\u{1F3AE}','\u{1F4F7}','\u{1F3A8}','\u{26BD}','\u{1F3AC}','\u{1F3B8}','\u{265F}\u{FE0F}','\u{1F3AF}','\u{1F3B2}',
    '\u{1F33F}','\u{2600}\u{FE0F}','\u{1F30A}','\u{1F43E}','\u{1F331}','\u{1F30D}','\u{26F0}\u{FE0F}','\u{1F338}',
    '\u{2B50}','\u{1F525}','\u{23F0}','\u{1F4CD}','\u{1F512}','\u{1F4A1}','\u{1F514}','\u{26A1}','\u{1F381}','\u{2764}\u{FE0F}','\u{1F198}','\u{1F4CC}'
  ];

  let _selectedCatIcon = CATEGORY_ICON_OPTIONS[2];

  function _catIconOption(value) {
    return CATEGORY_ICON_OPTIONS.includes(value) ? value : null;
  }

  function _catIconLabel(value) {
    return ''; // Flat emoji array — no text labels needed
  }

  function _categoryIconPickerHtml(selected) {
    _selectedCatIcon = selected || CATEGORY_ICON_OPTIONS[2];

    const buttons = CATEGORY_ICON_OPTIONS.map(icon => `
      <button type="button"
        class="cat-icon-option${icon === _selectedCatIcon ? ' selected' : ''}"
        data-icon="${_esc(icon)}"
        onclick="App.Notes._setCatIcon(this.dataset.icon)">
        <span class="cat-icon-picture">${_iconHtml(icon)}</span>
      </button>`).join('');

    return `
      <input id="cat-icon" type="hidden" value="${_esc(_selectedCatIcon)}">
      <div class="cat-icon-selected">
        <div id="cat-icon-selected-preview" class="cat-icon-selected-preview">${_iconHtml(_selectedCatIcon)}</div>
        <div>
          <div class="cat-icon-selected-label">${App.I18n.t('cat_icon_selected')}</div>
        </div>
      </div>
      <div class="cat-icon-picker">
        <div id="cat-icon-grid" class="cat-icon-grid">${buttons}</div>
      </div>`;
  }

  function _setCatIcon(icon) {
    _selectedCatIcon = icon || CATEGORY_ICON_OPTIONS[2];
    const hidden = document.getElementById('cat-icon');
    if (hidden) hidden.value = _selectedCatIcon;
    document.querySelectorAll('#cat-icon-grid .cat-icon-option').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.icon === _selectedCatIcon);
    });
    const preview = document.getElementById('cat-icon-selected-preview');
    if (preview) preview.innerHTML = _iconHtml(_selectedCatIcon);
    // After icon tap: scroll name input into view and focus it
    requestAnimationFrame(() => {
      setTimeout(() => {
        const nameInput = document.getElementById('cat-name');
        if (nameInput) {
          nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          nameInput.focus();
        }
      }, 150);
    });
  }

  // No-op: search input removed from emoji-only grid
  function _filterCatIcons(query) {}

  // No-op: custom emoji input removed
  function _applyCustomCatEmoji() {}

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
        <div class="empty-state-icon"><span class="icon-wrap icon-wrap-lg"><img src="./icons/ic_nav_notes.png" class="icon-img-lg" alt=""></span></div>
        <div class="empty-state-text">${App.I18n.t('categories')}</div>
        <div class="empty-state-sub">${App.I18n.t('tap_plus')}</div>
      </div>`;
    }
    const cards = state.categories.map(cat => {
      const count = state.notes.filter(n => n.categoryId === cat.id).length;
      return `<div class="category-card" onclick="App.Notes._viewCat('${cat.id}')">
        <div class="category-card-top">
          <div class="category-icon-wrap">${_iconHtml(cat.icon)}</div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="card-delete-btn"
              onclick="event.stopPropagation();App.Notes._editCat('${cat.id}')" title="Edit">&#x270E;</button>
            <button class="card-delete-btn"
              onclick="event.stopPropagation();App.Notes._deleteCat('${cat.id}')" title="Delete">&times;</button>
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

    return `<div class="note-card" data-color="${_esc(note.color || 'yellow')}" onclick="App.Notes._editNote('${note.id}')">
      <div class="note-card-header">
        <div class="note-card-title">${_esc(title)}</div>
        <button class="card-delete-btn"
          onclick="event.stopPropagation();App.Notes._deleteNote('${note.id}')" title="Delete">&times;</button>
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
          <button class="bell-btn${note.reminderAt ? ' has-reminder' : ''}"
            title="Set reminder"
            onclick="event.stopPropagation();App.Reminders.openPickerForNote('${note.id}')">&#x23F0;</button>
        </div>
      </div>
      ${note.address ? `<div style="font-size:var(--text-xs);color:rgba(0,0,0,.5);margin-top:4px">${_esc(note.locationName || note.address)}</div>` : ''}
    </div>`;
  }

  // ── Notes Grid View ───────────────────────────────────────────────
  function buildNotesGrid(state) {
    let notes = state.notes;
    if (_filterCatId) notes = notes.filter(n => n.categoryId === _filterCatId);

    if (_filterStatus === 'archived') {
      notes = notes.filter(n => n.archived);
    } else if (_filterStatus === 'completed') {
      notes = notes.filter(n => n.completed && !n.archived);
    } else {
      notes = notes.filter(n => !n.archived && !n.completed && n.status === _filterStatus);
    }

    if (_dateFilter) {
      notes = notes.filter(n => n.dueDate && n.dueDate.slice(0,10) === _dateFilter);
    }

    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body  || '').toLowerCase().includes(q)
      );
    }

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
        <div class="empty-state-icon"><span class="icon-wrap icon-wrap-lg"><img src="./icons/ic_nav_notes.png" class="icon-img-lg" alt=""></span></div>
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

    const chevronSvg = '<svg class="section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    const html = `
      <div id="note-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_note') : App.I18n.t('add_note')}</div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_title')}</label>
            <input id="note-title" class="form-input" autocomplete="off" autocorrect="off" placeholder="${App.I18n.t('note_title_ph')}" value="${_esc(n.title)}">
          </div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_body')}</label>
            <textarea id="note-body" class="form-textarea" autocomplete="off" autocorrect="off" placeholder="${App.I18n.t('note_body_ph')}">${_esc(n.body)}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${App.I18n.t('note_priority')}</label>
              <select id="note-priority" class="form-select">${priorityOpts}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="note-status" class="form-select">${statusOpts}</select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="note-cat" class="form-select">
              <option value="">— none —</option>
              ${catOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_color')}</label>
            <div class="color-row" id="color-row">${colorRow}</div>
          </div>

          <div style="margin-bottom:var(--space-md)">
            <button class="section-toggle" data-section="due" aria-expanded="false"
              onclick="App.Notes._toggleSection('due')">
              <span class="section-toggle-label">Due Date &amp; Reminder</span>
              ${chevronSvg}
            </button>
            <div id="section-content-due" class="section-toggle-content" hidden style="padding-top:var(--space-sm)">
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
                <select id="note-reminder" class="form-select" onchange="App.Notes._toggleCustomReminder()">
                  <option value="">— none —</option>
                  <option value="same_day"${n.reminder==='same_day'?' selected':''}>Same day (8am)</option>
                  <option value="day_before"${n.reminder==='day_before'?' selected':''}>Day before</option>
                  <option value="1h_before"${n.reminder==='1h_before'?' selected':''}>1 hour before</option>
                  <option value="2h_before"${n.reminder==='2h_before'?' selected':''}>2 hours before</option>
                  <option value="custom"${n.reminderAt && !n.reminder ? ' selected' : ''}>Custom…</option>
                </select>
              </div>
              <div id="note-reminder-custom" style="display:${n.reminderAt && !n.reminder ? '' : 'none'};padding-top:var(--space-sm)">
                <div class="form-row">
                  <div class="form-group" style="flex:1">
                    <label class="form-label">${App.I18n.t('note_due')}</label>
                    <input type="date" id="note-reminder-custom-date" class="form-input"
                      value="${_esc(n.reminderAt ? n.reminderAt.slice(0,10) : '')}">
                  </div>
                  <div class="form-group" style="flex:1">
                    <label class="form-label">${App.I18n.t('note_due_time')}</label>
                    <input type="time" id="note-reminder-custom-time" class="form-input"
                      value="${_esc(n.reminderAt ? n.reminderAt.slice(11,16) : '08:00')}">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-bottom:var(--space-md)">
            <button class="section-toggle" data-section="appt" aria-expanded="false"
              onclick="App.Notes._toggleSection('appt')">
              <span class="section-toggle-label">Appointment &amp; Location</span>
              ${chevronSvg}
            </button>
            <div id="section-content-appt" class="section-toggle-content" hidden style="padding-top:var(--space-sm)">
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_appt')}</label>
                <input id="note-appt-name" class="form-input" autocomplete="off" autocorrect="off" placeholder="Appointment name…" value="${_esc(n.appointmentName)}">
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
                <input id="note-location" class="form-input" autocomplete="off" autocorrect="off" placeholder="Location name…" value="${_esc(n.locationName)}">
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_address')}</label>
                <input id="note-address" class="form-input" autocomplete="off" autocorrect="off" placeholder="Full address…" value="${_esc(n.address)}">
              </div>
              ${mapsBlock}
            </div>
          </div>

          <div class="modal-actions">
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
            <button id="note-save-btn" class="btn btn-primary" onclick="App.Notes._saveNote('${isEdit ? n.id : ''}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    // Scroll sheet to top before focusing so iOS keyboard adjustment starts from the top
    const _sheet = document.querySelector('#note-modal .modal-sheet');
    if (_sheet) _sheet.scrollTop = 0;
    requestAnimationFrame(() => setTimeout(() => {
      const _t = document.getElementById('note-title');
      if (_t) { _t.scrollIntoView({ block: 'start', behavior: 'instant' }); _t.focus(); }
    }, 50));
    _selectedNoteColor = n.color || 'yellow';
  }

  let _selectedNoteColor = 'yellow';
  let _saving = false;

  function _pickColor(c) {
    _selectedNoteColor = c;
    document.querySelectorAll('#color-row .color-swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.color === c);
    });
  }

  function _noteReminderTime(note) {
    if (!note || note.completed || note.archived) return null;
    // Direct ISO reminder takes precedence
    if (note.reminderAt) {
      const t = new Date(note.reminderAt).getTime();
      return isNaN(t) ? null : t;
    }
    // Preset reminder tied to dueDate
    if (note.dueDate && note.reminder && note.reminder !== 'none') {
      const [y, m, d] = note.dueDate.split('-').map(Number);
      if (!y || !m || !d) return null;
      if (note.reminder === 'same_day')   return new Date(y, m - 1, d,     8, 0, 0).getTime();
      if (note.reminder === 'day_before') return new Date(y, m - 1, d - 1, 8, 0, 0).getTime();
      if (note.dueTime && (note.reminder === '1h_before' || note.reminder === '2h_before')) {
        const [hh, mm] = note.dueTime.split(':').map(Number);
        if (Number.isFinite(hh) && Number.isFinite(mm)) {
          const base = new Date(y, m - 1, d, hh, mm, 0).getTime();
          return base - (note.reminder === '1h_before' ? 3600000 : 7200000);
        }
      }
      return new Date(y, m - 1, d, 8, 0, 0).getTime();
    }
    // dueDate+dueTime only (no reminder or reminder === 'none') — fire at exact due time
    if (note.dueDate && note.dueTime && (!note.reminder || note.reminder === 'none' || note.reminder === '')) {
      const t = new Date(note.dueDate + 'T' + note.dueTime).getTime();
      return isNaN(t) ? null : t;
    }
    return null;
  }

  function _syncNotePushReminder(note) {
    if (!note || !note.id) return;
    const fireMs = _noteReminderTime(note);
    if (fireMs) {
      let body = note.body || '';
      // For dueDate+dueTime-only path, use "Due now:" body
      if (!note.reminderAt && note.dueDate && note.dueTime &&
          (!note.reminder || note.reminder === 'none' || note.reminder === '')) {
        body = `Due now: ${note.title || 'Note'}`;
      }
      App.Push?.syncReminder?.(
        'note',
        note.id,
        note.title || 'Reminder',
        body,
        Math.floor(fireMs / 1000)
      );
    } else {
      App.Push?.clearReminder?.('note', note.id);
    }
  }

  function _clearNotePushReminder(id) {
    if (id) App.Push?.clearReminder?.('note', id);
  }

  function _saveNote(id) {
    if (_saving) return;
    _saving = true;
    const saveBtn = document.getElementById('note-save-btn');
    if (saveBtn) saveBtn.disabled = true;

    try {
      const title    = document.getElementById('note-title')?.value.trim() || '';
      const body     = document.getElementById('note-body')?.value.trim()  || '';
      const priority = document.getElementById('note-priority')?.value || 'medium';
      const status   = document.getElementById('note-status')?.value   || 'active';
      const catId    = document.getElementById('note-cat')?.value       || null;
      const dueDate  = document.getElementById('note-due')?.value       || '';
      const dueTime  = document.getElementById('note-due-time')?.value  || '';
      let reminder = document.getElementById('note-reminder')?.value  || '';
      let reminderAt = '';
      if (reminder === 'custom') {
        const cd = document.getElementById('note-reminder-custom-date')?.value || '';
        const ct = document.getElementById('note-reminder-custom-time')?.value || '08:00';
        if (cd) { reminderAt = `${cd}T${ct}:00`; reminder = ''; }
        else { reminder = ''; reminderAt = ''; }
      } else {
        reminderAt = '';
      }
      const apptName = document.getElementById('note-appt-name')?.value || '';
      const apptDt   = document.getElementById('note-appt-dt')?.value   || '';
      const leaveBy  = document.getElementById('note-leave')?.value     || '';
      const locName  = document.getElementById('note-location')?.value  || '';
      const address  = document.getElementById('note-address')?.value   || '';

      if (!title && !body) { App.showToast(App.I18n.t('toast_enter_title'), 'error'); return; }

      const patch = {
        title, body, priority, status, color: _selectedNoteColor,
        categoryId: catId || null,
        dueDate, dueTime, reminder, reminderAt, appointmentName: apptName,
        appointmentDatetime: apptDt, leaveBy, locationName: locName, address,
      };

      // Minimum lead-time check: block only when the reminder time changed
      // and lands closer than the worker's check window. Unrelated edits pass.
      const fireMs = _noteReminderTime({ dueDate, dueTime, reminder, reminderAt });
      if (fireMs) {
        let reminderChanged = true;
        if (id) {
          const prev = (App.Storage.getState().notes || []).find(n => n.id === id);
          if (prev) {
            reminderChanged = (prev.dueDate || '') !== dueDate
              || (prev.dueTime || '') !== dueTime
              || (prev.reminder || '') !== reminder
              || (prev.reminderAt || '') !== reminderAt;
          }
        }
        if (reminderChanged && (fireMs - Date.now() < MIN_REMINDER_LEAD_MINUTES * 60000)) {
          App.showToast(App.I18n.t('toast_reminder_lead').replace('{min}', String(MIN_REMINDER_LEAD_MINUTES)), 'error');
          return; // form stays open, entered values intact (finally re-enables Save)
        }
      }

      let savedNote = null;
      if (id) {
        savedNote = App.Storage.updateNote(id, patch);
        App.showToast(App.I18n.t('toast_note_updated'), 'success');
      } else {
        savedNote = App.Storage.addNote(patch);
        App.showToast(App.I18n.t('toast_note_saved'), 'success');
      }
      _syncNotePushReminder(savedNote);
      _closeModal();
      render();
      if (document.getElementById('reminders-wrap')) App.Dashboard.render();
    } finally {
      _saving = false;
      if (saveBtn && document.contains(saveBtn)) saveBtn.disabled = false;
    }
  }

  function _toggleCustomReminder() {
    const sel = document.getElementById('note-reminder');
    const box = document.getElementById('note-reminder-custom');
    if (box) box.style.display = (sel && sel.value === 'custom') ? '' : 'none';
  }

  function _toggleSection(name) {
    const btn = document.querySelector(`.section-toggle[data-section="${name}"]`);
    const content = document.getElementById(`section-content-${name}`);
    if (!btn || !content) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    content.hidden = expanded;
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
    _clearNotePushReminder(id);
    App.Storage.deleteNote(id);
    if (fromModal) _closeModal();
    App.showToast(App.I18n.t('toast_note_deleted'), 'success');
    render();
  }

  function _completeNote(id) {
    App.Storage.updateNote(id, { completed: true, status: 'completed', reminder: '', reminderAt: '' });
    _clearNotePushReminder(id);
    _closeModal();
    App.showToast(App.I18n.t('toast_note_completed'), 'success');
    render();
  }

  function _archiveNote(id) {
    App.Storage.updateNote(id, { archived: true, reminder: '', reminderAt: '' });
    _clearNotePushReminder(id);
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
    _editingNoteId = null;
    _editingCatId  = null;
  }

  // ── Category Modal ────────────────────────────────────────────────
  function _openCatModal(cat) {
    const isEdit = !!cat;
    const c = cat || { name: '', icon: CATEGORY_ICON_OPTIONS[2], color: '#F7F0B6' };

    const html = `
      <div id="cat-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet cat-modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_category') : App.I18n.t('add_category')}</div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_icon')}</label>
            ${_categoryIconPickerHtml(c.icon)}
          </div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_name')}</label>
            <input id="cat-name" class="form-input" autocomplete="off" autocorrect="off" placeholder="Category name…" value="${_esc(c.name)}">
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Notes._saveCat('${isEdit?c.id:''}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    // No autofocus on open — focus comes after icon selection
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
    const icon = document.getElementById('cat-icon')?.value.trim() || CATEGORY_ICON_OPTIONS[2];
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
    } else {
      if (!confirm('Delete this category?')) return;
      App.Storage.deleteCategory(id, false);
      App.showToast(App.I18n.t('toast_cat_deleted'), 'success');
      render();
    }
  }

  function _confirmDeleteCat(id, deleteNotes) {
    if (deleteNotes) {
      App.Storage.getState().notes
        .filter(n => n.categoryId === id)
        .forEach(n => _clearNotePushReminder(n.id));
    }
    App.Storage.deleteCategory(id, deleteNotes);
    App.showToast(App.I18n.t('toast_cat_deleted'), 'success');
    _closeModal();
    render();
  }

  // ── FAB handler (called by app.js) ──────────────────────────────
  function onFab() {
    if (_view === 'categories') {
      _openCatModal(null);
    } else {
      _openNoteModal(null);
    }
  }

  // ── Date filter (called from calendar date tap) ──────────────────
  function filterByDate(dateStr) {
    _dateFilter = dateStr || null;
    _view = 'notes';
    render();
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
    _openNoteModal, _closeModal, _saveNote, _pickColor, _toggleSection, _noteReminderTime,
    _editCat, _saveCat, _deleteCat, _confirmDeleteCat, _toggleCustomReminder,
    _setCatIcon, _filterCatIcons, _applyCustomCatEmoji,
    _openAppleMaps, _openGoogleMaps, _copyAddress,
  };

})(window.App = window.App || {});
