/**
 * app.js — Note Clip PWA
 * Tab router, SW registration, global helpers (showToast, applyTheme, refreshCurrentTab).
 * Load LAST — all feature modules must be loaded first.
 */
(function (App) {
  'use strict';

  const TABS = ['dashboard','notes','lists','calendar','communication','settings'];
  let _activeTab = 'dashboard';

  function removeSharedTabChrome() {
    document.querySelectorAll('[data-tab="shared"]').forEach(el => el.remove());
    document.getElementById('pane-shared')?.remove();
  }

  function enhanceLightModeNavIcons() {
    if (document.getElementById('noteclip-light-nav-contrast')) return;
    const style = document.createElement('style');
    style.id = 'noteclip-light-nav-contrast';
    style.textContent = `
      html:not([data-theme="dark"]) .bottom-nav {
        background: color-mix(in srgb, var(--color-surface, #fff8ec) 88%, #c18a18 12%);
        border-top-color: rgba(118, 82, 22, .2);
        box-shadow: 0 -10px 24px rgba(103, 73, 26, .14), inset 0 1px 0 rgba(255,255,255,.72);
      }

      html:not([data-theme="dark"]) .nav-tab {
        color: #5b4016;
        font-weight: 800;
        text-shadow: 0 1px 0 rgba(255,255,255,.8);
      }

      html:not([data-theme="dark"]) .nav-tab > span[data-i18n] {
        color: #5b4016;
      }

      html:not([data-theme="dark"]) .nav-stationery {
        --icon-paper: #ffe28a;
        --icon-paper-2: #e7bd46;
        --icon-paper-line: rgba(80, 54, 12, .3);
        --icon-ink: #30220b;
        opacity: .98;
        filter: saturate(1.18) contrast(1.08) drop-shadow(0 5px 6px rgba(90, 61, 14, .28));
      }

      html:not([data-theme="dark"]) .nav-glyph {
        border-color: rgba(83, 57, 12, .28);
        box-shadow:
          inset 1px 1px 0 rgba(255,255,255,.68),
          inset -1px -1px 0 rgba(108, 73, 14, .18),
          0 6px 9px rgba(93, 64, 16, .22);
      }

      html:not([data-theme="dark"]) .nav-tab.active {
        color: #3b2708;
      }

      html:not([data-theme="dark"]) .nav-tab.active > span[data-i18n] {
        color: #3b2708;
      }

      html:not([data-theme="dark"]) .nav-tab.active .nav-stationery {
        --icon-paper: #ffd45c;
        --icon-paper-2: #c98d15;
        --icon-paper-line: rgba(60, 38, 4, .35);
        --icon-ink: #201503;
        opacity: 1;
        transform: translateY(-3px) rotate(-5deg) skewY(-2deg);
        filter: saturate(1.34) contrast(1.14) drop-shadow(0 8px 8px rgba(105, 69, 10, .34));
      }

      html:not([data-theme="dark"]) .nav-tab.active .nav-glyph {
        outline: 1px solid rgba(133, 85, 5, .28);
        box-shadow:
          0 0 0 3px rgba(213, 161, 39, .18),
          inset 1px 1px 0 rgba(255,255,255,.7),
          inset -1px -1px 0 rgba(85, 55, 8, .22),
          0 8px 12px rgba(102, 66, 10, .28);
      }
    `;
    document.head.appendChild(style);
  }

  // ── Tab routing ──────────────────────────────────────────────────
  function showTab(name) {
    if (name === 'shared') name = 'dashboard';
    if (!TABS.includes(name)) return;
    _activeTab = name;

    // Panes
    TABS.forEach(t => {
      const pane = document.getElementById('pane-' + t);
      if (pane) pane.classList.toggle('active', t === name);
    });

    // Nav tabs
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === name);
    });

    // Render active module
    const renderers = {
      dashboard:     () => App.Dashboard?.render(),
      notes:         () => App.Notes?.render(),
      lists:         () => App.Lists?.render(),
      calendar:      () => App.Calendar?.render(),
      communication: () => App.Communication?.render(),
      settings:      () => App.Settings?.render(),
    };
    renderers[name]?.();
  }

  function refreshCurrentTab() { showTab(_activeTab); }

  // ── FAB routing ──────────────────────────────────────────────────
  function onFab() {
    const handlers = {
      notes:         () => App.Notes?.onFab(),
      lists:         () => App.Lists?.onFab(),
      calendar:      () => App.Notes?._openNoteModal(null),
      dashboard:     () => App.Notes?._openNoteModal(null),
    };
    handlers[_activeTab]?.();
  }

  // ── Toast ────────────────────────────────────────────────────────
  let _toastTimer;
  let _lastFocus = null;
  function showToast(msg, type = '') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast' + (type ? ' ' + type : '');
    // Force reflow
    toast.offsetHeight;
    toast.classList.add('visible');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function shortErrorMessage(value) {
    const raw = value?.message || String(value || 'Unknown app error');
    return raw.length > 140 ? raw.slice(0, 137) + '...' : raw;
  }

  function isOptionalCloudError(value) {
    const raw = value?.message || String(value || '');
    return raw.includes('App.Firebase.init') ||
           raw.includes('Cloud setup is unavailable') ||
           raw.includes('Cloud auth is unavailable');
  }

  function setupGlobalErrorHandlers() {
    if (window.__noteClipErrorHandlersReady) return;
    window.__noteClipErrorHandlersReady = 'true';

    window.addEventListener('error', event => {
      if (event.target && event.target !== window) {
        console.warn('[NoteClip] Resource failed to load:', event.target?.src || event.target?.href || event.target);
        return;
      }
      if (!event.error && event.message === 'Script error.') {
        console.warn('[NoteClip] Generic script error with no details:', event);
        return;
      }
      if (isOptionalCloudError(event.error || event.message)) {
        console.warn('[NoteClip] Optional cloud setup issue:', event.error || event.message, event);
        return;
      }
      console.error('[NoteClip] Window error:', event.error || event.message, event);
      showToast('App error: ' + shortErrorMessage(event.error || event.message), 'error');
    });

    window.addEventListener('unhandledrejection', event => {
      if (isOptionalCloudError(event.reason)) {
        console.warn('[NoteClip] Optional cloud setup rejection:', event.reason, event);
        return;
      }
      console.error('[NoteClip] Unhandled promise rejection:', event.reason, event);
      showToast('App error: ' + shortErrorMessage(event.reason), 'error');
    });
  }

  function enhanceModal(modalOrId) {
    const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
    if (!modal || modal.dataset.a11yReady) return;
    _lastFocus = document.activeElement;
    modal.dataset.a11yReady = 'true';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function restoreFocus() {
    const target = _lastFocus;
    _lastFocus = null;
    if (target && document.contains(target) && typeof target.focus === 'function') {
      setTimeout(() => target.focus(), 0);
    }
  }

  // ── Theme ────────────────────────────────────────────────────────
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme || 'light');
    }
  }

  // ── Note modal i18n guard ────────────────────────────────────────
  function patchNoteModalI18n() {
    if (!App.Notes || App.Notes.__modalI18nPatched) return;

    const originalOnFab = App.Notes.onFab;
    const LOCAL = {
      en: {
        none: '— none —',
        reminder_same_day: 'Same day (8am)',
        reminder_day_before: 'Day before',
        reminder_1h_before: '1 hour before',
        reminder_2h_before: '2 hours before',
        reminder_custom: 'Custom…',
        note_appt_name_ph: 'Appointment name…',
        note_location_name_ph: 'Location name…',
        note_address_ph: 'Full address…',
        reopen: 'Reopen',
        set_reminder: 'Set Reminder',
        confirm_delete_note: 'Delete this note?',
      },
      es: {
        none: '— ninguna —',
        reminder_same_day: 'Mismo día (8 a.m.)',
        reminder_day_before: 'Día anterior',
        reminder_1h_before: '1 hora antes',
        reminder_2h_before: '2 horas antes',
        reminder_custom: 'Personalizado…',
        note_appt_name_ph: 'Nombre de la cita…',
        note_location_name_ph: 'Nombre del lugar…',
        note_address_ph: 'Dirección completa…',
        reopen: 'Reabrir',
        set_reminder: 'Configurar recordatorio',
        confirm_delete_note: '¿Eliminar esta nota?',
      },
    };

    function tx(key) {
      const value = App.I18n?.t?.(key);
      if (value && value !== key) return value;
      const lang = App.I18n?.current?.() === 'es' ? 'es' : 'en';
      return LOCAL[lang]?.[key] || LOCAL.en[key] || key;
    }

    function esc(s) {
      return String(s || '')
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
    }

    function openNoteModal(note) {
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
        `<option value="${esc(c.id)}"${n.categoryId===c.id?' selected':''}>${esc(c.name)}</option>`
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
              <input id="note-title" class="form-input" autocomplete="off" autocorrect="off" placeholder="${App.I18n.t('note_title_ph')}" value="${esc(n.title)}">
            </div>
            <div class="form-group">
              <label class="form-label">${App.I18n.t('note_body')}</label>
              <textarea id="note-body" class="form-textarea" autocomplete="off" autocorrect="off" placeholder="${App.I18n.t('note_body_ph')}">${esc(n.body)}</textarea>
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
                <option value="">${tx('none')}</option>
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
                <span class="section-toggle-label">${App.I18n.t('note_due_reminder')}</span>
                ${chevronSvg}
              </button>
              <div id="section-content-due" class="section-toggle-content" hidden style="padding-top:var(--space-sm)">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">${App.I18n.t('note_due')}</label>
                    <input type="date" id="note-due" class="form-input" value="${esc(n.dueDate)}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">${App.I18n.t('note_due_time')}</label>
                    <input type="time" id="note-due-time" class="form-input" value="${esc(n.dueTime)}">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_reminder')}</label>
                  <select id="note-reminder" class="form-select" onchange="App.Notes._toggleCustomReminder()">
                    <option value="">${tx('none')}</option>
                    <option value="same_day"${n.reminder==='same_day'?' selected':''}>${tx('reminder_same_day')}</option>
                    <option value="day_before"${n.reminder==='day_before'?' selected':''}>${tx('reminder_day_before')}</option>
                    <option value="1h_before"${n.reminder==='1h_before'?' selected':''}>${tx('reminder_1h_before')}</option>
                    <option value="2h_before"${n.reminder==='2h_before'?' selected':''}>${tx('reminder_2h_before')}</option>
                    <option value="custom"${n.reminderAt && !n.reminder ? ' selected' : ''}>${tx('reminder_custom')}</option>
                  </select>
                </div>
                <div id="note-reminder-custom" style="display:${n.reminderAt && !n.reminder ? '' : 'none'};padding-top:var(--space-sm)">
                  <div class="form-row">
                    <div class="form-group" style="flex:1">
                      <label class="form-label">${App.I18n.t('note_due')}</label>
                      <input type="date" id="note-reminder-custom-date" class="form-input"
                        value="${esc(n.reminderAt ? n.reminderAt.slice(0,10) : '')}">
                    </div>
                    <div class="form-group" style="flex:1">
                      <label class="form-label">${App.I18n.t('note_due_time')}</label>
                      <input type="time" id="note-reminder-custom-time" class="form-input"
                        value="${esc(n.reminderAt ? n.reminderAt.slice(11,16) : '08:00')}">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-bottom:var(--space-md)">
              <button class="section-toggle" data-section="appt" aria-expanded="false"
                onclick="App.Notes._toggleSection('appt')">
                <span class="section-toggle-label">${App.I18n.t('note_appt_location')}</span>
                ${chevronSvg}
              </button>
              <div id="section-content-appt" class="section-toggle-content" hidden style="padding-top:var(--space-sm)">
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_appt')}</label>
                  <input id="note-appt-name" class="form-input" autocomplete="off" autocorrect="off" placeholder="${tx('note_appt_name_ph')}" value="${esc(n.appointmentName)}">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">${App.I18n.t('note_appt_dt')}</label>
                    <input type="datetime-local" id="note-appt-dt" class="form-input" value="${esc(n.appointmentDatetime)}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">${App.I18n.t('note_leave_by')}</label>
                    <input type="time" id="note-leave" class="form-input" value="${esc(n.leaveBy)}">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_location')}</label>
                  <input id="note-location" class="form-input" autocomplete="off" autocorrect="off" placeholder="${tx('note_location_name_ph')}" value="${esc(n.locationName)}">
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_address')}</label>
                  <input id="note-address" class="form-input" autocomplete="off" autocorrect="off" placeholder="${tx('note_address_ph')}" value="${esc(n.address)}">
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
                  ? `<button class="btn btn-secondary btn-sm" onclick="App.Notes._reopenNote('${n.id}')">↩ ${tx('reopen')}</button>`
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
      enhanceModal('note-modal');
      const sheet = document.querySelector('#note-modal .modal-sheet');
      if (sheet) sheet.scrollTop = 0;
      requestAnimationFrame(() => setTimeout(() => {
        const titleInput = document.getElementById('note-title');
        if (titleInput) { titleInput.scrollIntoView({ block: 'start', behavior: 'instant' }); titleInput.focus(); }
      }, 50));
      App.Notes._pickColor(n.color || 'yellow');
    }

    function editNote(id) {
      const state = App.Storage.getState();
      const note = state.notes.find(n => n.id === id);
      if (!note) return;
      openNoteModal(note);
    }

    function deleteNote(id, fromModal) {
      if (!confirm(tx('confirm_delete_note'))) return;
      App.Push?.clearReminder?.('note', id);
      App.Storage.deleteNote(id);
      if (fromModal) App.Notes._closeModal();
      App.showToast(App.I18n.t('toast_note_deleted'), 'success');
      App.Notes.render();
    }

    function patchedOnFab() {
      const isNotesCategoryView = _activeTab === 'notes' && document.querySelector('#pane-notes.active .category-grid');
      if (isNotesCategoryView && typeof originalOnFab === 'function') {
        originalOnFab();
        return;
      }
      openNoteModal(null);
    }

    Object.assign(App.Notes, {
      _openNoteModal: openNoteModal,
      _editNote: editNote,
      _deleteNote: deleteNote,
      onFab: patchedOnFab,
      __modalI18nPatched: true,
    });
  }

  // ── Category modal source workflow patch ──────────────────────────
  function patchCategoryModalWorkflow() {
    if (!App.Notes || App.Notes.__categoryModalPatched) return;

    const originalOpenCatModal = App.Notes._openCatModal;
    const originalEditCat = App.Notes._editCat;
    const previousOnFab = App.Notes.onFab;

    function esc(s) {
      return String(s || '')
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
    }

    function iconHtml(icon) {
      if (!icon) return '';
      if (String(icon).startsWith('ic_')) {
        return `<img src="./icons/${esc(icon)}.png" class="cat-icon-img" alt="" loading="lazy">`;
      }
      return esc(icon);
    }

    function normalizeCatModal() {
      const modal = document.getElementById('cat-modal');
      const sheet = modal?.querySelector('.cat-modal-sheet');
      if (!sheet) return;

      const formGroups = Array.from(sheet.querySelectorAll(':scope > .form-group'));
      const iconGroup = formGroups.find(group => group.querySelector('#cat-icon'));
      const nameGroup = formGroups.find(group => group.querySelector('#cat-name'));
      const actions = sheet.querySelector(':scope > .modal-actions');

      if (nameGroup && iconGroup && nameGroup.compareDocumentPosition(iconGroup) & Node.DOCUMENT_POSITION_PRECEDING) {
        sheet.insertBefore(nameGroup, iconGroup);
      }

      if (iconGroup) iconGroup.classList.add('cat-icon-form-group');
      if (actions) actions.classList.add('cat-actions');

      const nameInput = document.getElementById('cat-name');
      if (nameInput) {
        nameInput.setAttribute('autocomplete', 'off');
        nameInput.setAttribute('autocorrect', 'off');
      }

      enhanceModal(modal);
      sheet.scrollTop = 0;
    }

    function openCatModal(cat) {
      if (typeof originalOpenCatModal === 'function') {
        originalOpenCatModal(cat);
        normalizeCatModal();
      }
    }

    function setCatIcon(icon) {
      const selected = icon || document.getElementById('cat-icon')?.value || '📊';
      const hidden = document.getElementById('cat-icon');
      if (hidden) hidden.value = selected;

      document.querySelectorAll('#cat-icon-grid .cat-icon-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.icon === selected);
      });

      const preview = document.getElementById('cat-icon-selected-preview');
      if (preview) preview.innerHTML = iconHtml(selected);
    }

    function editCat(id) {
      const state = App.Storage.getState();
      const cat = state.categories.find(c => c.id === id);
      if (!cat) return;
      openCatModal(cat);
    }

    function patchedOnFab() {
      const isNotesCategoryView = _activeTab === 'notes' && document.querySelector('#pane-notes.active .category-grid');
      if (isNotesCategoryView) {
        openCatModal(null);
        return;
      }
      if (typeof previousOnFab === 'function') previousOnFab();
    }

    Object.assign(App.Notes, {
      _openCatModal: openCatModal,
      _setCatIcon: setCatIcon,
      _editCat: typeof originalEditCat === 'function' ? editCat : App.Notes._editCat,
      onFab: patchedOnFab,
      __categoryModalPatched: true,
    });
  }

  // ── Service Worker ───────────────────────────────────────────────
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => {
        console.log('[NoteClip.SW] Registered. Scope:', reg.scope);
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              const notice = document.getElementById('update-notice');
              if (notice) notice.hidden = false;
            }
          });
        });
      })
      .catch(err => console.warn('[NoteClip.SW] Failed:', err));

    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data?.type === 'RELOAD_READY') location.reload();
    });
  }

  function applyUpdate() {
    navigator.serviceWorker.ready.then(reg => {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────
  function setupKeyboard() {
    const updateKeyboardInset = () => {
      const vv = window.visualViewport;
      const inset = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      document.documentElement.style.setProperty('--keyboard-inset', `${Math.round(inset)}px`);
      const vvpH = vv ? Math.round(vv.height) : window.innerHeight;
      document.documentElement.style.setProperty('--vvp-height', `${vvpH}px`);
    };
    updateKeyboardInset();
    window.visualViewport?.addEventListener('resize', updateKeyboardInset);
    window.visualViewport?.addEventListener('scroll', updateKeyboardInset);
    window.addEventListener('orientationchange', () => setTimeout(updateKeyboardInset, 250));
    document.addEventListener('focusin', () => setTimeout(updateKeyboardInset, 80));
    document.addEventListener('focusout', () => setTimeout(updateKeyboardInset, 160));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelector('.modal-backdrop')?.remove();
        restoreFocus();
      }
    });
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init() {
    const state = App.Storage.getState();

    // Apply saved theme
    applyTheme(state.settings.theme || 'light');
    enhanceLightModeNavIcons();

    // Apply saved language
    App.I18n.set(state.settings.language || 'en');
    patchNoteModalI18n();
    patchCategoryModalWorkflow();

    // Remove retired Shared tab before wiring navigation.
    removeSharedTabChrome();

    // Wire nav tabs
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    // Wire FAB
    document.getElementById('fab')?.addEventListener('click', onFab);

    // Wire update banner
    document.getElementById('update-btn')?.addEventListener('click', applyUpdate);

    // Wire EN/ES toggle in header
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        App.Storage.updateSettings({ language: lang });
        App.I18n.set(lang);
        patchNoteModalI18n();
        patchCategoryModalWorkflow();
        refreshCurrentTab();
      });
    });

    // System theme listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const s = App.Storage.getState().settings;
      if (s.theme === 'system') applyTheme('system');
    });

    // Register SW
    registerSW();

    // Setup keyboard
    setupKeyboard();

    // Show initial tab
    showTab('dashboard');
    App.Onboarding?.maybeShow();

    // Init reminder system
    App.Reminders?.init();

    console.log('[NoteClip] App ready.');
  }

  // Expose globals
  Object.assign(App, { showTab, refreshCurrentTab, showToast, applyTheme, onFab, enhanceModal, restoreFocus, applyUpdate });

  setupGlobalErrorHandlers(); // Harden early — catches pre-init module errors

  document.addEventListener('DOMContentLoaded', init);

})(window.App = window.App || {});
