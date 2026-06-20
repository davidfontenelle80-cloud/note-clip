/**
 * reminders.js — Note Clip PWA
 * Layer A: in-app reminder popup.
 * Layer B: browser Notification API.
 * Stage 10D — Part 2.
 */
(function (App) {
  'use strict';

  const NOTIFIED_KEY = 'noteClip_notified';
  const SNOOZED_KEY  = 'noteClip_snoozed';
  let _checkTimer    = null;
  let _popupVisible  = false;

  // ── Persistence helpers ────────────────────────────────────────────
  function _getNotified() {
    try { return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}'); } catch(e) { return {}; }
  }
  function _setNotified(map) {
    try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map)); } catch(e) {}
  }
  function _getSnoozed() {
    try { return JSON.parse(localStorage.getItem(SNOOZED_KEY) || '{}'); } catch(e) { return {}; }
  }
  function _setSnoozed(map) {
    try { localStorage.setItem(SNOOZED_KEY, JSON.stringify(map)); } catch(e) {}
  }

  // ── Reminder timing ────────────────────────────────────────────────
  function _reminderSig(n) {
    return `${n.dueDate||''}_${n.dueTime||''}_${n.reminder||''}_${n.reminderAt||''}`;
  }

  function _reminderTime(n) {
    // Direct ISO reminder takes precedence over preset
    if (n.reminderAt) {
      const t = new Date(n.reminderAt).getTime();
      return isNaN(t) ? null : t;
    }
    if (!n.dueDate || !n.reminder) return null;
    const [y, m, d] = n.dueDate.split('-').map(Number);
    if (n.reminder === 'same_day')  return new Date(y, m-1, d, 8, 0, 0).getTime();
    if (n.reminder === 'day_before') return new Date(y, m-1, d-1, 8, 0, 0).getTime();
    if (n.dueTime && (n.reminder === '1h_before' || n.reminder === '2h_before')) {
      const [hh, mm] = n.dueTime.split(':').map(Number);
      const base = new Date(y, m-1, d, hh, mm, 0).getTime();
      return base - (n.reminder === '1h_before' ? 3600000 : 7200000);
    }
    // Fallback: reminder set but no time — fire at 8am on due date
    return new Date(y, m-1, d, 8, 0, 0).getTime();
  }

  // ── Check which notes need a popup ────────────────────────────────
  function _duePending() {
    const now      = Date.now();
    const notified = _getNotified();
    const snoozed  = _getSnoozed();

    // Notes
    const notesPending = App.Storage.getNotes().filter(n => {
      if (!n.reminderAt && (!n.dueDate || !n.reminder)) return false;
      if (n.completed || n.archived) return false;
      const rt = _reminderTime(n);
      if (!rt || rt > now) return false;
      const sig = _reminderSig(n);
      if (notified[n.id] === sig) return false;
      const snoozeUntil = snoozed[n.id];
      if (snoozeUntil && snoozeUntil > now) return false;
      return true;
    });

    // List items with reminderAt
    const state = App.Storage.getState();
    const listsPending = [];
    state.lists.forEach(list => {
      list.items.forEach(item => {
        if (!item.reminderAt) return;
        const rt = new Date(item.reminderAt).getTime();
        if (isNaN(rt) || rt > now) return;
        const key = list.id + '_' + item.id;
        const sig = 'list_' + item.reminderAt;
        if (notified[key] === sig) return;
        const snoozeUntil = snoozed[key];
        if (snoozeUntil && snoozeUntil > now) return;
        listsPending.push({
          id: key, _listId: list.id, _itemId: item.id,
          title: list.name + ': ' + item.text,
          _sig: sig, _isListItem: true,
        });
      });
    });

    return [...notesPending, ...listsPending];
  }

  // ── In-app popup (Layer A) ─────────────────────────────────────────
  function _removePopup() {
    document.getElementById('reminder-popup-bar')?.remove();
    _popupVisible = false;
  }

  function _showPopup(notes) {
    _removePopup();
    if (!notes.length) return;
    const n = notes[0]; // show one at a time; user dismisses to see next
    const lang = App.I18n.current();
    const more = notes.length > 1 ? `<span class="rem-more">+${notes.length - 1}</span>` : '';

    const bar = document.createElement('div');
    bar.id = 'reminder-popup-bar';
    bar.className = 'reminder-popup-bar';
    bar.innerHTML = `
      <div class="rem-icon">🔔</div>
      <div class="rem-body">
        <div class="rem-title">${App.I18n.t('reminder_popup_title')}${more}</div>
        <div class="rem-note">${_esc(n.title || App.I18n.t('no_notes'))}</div>
      </div>
      <div class="rem-actions">
        <button class="rem-btn rem-open" onclick="App.Reminders._open('${n.id}')">${App.I18n.t('reminder_open')}</button>
        <button class="rem-btn rem-snooze" onclick="App.Reminders._snooze('${n.id}')">${App.I18n.t('reminder_snooze')}</button>
        <button class="rem-btn rem-dismiss" onclick="App.Reminders._dismiss('${n.id}')">✕</button>
      </div>`;
    document.body.appendChild(bar);
    _popupVisible = true;
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Popup actions ─────────────────────────────────────────────────
  function _open(id) {
    _dismiss(id);
    App.showTab?.('notes');
    setTimeout(() => App.Notes?._editNote?.(id), 0);
  }

  function _dismiss(id) {
    const pending = _duePending();
    const item = pending.find(x => x.id === id);
    if (item && item._isListItem) {
      const map = _getNotified();
      map[id] = item._sig;
      _setNotified(map);
    } else {
      const note = App.Storage.getNotes().find(n => n.id === id);
      if (note) {
        const map = _getNotified();
        map[id] = _reminderSig(note);
        _setNotified(map);
      }
    }
    _removePopup();
    // Check if more pending
    const morePending = _duePending();
    if (morePending.length) {
      setTimeout(() => _showPopup(morePending), 400);
    }
  }

  function _snooze(id) {
    const map = _getSnoozed();
    map[id] = Date.now() + 3600000; // 1 hour
    _setSnoozed(map);
    _removePopup();
    App.showToast?.(App.I18n.t('reminder_snoozed'), 'info');
    const pending = _duePending();
    if (pending.length) setTimeout(() => _showPopup(pending), 400);
  }

  // ── Browser notification (Layer B) ────────────────────────────────
  function _canNotify() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  function _sendBrowserNotification(note) {
    if (!_canNotify()) return;
    const lang = App.I18n.current();
    const title = App.I18n.t('notif_title');
    const body  = App.I18n.t('notif_body', { noteTitle: note.title || App.I18n.t('no_notes') });
    try {
      const n = new Notification(title, { body, icon: './icons/icon-192.png', tag: 'note-clip-' + note.id });
      n.onclick = () => { window.focus(); _open(note.id); };
    } catch(e) {
      // Silently ignore — Layer A popup already shown
    }
  }

  function requestPermission() {
    if (!('Notification' in window)) {
      App.showToast?.(App.I18n.t('notif_not_supported'), 'error');
      return;
    }
    Notification.requestPermission().then(result => {
      const st = App.Storage.getState();
      if (result === 'granted') {
        App.Storage.updateSettings({ notificationsEnabled: true });
        App.showToast?.(App.I18n.t('notif_granted'), 'success');
      } else {
        App.Storage.updateSettings({ notificationsEnabled: false });
        App.showToast?.(App.I18n.t('notif_denied'), 'error');
      }
      // Re-render settings if visible
      if (document.getElementById('pane-settings')?.classList.contains('active')) {
        App.Settings?.render?.();
      }
    });
  }

  function sendTest() {
    if (!_canNotify()) {
      App.showToast?.(App.I18n.t('notif_need_permission'), 'error');
      return;
    }
    try {
      new Notification(App.I18n.t('notif_title'), {
        body: App.I18n.t('notif_test_body'),
        icon: './icons/icon-192.png',
        tag: 'note-clip-test',
      });
      App.showToast?.(App.I18n.t('notif_test_sent'), 'success');
    } catch(e) {
      App.showToast?.(App.I18n.t('notif_not_supported'), 'error');
    }
  }

  // ── Main check ────────────────────────────────────────────────────
  function checkReminders() {
    if (_popupVisible) return;
    const pending = _duePending();
    if (!pending.length) return;

    const st = App.Storage.getState();
    // Layer B: browser notification if permitted and enabled
    if (st.settings.notificationsEnabled && _canNotify()) {
      pending.forEach(n => _sendBrowserNotification(n));
      // Also mark them notified so we don't double-show in Layer A
      const map = _getNotified();
      pending.forEach(n => { map[n.id] = _reminderSig(n); });
      _setNotified(map);
    } else {
      // Layer A: in-app popup
      _showPopup(pending);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    checkReminders();
    // Check every 60 seconds
    _checkTimer = setInterval(checkReminders, 60000);
    // Check on page foreground
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkReminders();
    });
  }

  // ── Reminder bell picker ──────────────────────────────────────────
  function openPickerForNote(noteId) {
    const state = App.Storage.getState();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return;
    const current = note.reminderAt || '';
    const dateVal = current ? current.slice(0,10) : '';
    const timeVal = current ? current.slice(11,16) : '08:00';
    const t = App.I18n.t.bind(App.I18n);
    const clearBtn = current
      ? `<button class="btn btn-secondary btn-sm" onclick="App.Reminders._clearNoteBell('${noteId}')">${t('reminder_clear')}</button>`
      : '';
    const html = `
      <div id="reminder-picker-modal" class="modal-backdrop" onclick="if(event.target===this)document.getElementById('reminder-picker-modal').remove()">
        <div class="modal-sheet" style="max-height:65vh">
          <div class="modal-handle"></div>
          <div class="modal-title">⏰ ${_esc(t('reminder_bell_title'))}</div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">${_esc(t('note_due'))}</label>
              <input type="date" id="rpicker-date" class="form-input" value="${_esc(dateVal)}">
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">${_esc(t('note_due_time'))}</label>
              <input type="time" id="rpicker-time" class="form-input" value="${_esc(timeVal)}">
            </div>
          </div>
          <div class="modal-actions">
            ${clearBtn}
            <button class="btn btn-secondary" onclick="document.getElementById('reminder-picker-modal').remove()">${_esc(t('cancel'))}</button>
            <button class="btn btn-primary" onclick="App.Reminders._saveNoteBell('${noteId}')">${_esc(t('save'))}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function _saveNoteBell(noteId) {
    const date = document.getElementById('rpicker-date')?.value || '';
    const time = document.getElementById('rpicker-time')?.value || '08:00';
    document.getElementById('reminder-picker-modal')?.remove();
    if (!date) { App.showToast?.(App.I18n.t('note_due') + '?', 'error'); return; }
    const reminderAt = `${date}T${time}:00`;
    App.Storage.updateNote(noteId, { reminderAt });
    App.showToast?.(App.I18n.t('reminder_set_for'), 'success');
    // Re-render notes or dashboard if visible
    if (document.getElementById('pane-notes')?.classList.contains('active')) App.Notes?.render?.();
    if (document.getElementById('pane-dashboard')?.classList.contains('active')) App.Dashboard?.render?.();
  }

  function _clearNoteBell(noteId) {
    document.getElementById('reminder-picker-modal')?.remove();
    App.Storage.updateNote(noteId, { reminderAt: '' });
    App.showToast?.(App.I18n.t('reminder_removed'), 'success');
    if (document.getElementById('pane-notes')?.classList.contains('active')) App.Notes?.render?.();
    if (document.getElementById('pane-dashboard')?.classList.contains('active')) App.Dashboard?.render?.();
  }

  function openPickerForListItem(listId, itemId) {
    const state = App.Storage.getState();
    const list = state.lists.find(l => l.id === listId);
    const item = list && list.items.find(i => i.id === itemId);
    if (!item) return;
    const current = item.reminderAt || '';
    const dateVal = current ? current.slice(0,10) : '';
    const timeVal = current ? current.slice(11,16) : '08:00';
    const t = App.I18n.t.bind(App.I18n);
    const clearBtn = current
      ? `<button class="btn btn-secondary btn-sm" onclick="App.Reminders._clearListBell('${listId}','${itemId}')">${t('reminder_clear')}</button>`
      : '';
    const label = _esc(list.name + ': ' + item.text);
    const html = `
      <div id="reminder-picker-modal" class="modal-backdrop" onclick="if(event.target===this)document.getElementById('reminder-picker-modal').remove()">
        <div class="modal-sheet" style="max-height:65vh">
          <div class="modal-handle"></div>
          <div class="modal-title">⏰ ${_esc(t('reminder_bell_title'))}</div>
          <div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-sm)">${label}</div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">${_esc(t('note_due'))}</label>
              <input type="date" id="rpicker-date" class="form-input" value="${_esc(dateVal)}">
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">${_esc(t('note_due_time'))}</label>
              <input type="time" id="rpicker-time" class="form-input" value="${_esc(timeVal)}">
            </div>
          </div>
          <div class="modal-actions">
            ${clearBtn}
            <button class="btn btn-secondary" onclick="document.getElementById('reminder-picker-modal').remove()">${_esc(t('cancel'))}</button>
            <button class="btn btn-primary" onclick="App.Reminders._saveListBell('${listId}','${itemId}')">${_esc(t('save'))}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function _saveListBell(listId, itemId) {
    const date = document.getElementById('rpicker-date')?.value || '';
    const time = document.getElementById('rpicker-time')?.value || '08:00';
    document.getElementById('reminder-picker-modal')?.remove();
    if (!date) { App.showToast?.(App.I18n.t('note_due') + '?', 'error'); return; }
    const reminderAt = `${date}T${time}:00`;
    App.Storage.updateListItemReminder(listId, itemId, reminderAt);
    App.showToast?.(App.I18n.t('reminder_set_for'), 'success');
    if (document.getElementById('pane-lists')?.classList.contains('active')) App.Lists?.render?.();
  }

  function _clearListBell(listId, itemId) {
    document.getElementById('reminder-picker-modal')?.remove();
    App.Storage.updateListItemReminder(listId, itemId, '');
    App.showToast?.(App.I18n.t('reminder_removed'), 'success');
    if (document.getElementById('pane-lists')?.classList.contains('active')) App.Lists?.render?.();
  }

  App.Reminders = {
    init, checkReminders,
    requestPermission, sendTest,
    _open, _dismiss, _snooze,
    openPickerForNote, openPickerForListItem,
    _saveNoteBell, _clearNoteBell, _saveListBell, _clearListBell,
    getPermissionState: () => {
      if (!('Notification' in window)) return 'unsupported';
      return Notification.permission; // 'default' | 'granted' | 'denied'
    },
  };

})(window.App = window.App || {});
