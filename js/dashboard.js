/**
 * dashboard.js — Note Clip PWA
 * Dashboard tab: greeting, today's focus, today's tasks, quick note,
 * mini calendar (with month/year pickers + swipe), upcoming reminders.
 * Stage 2 — Items C + D.
 */
(function (App) {
  'use strict';

  let _calYear, _calMonth, _selectedDate;

  // ── Helpers ───────────────────────────────────────────────────────
  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

  // ── Greeting ──────────────────────────────────────────────────────
  function getGreeting(name) {
    if (!name) return App.I18n.t('greeting_welcome');
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return App.I18n.t('greeting_morning');
    if (h >= 12 && h < 17) return App.I18n.t('greeting_afternoon');
    if (h >= 17 && h < 21) return App.I18n.t('greeting_evening');
    return App.I18n.t('greeting_night');
  }

  function greetingIcon() {
    const h = new Date().getHours();
    let period;
    if (h >= 5  && h < 12) period = 'morning';
    else if (h >= 12 && h < 17) period = 'afternoon';
    else if (h >= 17 && h < 21) period = 'evening';
    else period = 'night';
    return `<span class="greeting-stationery-icon greeting-${period}" aria-hidden="true"><span></span></span>`;
  }

  // ── Calendar ──────────────────────────────────────────────────────
  function buildCalendar(year, month) {
    const today    = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const state = App.Storage.getState();
    const noteDates = new Set(
      state.notes.filter(n => n.dueDate).map(n => n.dueDate.slice(0, 10))
    );

    const monthNames   = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    const monthNamesEs = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const lang = App.I18n.current();
    const monthLabel = (lang === 'es' ? monthNamesEs : monthNames)[month];
    const dayLabels  = lang === 'es'
      ? ['Do','Lu','Ma','Mi','Ju','Vi','Sa']
      : ['Su','Mo','Tu','We','Th','Fr','Sa'];

    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    let cells = '';
    for (let i = firstDay - 1; i >= 0; i--)
      cells += `<div class="cal-day other-month">${daysInPrev - i}</div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cls = [
        'cal-day',
        ds === todayStr      ? 'today'    : '',
        ds === _selectedDate ? 'selected' : '',
        noteDates.has(ds)   ? 'has-note' : '',
      ].filter(Boolean).join(' ');
      cells += `<button type="button" class="${cls}" data-date="${ds}" aria-label="${ds}"
        onclick="App.Dashboard._selectDate('${ds}')">${d}</button>`;
    }

    const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    for (let d = 1; d <= total - firstDay - daysInMonth; d++)
      cells += `<div class="cal-day other-month">${d}</div>`;

    return `
      <div class="mini-calendar" id="dash-calendar">
        <div class="cal-header">
          <button class="cal-nav-btn" onclick="App.Dashboard._prevMonth()">&#8249;</button>
          <span class="cal-month-label">
            <span style="cursor:pointer" onclick="App.Dashboard._openMonthPicker()">${monthLabel}</span>
            &nbsp;
            <span style="cursor:pointer" onclick="App.Dashboard._openYearPicker()">${year}</span>
          </span>
          <button class="cal-nav-btn" onclick="App.Dashboard._nextMonth()">&#8250;</button>
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
    const state = App.Storage.getState();
    const dayNotes = state.notes.filter(n => n.dueDate && n.dueDate.slice(0,10) === ds);
    if (dayNotes.length) {
      App.showToast(App.I18n.t('toast_notes_on_date', {count: dayNotes.length, date: ds}), 'info');
      App.showTab('notes');
      if (App.Notes && App.Notes.filterByDate) App.Notes.filterByDate(ds);
    } else {
      App.showToast(App.I18n.t('toast_no_notes_on_date'), 'info');
    }
  }

  function _refreshCalendar() {
    const el = document.getElementById('cal-wrap');
    if (el) {
      el.innerHTML = buildCalendar(_calYear, _calMonth);
      _initCalendarSwipe();
    }
  }

  // ── Month Picker ──────────────────────────────────────────────────
  function _openMonthPicker() {
    const months = App.I18n.current() === 'es'
      ? ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const html = `<div class="picker-overlay" id="month-picker">
      <div class="picker-panel">
        <div class="picker-grid">
          ${months.map((m,i) => `<button type="button" class="picker-btn${i===_calMonth?' picker-active':''}" data-val="${i}">${m}</button>`).join('')}
        </div>
      </div>
    </div>`;
    const cal = document.getElementById('dash-calendar');
    if (!cal) return;
    cal.insertAdjacentHTML('beforeend', html);
    document.getElementById('month-picker').addEventListener('click', e => {
      const btn = e.target.closest('[data-val]');
      if (btn) { _calMonth = +btn.dataset.val; }
      document.getElementById('month-picker')?.remove();
      if (btn) _refreshCalendar();
    });
  }

  // ── Year Picker ───────────────────────────────────────────────────
  function _openYearPicker() {
    const cur = _calYear;
    const years = Array.from({length:11}, (_,i) => cur - 5 + i);
    const html = `<div class="picker-overlay" id="year-picker">
      <div class="picker-panel">
        <div class="picker-grid" style="grid-template-columns:repeat(3,1fr)">
          ${years.map(y => `<button type="button" class="picker-btn${y===cur?' picker-active':''}" data-val="${y}">${y}</button>`).join('')}
        </div>
      </div>
    </div>`;
    const cal = document.getElementById('dash-calendar');
    if (!cal) return;
    cal.insertAdjacentHTML('beforeend', html);
    document.getElementById('year-picker').addEventListener('click', e => {
      const btn = e.target.closest('[data-val]');
      if (btn) { _calYear = +btn.dataset.val; }
      document.getElementById('year-picker')?.remove();
      if (btn) _refreshCalendar();
    });
  }

  // ── Swipe gesture on calendar ─────────────────────────────────────
  function _initCalendarSwipe() {
    let sx = 0;
    const cal = document.getElementById('dash-calendar');
    if (!cal) return;
    cal.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
    cal.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) dx < 0 ? _nextMonth() : _prevMonth();
    }, {passive:true});
  }

  // ── Quick Note ────────────────────────────────────────────────────
  function _saveQuickNote() {
    const ta = document.getElementById('quick-note-ta');
    if (!ta) return;
    const text = ta.value.trim();
    if (!text) return;
    const note = App.Storage.addNote({ title: text.slice(0, 60), body: text, status: 'active' });
    ta.value = '';
    App.showToast(App.I18n.t('toast_note_saved'), 'success');
    _renderTodayTasks();
    // Show category picker
    _showQuickNoteCategory(note.id);
  }

  function _showQuickNoteCategory(noteId) {
    const state = App.Storage.getState();
    if (!state.categories.length) return; // No categories — skip popup
    const cats = state.categories;
    const html = `
      <div id="quick-cat-modal" class="modal-backdrop" onclick="if(event.target===this)App.Dashboard._dismissCatPicker()">
        <div class="modal-sheet" style="max-height:60vh">
          <div class="modal-handle"></div>
          <div class="modal-title" style="font-size:var(--text-sm)">${App.I18n.t('quick_cat_title')} <span style="font-weight:400;color:var(--color-text-muted)">${App.I18n.t('quick_cat_optional')}</span></div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:var(--space-md)">
            ${cats.map(c => `
              <button class="btn btn-secondary" style="justify-content:flex-start;gap:8px"
                onclick="App.Dashboard._assignQuickCat('${noteId}','${c.id}')">
                ${c.icon && c.icon.startsWith('ic_')
                  ? `<img src="./icons/${c.icon}.png" style="width:20px;height:20px" alt="">`
                  : `<span>${c.icon||''}</span>`}
                ${_esc(c.name)}
              </button>`).join('')}
          </div>
          <button class="btn btn-secondary w-full" onclick="App.Dashboard._dismissCatPicker()">${App.I18n.t('quick_cat_skip')}</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function _assignQuickCat(noteId, catId) {
    App.Storage.updateNote(noteId, { categoryId: catId });
    _dismissCatPicker();
    App.showToast(App.I18n.t('toast_cat_assigned'), 'success');
    _renderTodayTasks();
  }

  function _dismissCatPicker() {
    document.getElementById('quick-cat-modal')?.remove();
  }

  // ── Today's Tasks ─────────────────────────────────────────────────
  function _renderTodayTasks() {
    const today = new Date().toISOString().slice(0, 10);
    const notes = App.Storage.getNotes().filter(n =>
      !n.completed && !n.archived &&
      (n.dueDate === today || (!n.dueDate && n.createdAt && n.createdAt.slice(0,10) === today))
    );
    const el = document.getElementById('dash-tasks-list');
    if (!el) return;
    if (!notes.length) {
      el.innerHTML = `<p class="empty-state-sm">${App.I18n.t('dash_no_tasks_today')}</p>`;
      return;
    }
    el.innerHTML = notes.map(n => `
      <button type="button" class="task-chip" onclick="App.Dashboard._openTask('${n.id}')">
        <span class="task-chip-dot" style="background:var(--note-${n.color||'yellow'})"></span>
        <span class="task-chip-title">${_esc(n.title || App.I18n.t('no_notes'))}</span>
        ${n.priority ? `<span class="priority-badge priority-${n.priority}">${App.I18n.t('priority_'+n.priority)}</span>` : ''}
        ${n.dueTime  ? `<span class="task-chip-time">${_formatTime(n.dueTime)}</span>` : ''}
      </button>
    `).join('');
  }

  function _openTask(id) {
    App.showTab('notes');
    setTimeout(() => App.Notes?._editNote?.(id), 0);
  }

  // ── Upcoming Reminders ────────────────────────────────────────────
  function _renderUpcoming() {
    const today = new Date().toISOString().slice(0, 10);
    const notes = App.Storage.getNotes()
      .filter(n => n.dueDate && n.dueDate >= today && !n.completed && !n.archived)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
    const el = document.getElementById('dash-reminders-list');
    if (!el) return;
    if (!notes.length) {
      el.innerHTML = `<p class="empty-state-sm">${App.I18n.t('dash_nothing_upcoming')}</p>`;
      return;
    }
    const lang = App.I18n.current();
    const displayNotes = notes.map(n => Object.assign({}, n, { dueTime: _formatTime(n.dueTime) }));
    el.innerHTML = displayNotes.map(n => {
      const d     = new Date(n.dueDate + 'T12:00:00');
      const label = d.toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', {month:'short', day:'numeric'});
      return `<div class="reminder-row">
        <span class="reminder-dot" style="background:var(--note-${n.color||'yellow'})"></span>
        <span class="reminder-title">${_esc(n.title || App.I18n.t('no_notes'))}</span>
        <span class="reminder-date">${label}${n.dueTime ? ' · '+n.dueTime : ''}</span>
      </div>`;
    }).join('');
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
    const now   = new Date();
    const lang  = App.I18n.current();
    const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US',
      { weekday: 'long', month: 'long', day: 'numeric' });
    const name = (state.settings.username || '').trim();
    const greeting = name ? `${getGreeting(name)}, ${_esc(name)}` : getGreeting('');

    if (_calYear === undefined) {
      _calYear  = now.getFullYear();
      _calMonth = now.getMonth();
    }

    el.innerHTML = `
      <!-- Greeting -->
      <div class="greeting-block">
        <div class="greeting-text">${greetingIcon()} ${greeting}</div>
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

      <!-- Today's Tasks -->
      <section class="dash-section" id="dash-tasks" style="margin-top:var(--space-md)">
        <h3 class="dash-section-title">${App.I18n.t('dash_today_tasks')}</h3>
        <div id="dash-tasks-list"></div>
      </section>

      <!-- Quick Note -->
      <div class="section-header" style="margin-bottom:var(--space-sm)">
        <span class="section-title" data-i18n="quick_note">${App.I18n.t('quick_note')}</span>
      </div>
      <div class="quick-note-wrap" style="margin-bottom:var(--space-lg)">
        <span class="quick-note-clip" aria-hidden="true"></span>
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
      <section class="dash-section" id="dash-reminders" style="margin-top:var(--space-lg)">
        <h3 class="dash-section-title">${App.I18n.t('dash_upcoming')}</h3>
        <div id="dash-reminders-list"></div>
      </section>
    `;

    // Populate dynamic sections
    _renderTodayTasks();
    _renderUpcoming();
    _initCalendarSwipe();
  }

  App.Dashboard = {
    render,
    _saveQuickNote, _saveFocus,
    _showQuickNoteCategory, _assignQuickCat, _dismissCatPicker,
    _prevMonth, _nextMonth, _selectDate,
    _openMonthPicker, _openYearPicker,
    _openTask,
  };

})(window.App = window.App || {});
