/**
 * dashboard.js — Note Clip PWA
 * Dashboard tab: greeting, today's focus, quick note, mini calendar, reminders.
 */
(function (App) {
  'use strict';

  let _calYear, _calMonth, _selectedDate;

  // ── Greeting ─────────────────────────────────────────────────────
  function getGreeting() {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return App.I18n.t('greeting_morning');
    if (h >= 12 && h < 17) return App.I18n.t('greeting_afternoon');
    if (h >= 17 && h < 21) return App.I18n.t('greeting_evening');
    return App.I18n.t('greeting_night');
  }

  function greetingIcon() {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return '☀️';
    if (h >= 12 && h < 17) return '🌤️';
    if (h >= 17 && h < 21) return '🌆';
    return '🌙';
  }

  // ── Calendar ──────────────────────────────────────────────────────
  function buildCalendar(year, month) {
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const state = App.Storage.getState();
    // Collect dates that have notes
    const noteDates = new Set(
      state.notes
        .filter(n => n.dueDate)
        .map(n => n.dueDate.slice(0, 10))
    );

    const monthNames = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    const monthNamesEs = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const lang = App.I18n.current();
    const monthLabel = (lang === 'es' ? monthNamesEs : monthNames)[month];
    const dayLabels = lang === 'es'
      ? ['Do','Lu','Ma','Mi','Ju','Vi','Sa']
      : ['Su','Mo','Tu','We','Th','Fr','Sa'];

    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    let cells = '';
    // Prev month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
    }
    // This month
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday    = ds === todayStr;
      const isSelected = ds === _selectedDate;
      const hasNote    = noteDates.has(ds);
      const cls = [
        'cal-day',
        isToday    ? 'today'    : '',
        isSelected ? 'selected' : '',
        hasNote    ? 'has-note' : '',
      ].filter(Boolean).join(' ');
      cells += `<div class="${cls}" data-date="${ds}" onclick="App.Dashboard._selectDate('${ds}')">${d}</div>`;
    }
    // Next month filler
    const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    for (let d = 1; d <= total - firstDay - daysInMonth; d++) {
      cells += `<div class="cal-day other-month">${d}</div>`;
    }

    return `
      <div class="mini-calendar">
        <div class="cal-header">
          <button class="cal-nav-btn" onclick="App.Dashboard._prevMonth()">‹</button>
          <span class="cal-month-label">${monthLabel} ${year}</span>
          <button class="cal-nav-btn" onclick="App.Dashboard._nextMonth()">›</button>
        </div>
        <div class="cal-grid">
          ${dayLabels.map(l => `<div class="cal-day-label">${l}</div>`).join('')}
          ${cells}
        </div>
      </div>`;
  }

  function _prevMonth() {
    _calMonth--;
    if (_calMonth < 0) { _calMonth = 11; _calYear--; }
    _refreshCalendar();
  }

  function _nextMonth() {
    _calMonth++;
    if (_calMonth > 11) { _calMonth = 0; _calYear++; }
    _refreshCalendar();
  }

  function _selectDate(ds) {
    _selectedDate = ds;
    _refreshCalendar();
    // Show notes for that date or open create-note modal
    const state = App.Storage.getState();
    const dayNotes = state.notes.filter(n => n.dueDate && n.dueDate.slice(0,10) === ds);
    if (dayNotes.length) {
      App.showToast(`${dayNotes.length} note(s) on ${ds}`, 'info');
    }
  }

  function _refreshCalendar() {
    const el = document.getElementById('cal-wrap');
    if (el) el.innerHTML = buildCalendar(_calYear, _calMonth);
  }

  // ── Quick Note ────────────────────────────────────────────────────
  function _saveQuickNote() {
    const ta = document.getElementById('quick-note-ta');
    if (!ta) return;
    const text = ta.value.trim();
    if (!text) return;
    App.Storage.addNote({ title: text.slice(0, 60), body: text, status: 'active' });
    ta.value = '';
    App.showToast('Note saved!', 'success');
  }

  // ── Reminders ─────────────────────────────────────────────────────
  function buildReminders(state) {
    const now = new Date();
    const upcoming = state.notes
      .filter(n => n.dueDate && !n.completed && !n.archived)
      .map(n => ({ ...n, dateObj: new Date(n.dueDate + (n.dueTime ? 'T'+n.dueTime : 'T00:00')) }))
      .filter(n => n.dateObj >= now)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 5);

    if (!upcoming.length) {
      return `<div class="empty-state" style="padding:var(--space-md) 0">
        <div class="empty-state-icon">🔔</div>
        <div class="empty-state-text">${App.I18n.t('no_reminders')}</div>
      </div>`;
    }
    return upcoming.map(n => {
      const d = n.dateObj;
      const time = n.dueTime || '';
      const dateStr = d.toLocaleDateString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US',
        { month: 'short', day: 'numeric' });
      const cat = state.categories.find(c => c.id === n.categoryId);
      return `<div class="reminder-item">
        <div class="reminder-icon-wrap">${cat ? cat.icon : '📝'}</div>
        <div class="flex-col" style="flex:1">
          <div class="reminder-text">${_esc(n.title || n.body.slice(0,40))}</div>
          ${cat ? `<div style="font-size:var(--text-xs);color:var(--color-text-muted)">${cat.name}</div>` : ''}
        </div>
        <div class="reminder-time">${dateStr}${time ? ' · '+time : ''}</div>
      </div>`;
    }).join('');
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Today's Focus ─────────────────────────────────────────────────
  function _saveFocus() {
    const el = document.getElementById('focus-input');
    if (!el) return;
    App.Storage.updateSettings({ todayFocus: el.value });
  }

  // ── Render ────────────────────────────────────────────────────────
  function render() {
    const el = document.getElementById('pane-dashboard');
    if (!el) return;

    const state = App.Storage.getState();
    const now = new Date();
    const lang = App.I18n.current();
    const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US',
      { weekday: 'long', month: 'long', day: 'numeric' });
    const name = state.settings.username ? `, ${state.settings.username}` : '';

    // Init calendar state
    if (_calYear === undefined) {
      _calYear  = now.getFullYear();
      _calMonth = now.getMonth();
    }

    el.innerHTML = `
      <!-- Greeting -->
      <div class="greeting-block">
        <div class="greeting-text">${greetingIcon()} ${getGreeting()}${_esc(name)}</div>
        <div class="greeting-date">${dateStr}</div>
      </div>

      <!-- Today's Focus -->
      <div class="focus-card">
        <div class="focus-label" data-i18n="today_focus">${App.I18n.t('today_focus')}</div>
        <input id="focus-input" class="focus-input"
          placeholder="${App.I18n.t('today_focus_ph')}"
          value="${_esc(state.settings.todayFocus || '')}"
          oninput="App.Dashboard._saveFocus()"
        />
      </div>

      <!-- Quick Note -->
      <div class="section-header" style="margin-bottom:var(--space-sm)">
        <span class="section-title" data-i18n="quick_note">${App.I18n.t('quick_note')}</span>
      </div>
      <div class="quick-note-wrap" style="margin-bottom:var(--space-lg)">
        <textarea id="quick-note-ta" class="quick-note-input"
          placeholder="${App.I18n.t('quick_note_ph')}" rows="3"></textarea>
        <div class="quick-note-actions">
          <button class="btn btn-primary btn-sm" onclick="App.Dashboard._saveQuickNote()">
            ${App.I18n.t('save')}
          </button>
        </div>
      </div>

      <!-- Mini Calendar -->
      <div id="cal-wrap">${buildCalendar(_calYear, _calMonth)}</div>

      <!-- Upcoming Reminders -->
      <div class="section-header">
        <span class="section-title" data-i18n="upcoming">${App.I18n.t('upcoming')}</span>
      </div>
      <div id="reminders-wrap">${buildReminders(state)}</div>
    `;
  }

  App.Dashboard = { render, _prevMonth, _nextMonth, _selectDate, _saveQuickNote, _saveFocus, _refreshCalendar };

})(window.App = window.App || {});
