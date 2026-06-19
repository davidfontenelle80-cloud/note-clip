/**
 * calendar.js - Note Clip PWA
 * Main Calendar tab for due notes, upcoming reminders, and overdue reminders.
 */
(function (App) {
  'use strict';

  let _year;
  let _month;
  let _selectedDate;

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function _formatTime(time) {
    const match = String(time || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return time || '';
    const hour24 = Number(match[1]);
    const minute = match[2];
    if (hour24 < 0 || hour24 > 23) return time;
    const period = hour24 >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  }

  function _formatDate(ds, opts) {
    const d = new Date(ds + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return ds;
    return d.toLocaleDateString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', opts || {
      month: 'short',
      day: 'numeric',
    });
  }

  function _monthLabel(year, month) {
    const names = App.I18n.current() === 'es'
      ? ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${names[month]} ${year}`;
  }

  function _dayLabels() {
    return App.I18n.current() === 'es'
      ? ['Do','Lu','Ma','Mi','Ju','Vi','Sa']
      : ['Su','Mo','Tu','We','Th','Fr','Sa'];
  }

  function _activeNotes() {
    return App.Storage.getNotes().filter(n => !n.completed && !n.archived);
  }

  function _notesForDate(ds) {
    return _activeNotes()
      .filter(n => n.dueDate && n.dueDate.slice(0, 10) === ds)
      .sort((a, b) => String(a.dueTime || '').localeCompare(String(b.dueTime || '')));
  }

  function _upcomingNotes() {
    const today = _todayStr();
    return _activeNotes()
      .filter(n => n.dueDate && n.dueDate >= today)
      .sort((a, b) => (a.dueDate + (a.dueTime || '')).localeCompare(b.dueDate + (b.dueTime || '')))
      .slice(0, 8);
  }

  function _overdueNotes() {
    const today = _todayStr();
    const now = new Date();
    return _activeNotes()
      .filter(n => {
        if (!n.dueDate) return false;
        if (n.dueDate < today) return true;
        if (n.dueDate > today || !n.dueTime) return false;
        return new Date(`${n.dueDate}T${n.dueTime}:00`) < now;
      })
      .sort((a, b) => (a.dueDate + (a.dueTime || '')).localeCompare(b.dueDate + (b.dueTime || '')))
      .slice(0, 8);
  }

  function _buildCalendar() {
    const firstDay = new Date(_year, _month, 1).getDay();
    const daysInMonth = new Date(_year, _month + 1, 0).getDate();
    const daysInPrev = new Date(_year, _month, 0).getDate();
    const today = _todayStr();
    const dueDates = new Set(_activeNotes().filter(n => n.dueDate).map(n => n.dueDate.slice(0, 10)));

    let cells = '';
    for (let i = firstDay - 1; i >= 0; i--) {
      cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${_year}-${String(_month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cls = [
        'cal-day',
        ds === today ? 'today' : '',
        ds === _selectedDate ? 'selected' : '',
        dueDates.has(ds) ? 'has-note' : '',
      ].filter(Boolean).join(' ');
      cells += `<button type="button" class="${cls}" onclick="App.Calendar._selectDate('${ds}')" aria-label="${ds}">${d}</button>`;
    }

    const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    for (let d = 1; d <= total - firstDay - daysInMonth; d++) {
      cells += `<div class="cal-day other-month">${d}</div>`;
    }

    return `
      <div class="mini-calendar calendar-main" id="calendar-main">
        <div class="cal-header">
          <button class="cal-nav-btn" onclick="App.Calendar._prevMonth()" aria-label="Previous month">&#8249;</button>
          <span class="cal-month-label">${_monthLabel(_year, _month)}</span>
          <button class="cal-nav-btn" onclick="App.Calendar._nextMonth()" aria-label="Next month">&#8250;</button>
        </div>
        <div class="cal-grid">
          ${_dayLabels().map(l => `<div class="cal-day-label">${l}</div>`).join('')}
          ${cells}
        </div>
      </div>`;
  }

  function _noteRows(notes, emptyKey) {
    if (!notes.length) return `<p class="empty-state-sm">${App.I18n.t(emptyKey)}</p>`;
    return notes.map(n => {
      const date = n.dueDate ? _formatDate(n.dueDate) : '';
      const time = n.dueTime ? _formatTime(n.dueTime) : '';
      const meta = [date, time].filter(Boolean).join(' - ');
      return `<button type="button" class="calendar-note-row" onclick="App.Calendar._openNote('${n.id}')">
        <span class="reminder-dot" style="background:var(--note-${n.color||'yellow'})"></span>
        <span class="calendar-note-main">
          <span class="calendar-note-title">${_esc(n.title || App.I18n.t('note_untitled'))}</span>
          ${meta ? `<span class="calendar-note-meta">${_esc(meta)}</span>` : ''}
        </span>
      </button>`;
    }).join('');
  }

  function render() {
    const el = document.getElementById('pane-calendar');
    if (!el) return;
    const now = new Date();
    if (_year === undefined) {
      _year = now.getFullYear();
      _month = now.getMonth();
    }
    if (!_selectedDate) _selectedDate = _todayStr();

    const dayNotes = _notesForDate(_selectedDate);
    const selectedLabel = _formatDate(_selectedDate, { weekday: 'long', month: 'long', day: 'numeric' });

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${App.I18n.t('tab_calendar')}</span>
      </div>
      ${_buildCalendar()}
      <section class="dash-section calendar-section">
        <h3 class="dash-section-title">${_esc(selectedLabel)}</h3>
        <div>${_noteRows(dayNotes, 'calendar_no_items')}</div>
      </section>
      <section class="dash-section calendar-section">
        <h3 class="dash-section-title">${App.I18n.t('calendar_overdue')}</h3>
        <div>${_noteRows(_overdueNotes(), 'calendar_no_overdue')}</div>
      </section>
      <section class="dash-section calendar-section calendar-last-section">
        <h3 class="dash-section-title">${App.I18n.t('calendar_upcoming')}</h3>
        <div>${_noteRows(_upcomingNotes(), 'calendar_no_upcoming')}</div>
      </section>`;
  }

  function _selectDate(ds) {
    _selectedDate = ds;
    render();
  }

  function _prevMonth() {
    _month--;
    if (_month < 0) { _month = 11; _year--; }
    render();
  }

  function _nextMonth() {
    _month++;
    if (_month > 11) { _month = 0; _year++; }
    render();
  }

  function _openNote(id) {
    App.showTab('notes');
    setTimeout(() => App.Notes?._editNote?.(id), 0);
  }

  App.Calendar = { render, _selectDate, _prevMonth, _nextMonth, _openNote };

})(window.App = window.App || {});
