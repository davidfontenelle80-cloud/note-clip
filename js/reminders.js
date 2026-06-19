/**
 * reminders.js - Note Clip PWA
 * In-app reminder popups plus optional active-browser Notification API support.
 */
(function (App) {
  'use strict';

  const SIDE_KEY = 'noteClip_reminderState_v1';
  const SNOOZE_MINUTES = 10;
  let _popupOpen = false;
  let _checkTimer = null;

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _sideState() {
    try { return JSON.parse(localStorage.getItem(SIDE_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function _saveSideState(state) {
    try { localStorage.setItem(SIDE_KEY, JSON.stringify(state)); }
    catch (err) { console.warn('[Reminders] sidecar save failed', err); }
  }

  function _settings() {
    const s = App.Storage.getState().settings || {};
    return {
      popups: s.reminderPopups !== false,
      phone: s.reminderNotifications === true,
      defaultTime: s.defaultReminderTime || '08:00',
    };
  }

  function _toDate(date, time) {
    if (!date) return null;
    const d = new Date(`${date}T${time || '08:00'}:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function _triggerAt(note) {
    if (!note || !note.dueDate || note.completed || note.archived) return null;
    const settings = _settings();
    const dueTime = note.dueTime || settings.defaultTime;
    let trigger = _toDate(note.dueDate, dueTime);
    if (!trigger) return null;

    if (note.reminder === 'same_day') {
      trigger = _toDate(note.dueDate, settings.defaultTime);
    } else if (note.reminder === 'day_before') {
      trigger = new Date(trigger.getTime() - 24 * 60 * 60 * 1000);
    } else if (note.reminder === '1h_before') {
      trigger = new Date(trigger.getTime() - 60 * 60 * 1000);
    } else if (note.reminder === '2h_before') {
      trigger = new Date(trigger.getTime() - 2 * 60 * 60 * 1000);
    } else if (!note.dueTime && !note.reminder) {
      return null;
    }
    return trigger;
  }

  function _key(note, trigger) {
    return [note.id, note.dueDate || '', note.dueTime || '', note.reminder || '', trigger.toISOString()].join('|');
  }

  function _dueReminders() {
    const now = new Date();
    const state = _sideState();
    return App.Storage.getNotes()
      .map(note => {
        const trigger = _triggerAt(note);
        if (!trigger || trigger > now) return null;
        const key = _key(note, trigger);
        const meta = state[key] || {};
        if (meta.dismissedAt) return null;
        if (meta.snoozeUntil && new Date(meta.snoozeUntil) > now) return null;
        return { note, trigger, key, meta };
      })
      .filter(Boolean)
      .sort((a, b) => a.trigger - b.trigger);
  }

  function _mark(key, patch) {
    const state = _sideState();
    state[key] = Object.assign({}, state[key] || {}, patch);
    _saveSideState(state);
  }

  function _body(note) {
    return App.I18n.t('notification_body', { title: note.title || App.I18n.t('note_untitled') });
  }

  function _showPopup(item) {
    if (_popupOpen || document.getElementById('reminder-popup')) return;
    _popupOpen = true;
    _mark(item.key, { inAppShownAt: new Date().toISOString() });
    const isOverdue = item.trigger < new Date(Date.now() - 60 * 1000);
    const triggerLabel = item.trigger.toLocaleString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const html = `
      <div id="reminder-popup" class="modal-backdrop" onclick="if(event.target===this)App.Reminders.dismiss('${item.key}')">
        <div class="modal-sheet reminder-popup-sheet">
          <div class="modal-handle"></div>
          <div class="reminder-popup-card">
            <div class="reminder-popup-kicker">${isOverdue ? App.I18n.t('reminder_overdue_label') : App.I18n.t('reminder_popup_title')}</div>
            <div class="reminder-popup-title">${_esc(item.note.title || App.I18n.t('note_untitled'))}</div>
            <div class="reminder-popup-body">${_esc(_body(item.note))}</div>
            <div class="reminder-popup-time">${_esc(triggerLabel)}</div>
          </div>
          <div class="modal-actions reminder-popup-actions">
            <button class="btn btn-secondary" onclick="App.Reminders.snooze('${item.key}')">${App.I18n.t('reminder_snooze')}</button>
            <button class="btn btn-secondary" onclick="App.Reminders.dismiss('${item.key}')">${App.I18n.t('reminder_dismiss')}</button>
            <button class="btn btn-primary" onclick="App.Reminders.open('${item.note.id}','${item.key}')">${App.I18n.t('reminder_open_note')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('reminder-popup');
  }

  function _notify(item) {
    const settings = _settings();
    if (!settings.phone || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (item.meta.phoneNotifiedAt) return;
    try {
      const notification = new Notification(App.I18n.t('notification_title'), {
        body: _body(item.note),
        icon: './icons/icon-192.png',
        tag: item.key,
        renotify: false,
      });
      notification.onclick = () => {
        window.focus?.();
        open(item.note.id, item.key);
        notification.close();
      };
      _mark(item.key, { phoneNotifiedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('[Reminders] notification failed', err);
    }
  }

  function checkDue() {
    const due = _dueReminders();
    if (!due.length) return [];
    if (_settings().phone) due.forEach(_notify);
    if (_settings().popups) _showPopup(due[0]);
    return due;
  }

  function dismiss(key) {
    _mark(key, { dismissedAt: new Date().toISOString() });
    document.getElementById('reminder-popup')?.remove();
    _popupOpen = false;
    App.restoreFocus?.();
    App.showToast(App.I18n.t('reminder_dismissed'), 'success');
    setTimeout(checkDue, 120);
  }

  function snooze(key) {
    const until = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000).toISOString();
    _mark(key, { snoozeUntil: until });
    document.getElementById('reminder-popup')?.remove();
    _popupOpen = false;
    App.restoreFocus?.();
    App.showToast(App.I18n.t('reminder_snoozed'), 'success');
  }

  function open(noteId, key) {
    if (key) _mark(key, { dismissedAt: new Date().toISOString(), openedAt: new Date().toISOString() });
    document.getElementById('reminder-popup')?.remove();
    _popupOpen = false;
    App.showTab('notes');
    setTimeout(() => App.Notes?._editNote?.(noteId), 0);
  }

  function getStatus() {
    return {
      supported: 'Notification' in window,
      permission: ('Notification' in window) ? Notification.permission : 'unavailable',
      popups: _settings().popups,
      phone: _settings().phone,
    };
  }

  function setPopups(on) {
    App.Storage.updateSettings({ reminderPopups: !!on });
    if (on) setTimeout(checkDue, 120);
  }

  function setNotifications(on) {
    App.Storage.updateSettings({ reminderNotifications: !!on });
    if (on) setTimeout(checkDue, 120);
  }

  function requestPermission() {
    if (!('Notification' in window)) {
      App.showToast(App.I18n.t('notification_not_supported'), 'error');
      return Promise.resolve('unavailable');
    }
    return Notification.requestPermission().then(permission => {
      App.showToast(
        permission === 'granted' ? App.I18n.t('notification_permission_granted') : App.I18n.t('notification_permission_denied'),
        permission === 'granted' ? 'success' : 'error'
      );
      return permission;
    });
  }

  function sendTestNotification() {
    if (!('Notification' in window)) {
      App.showToast(App.I18n.t('notification_not_supported'), 'error');
      return;
    }
    if (Notification.permission !== 'granted') {
      App.showToast(App.I18n.t('notification_permission_denied'), 'error');
      return;
    }
    try {
      new Notification(App.I18n.t('notification_title'), {
        body: App.I18n.t('notification_test_body'),
        icon: './icons/icon-192.png',
        tag: 'note-clip-test',
      });
      App.showToast(App.I18n.t('notification_test_sent'), 'success');
    } catch (err) {
      console.warn('[Reminders] test notification failed', err);
      App.showToast(App.I18n.t('notification_test_failed'), 'error');
    }
  }

  function init() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') setTimeout(checkDue, 250);
    });
    window.addEventListener('focus', () => setTimeout(checkDue, 250));
    clearInterval(_checkTimer);
    _checkTimer = setInterval(checkDue, 60 * 1000);
    setTimeout(checkDue, 700);
  }

  App.Reminders = {
    init, checkDue, dismiss, snooze, open, getStatus,
    setPopups, setNotifications, requestPermission, sendTestNotification,
  };

})(window.App = window.App || {});
