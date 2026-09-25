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

  let _view = 'notes'; // Ministry-style note list is the primary Notes experience
  let _filterCatId = null;
  let _filterStatus = 'today';
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

  // ── Ministry-style schedule tabs ─────────────────────────────────
  function _L(en, es) {
    return App.I18n.current() === 'es' ? es : en;
  }

  function _scheduleBucket(note) {
    if (note.completed || note.status === 'completed') return 'completed';
    const due = (note.dueDate || '').slice(0, 10);
    if (!due) return 'nodate';
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayKey = `${y}-${m}-${d}`;
    if (due < todayKey) return 'overdue';
    if (due === todayKey) return 'today';
    return 'upcoming';
  }

  function buildStatusTabs(state) {
    const notes = (state?.notes || []).filter(n => !n.archived);
    const overdueCount = notes.filter(n => _scheduleBucket(n) === 'overdue').length;
    const tabs = [
      ['today', 'fa-calendar-day', _L('Today','Hoy')],
      ['upcoming', 'fa-clock', _L('Upcoming','Próximos')],
      ['overdue', 'fa-triangle-exclamation', _L('Overdue','Atrasados')],
      ['all', 'fa-layer-group', _L('All','Todos')],
    ];
    return `<div class="ministry-filter-tabs" role="tablist">
      ${tabs.map(([key, icon, label]) => `
        <button class="ministry-filter-tab${_filterStatus === key ? ' active' : ''}"
          type="button" onclick="App.Notes._setStatus('${key}')">
          <i class="fa-solid ${icon}"></i>
          <span>${label}</span>
          ${key === 'overdue' && overdueCount ? `<b>${overdueCount}</b>` : ''}
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
      return `<div class="category-card" style="--paper:${_esc(cat.color||'#F6E67C')}" onclick="App.Notes._viewCat('${cat.id}')">
        <button class="cat-edit-btn" title="Edit"
          onclick="event.stopPropagation();App.Notes._editCat('${cat.id}')">&#x270E;</button>
        <div class="category-icon-wrap">${_iconHtml(cat.icon)}</div>
        <div class="category-name">${_esc(cat.name)}</div>
        <div class="category-count">${count} ${App.I18n.t('notes')}</div>
        <button class="cat-add-btn" title="Add note"
          onclick="event.stopPropagation();App.Notes._openNoteModal(null,'${cat.id}')">+</button>
      </div>`;
    }).join('');
    return `<div class="category-grid">${cards}</div>`;
  }

  // ── Ministry-style Note Cards ─────────────────────────────────────
  function _formatNoteDate(dateStr, short = false) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat(App.I18n.current() === 'es' ? 'es-US' : 'en-US',
      short ? { month:'short', day:'numeric' } : { month:'short', day:'numeric', year:'numeric' }
    ).format(date);
  }

  function _formatNoteTime(timeStr) {
    if (!/^\d{2}:\d{2}$/.test(timeStr || '')) return '';
    const [h,m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h,m,0,0);
    return new Intl.DateTimeFormat(App.I18n.current() === 'es' ? 'es-US' : 'en-US',
      { hour:'numeric', minute:'2-digit' }).format(d);
  }

  function _noteBadge(note) {
    const bucket = _scheduleBucket(note);
    if (bucket === 'today') return `<span class="ministry-note-badge today">${_L('Today','Hoy')}</span>`;
    if (bucket === 'overdue') return `<span class="ministry-note-badge overdue">${_L('Overdue','Atrasado')}</span>`;
    if (bucket === 'upcoming') return `<span class="ministry-note-badge">${_esc(_formatNoteDate(note.dueDate, true))}</span>`;
    if (bucket === 'completed') return `<span class="ministry-note-badge completed">${_L('Done','Hecho')}</span>`;
    return `<span class="ministry-note-badge">${_L('No date','Sin fecha')}</span>`;
  }

  function _hasExplicitReminder(note) {
    return !!(note.reminderAt || (note.reminder && note.reminder !== 'none'));
  }

  function buildNoteCard(note) {
    const bucket = _scheduleBucket(note);
    let when = '';
    if (bucket === 'overdue' && note.dueDate) {
      when = `<span class="ministry-note-overdue-when"><i class="fa-regular fa-calendar"></i> ${_esc(_L('Due ','Venció ') + _formatNoteDate(note.dueDate, true) + (note.dueTime ? ' · ' + _formatNoteTime(note.dueTime) : ''))}</span>`;
    } else if (note.dueTime) {
      when = `<span><i class="fa-regular fa-clock"></i> ${_esc(_formatNoteTime(note.dueTime))}</span>`;
    }
    const title = note.title || (note.body || '').slice(0, 60) || _L('Untitled note','Nota sin título');
    return `<button class="ministry-note-card${bucket === 'overdue' ? ' overdue' : ''}" data-color="${_esc(note.color || 'yellow')}"
      type="button" onclick="App.Notes._openNoteDetail('${note.id}')">
      <div class="ministry-note-main">
        <div class="ministry-note-title">${_esc(title)}</div>
        <div class="ministry-note-meta">
          ${_noteBadge(note)}
          ${when}
          ${_hasExplicitReminder(note) ? '<span title="Reminder"><i class="fa-solid fa-bell"></i></span>' : ''}
        </div>
      </div>
      <i class="fa-solid fa-chevron-right ministry-note-chevron"></i>
    </button>`;
  }

  function _sortNotes(notes) {
    const order = { overdue:0, today:1, upcoming:2, nodate:3, completed:4 };
    return [...notes].sort((a,b) => {
      const ao = order[_scheduleBucket(a)] ?? 3;
      const bo = order[_scheduleBucket(b)] ?? 3;
      if (ao !== bo) return ao - bo;
      if ((a.dueDate || '') !== (b.dueDate || '')) return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      if ((a.dueTime || '') !== (b.dueTime || '')) return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
      return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
    });
  }

  function buildNotesGrid(state) {
    let notes = (state.notes || []).filter(n => !n.archived);

    if (_dateFilter) {
      notes = notes.filter(n => (n.dueDate || '').slice(0,10) === _dateFilter);
    }

    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q)
      );
    }

    notes = _sortNotes(notes);

    const searchBar = `
      <div class="search-bar-wrap ministry-note-search">
        <input id="notes-search" class="form-input" type="search"
          placeholder="${App.I18n.t('notes_search')}"
          value="${_esc(_searchQuery)}"
          oninput="App.Notes._setSearch(this.value)">
      </div>`;

    if (_dateFilter) {
      const filtered = notes.map(buildNoteCard).join('');
      return searchBar + (filtered
        ? `<div class="ministry-note-list">${filtered}</div>`
        : `<div class="ministry-note-empty">${_L('Nothing scheduled for this date.','No hay nada programado para esta fecha.')}</div>`);
    }

    if (_filterStatus === 'today') {
      const todayNotes = notes.filter(n => _scheduleBucket(n) === 'today');
      const overdueNotes = notes.filter(n => _scheduleBucket(n) === 'overdue');
      let html = todayNotes.length
        ? todayNotes.map(buildNoteCard).join('')
        : `<div class="ministry-note-empty today"><i class="fa-regular fa-circle-check"></i> ${_L('Nothing else scheduled for today.','No hay nada más programado para hoy.')}</div>`;
      if (overdueNotes.length) {
        html += `<div class="ministry-needs-attention">
          <div class="ministry-needs-attention-head">
            <span><i class="fa-solid fa-triangle-exclamation"></i> ${_L('Needs Attention','Necesita atención')}</span>
            <small>${_L('Overdue notes stay here until you handle them.','Las notas atrasadas permanecen aquí hasta que las atiendas.')}</small>
          </div>
          ${overdueNotes.map(buildNoteCard).join('')}
        </div>`;
      }
      return searchBar + `<div class="ministry-note-list">${html}</div>`;
    }

    const visible = _filterStatus === 'all'
      ? notes
      : notes.filter(n => _scheduleBucket(n) === _filterStatus);

    if (!visible.length) {
      return searchBar + `<div class="ministry-note-empty">${_L('Nothing here yet.','Todavía no hay nada aquí.')}</div>`;
    }
    return searchBar + `<div class="ministry-note-list">${visible.map(buildNoteCard).join('')}</div>`;
  }

  // ── Main Render ───────────────────────────────────────────────────
  function render() {
    const el = document.getElementById('pane-notes');
    if (!el) return;
    const state = App.Storage.getState();
    _view = 'notes';

    el.innerHTML = `
      <div class="ministry-notes-shell">
        <div class="ministry-notes-heading">
          <div>
            <div class="section-title">${_L('Notes','Notas')}</div>
            <p>${_L('Simple notes and reminders. The note body stays hidden until you open the card.','Notas y recordatorios simples. El contenido queda oculto hasta que abras la tarjeta.')}</p>
          </div>
          <button class="btn btn-primary ministry-add-note" type="button" onclick="App.Notes._openNoteModal(null)">
            <i class="fa-solid fa-plus"></i> ${_L('Add Note','Añadir nota')}
          </button>
        </div>
        ${buildStatusTabs(state)}
        ${buildNotesGrid(state)}
      </div>`;
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
  function _openNoteModal(note, presetCat) {
    const state = App.Storage.getState();
    const isEdit = !!note;
    const n = note || {
      title: '', body: '', color: 'yellow', categoryId: presetCat || null,
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
      const _fireDelivery = computeDeliveryTime(new Date(fireMs));
      const _fireEpoch    = _fireDelivery ? Math.floor(_fireDelivery.getTime() / 1000) : Math.floor(fireMs / 1000);
      App.Push?.syncReminder?.(
        'note',
        note.id,
        note.title || 'Reminder',
        body,
        _fireEpoch
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
        if (reminderChanged) {
          const _deliveryDate = computeDeliveryTime(new Date(fireMs));
          const _deliveryMs   = _deliveryDate ? _deliveryDate.getTime() : fireMs;
          if (_deliveryMs - Date.now() < MIN_REMINDER_LEAD_MINUTES * 60000) {
            App.showToast(App.I18n.t('toast_reminder_lead').replace('{min}', String(MIN_REMINDER_LEAD_MINUTES)), 'error');
            return; // form stays open, entered values intact (finally re-enables Save)
          }
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
      // Sweep-aware delivery hint
      if (fireMs) {
        const _hintDate = computeDeliveryTime(new Date(fireMs));
        if (_hintDate) {
          const _hintTime = _hintDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          App.showToast(`⏰ Delivers around ${_hintTime}`, 'success');
        }
      }
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

  function _openNoteDetail(id) {
    const state = App.Storage.getState();
    const note = (state.notes || []).find(n => n.id === id);
    if (!note) return;
    _closeModal();

    const title = note.title || (note.body || '').slice(0,60) || _L('Untitled note','Nota sin título');
    const schedule = note.dueDate
      ? [_formatNoteDate(note.dueDate), note.dueTime ? _formatNoteTime(note.dueTime) : ''].filter(Boolean).join(' · ')
      : _L('No reminder date','Sin fecha de recordatorio');
    const reminderLabel = _hasExplicitReminder(note) ? _L('Reminder on','Aviso activo') : _L('Set Reminder','Poner aviso');
    const completedLabel = note.completed || note.status === 'completed' ? _L('Reopen','Reabrir') : _L('Complete','Completar');
    const location = note.locationName || note.address || '';

    const html = `
      <div id="note-detail-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet ministry-note-detail-sheet">
          <div class="modal-handle"></div>
          <div class="ministry-note-detail-head">
            <div>
              <div class="modal-title">${_esc(title)}</div>
              <div class="ministry-note-detail-schedule">${_esc(schedule)}</div>
            </div>
            <button class="ministry-note-close" type="button" onclick="App.Notes._closeModal()" aria-label="Close">&times;</button>
          </div>
          ${location ? `<div class="ministry-note-detail-location"><i class="fa-solid fa-location-dot"></i> ${_esc(location)}</div>` : ''}
          <div class="ministry-note-detail-body">${_esc(note.body || _L('No details.','Sin detalles.'))}</div>
          <div class="ministry-note-detail-actions">
            <button class="btn btn-secondary" onclick="App.Notes._addNoteToCalendar('${note.id}')"><i class="fa-solid fa-calendar-plus"></i><span>${_L('Calendar','Calendario')}</span></button>
            <button class="btn btn-secondary" onclick="App.Notes._setNoteReminder('${note.id}')"><i class="fa-solid fa-bell"></i><span>${reminderLabel}</span></button>
            <button class="btn btn-secondary" onclick="App.Notes.${note.completed || note.status === 'completed' ? '_reopenNote' : '_completeNote'}('${note.id}')"><i class="fa-solid fa-check"></i><span>${completedLabel}</span></button>
            <button class="btn btn-secondary" onclick="App.Notes._editNote('${note.id}')"><i class="fa-solid fa-pen"></i><span>${_L('Edit','Editar')}</span></button>
            <button class="btn btn-secondary ministry-note-danger" onclick="App.Notes._deleteNote('${note.id}',true)"><i class="fa-solid fa-trash"></i><span>${_L('Delete','Eliminar')}</span></button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function _setNoteReminder(id) {
    if (App.Reminders?.openPickerForNote) {
      _closeModal();
      App.Reminders.openPickerForNote(id);
      return;
    }
    _editNote(id);
  }

  function _icsEscape(value) {
    return String(value || '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  }

  function _addNoteToCalendar(id) {
    const note = (App.Storage.getState().notes || []).find(n => n.id === id);
    if (!note || !note.dueDate) {
      App.showToast(_L('Set a date first.','Primero fija una fecha.'), 'error');
      return;
    }
    const compactDate = note.dueDate.replace(/-/g,'');
    let dtStart = `DTSTART;VALUE=DATE:${compactDate}`;
    let dtEnd = '';
    if (note.dueTime) {
      dtStart = `DTSTART:${compactDate}T${note.dueTime.replace(':','')}00`;
    } else {
      const d = new Date(note.dueDate + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      const end = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      dtEnd = `\r\nDTEND;VALUE=DATE:${end}`;
    }
    const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Note Clip//EN','BEGIN:VEVENT',
      `UID:noteclip-${note.id}@local`, `DTSTAMP:${stamp}`, dtStart + dtEnd,
      `SUMMARY:${_icsEscape(note.title || _L('Note','Nota'))}`,
      `DESCRIPTION:${_icsEscape(note.body || '')}`,
      note.address ? `LOCATION:${_icsEscape(note.address)}` : '',
      'END:VEVENT','END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    const blob = new Blob([ics], { type:'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note-clip-event.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function _editNote(id) {
    const state = App.Storage.getState();
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    _closeModal();
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
    document.getElementById('note-detail-modal')?.remove();
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
          ${isEdit ? `<button class="btn btn-danger w-full" style="margin-top:var(--space-sm)"
            onclick="App.Notes._closeModal();App.Notes._deleteCat('${c.id}')">${App.I18n.t('delete_category')}</button>` : ''}
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
    _openNoteModal(null);
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
    _openNoteDetail, _editNote, _deleteNote, _completeNote, _archiveNote, _restoreNote, _reopenNote,
    _openNoteModal, _closeModal, _saveNote, _pickColor, _toggleSection, _noteReminderTime,
    _setNoteReminder, _addNoteToCalendar,
    _editCat, _saveCat, _deleteCat, _confirmDeleteCat, _toggleCustomReminder,
    _setCatIcon, _filterCatIcons, _applyCustomCatEmoji,
    _openAppleMaps, _openGoogleMaps, _copyAddress,
  };

})(window.App = window.App || {});
