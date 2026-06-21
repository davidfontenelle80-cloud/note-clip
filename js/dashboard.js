/**
 * dashboard.js â Note Clip PWA
 * Dashboard tab: greeting, today's focus, today's tasks, quick note,
 * Stage 2 â Items C + D.
 */
(function (App) {
  'use strict';

  // ââ Helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ Greeting ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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


  // ââ Weather âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  let _weatherCache = null; // { icon, temp, fetchedAt }
  let _weatherFetching = false;
  let _geoGranted = false; // true after user explicitly toggled ON

  const WMO_ICON = {
    0:'âï¸', 1:'ð¤ï¸', 2:'â', 3:'âï¸',
    45:'ð«ï¸', 48:'ð«ï¸',
    51:'ð¦ï¸', 53:'ð¦ï¸', 55:'ð§ï¸',
    61:'ð§ï¸', 63:'ð§ï¸', 65:'ð§ï¸',
    71:'ð¨ï¸', 73:'ð¨ï¸', 75:'âï¸',
    80:'ð¦ï¸', 81:'ð§ï¸', 82:'ð§ï¸',
    95:'âï¸', 96:'âï¸', 99:'âï¸',
  };

  function _weatherIcon(code) {
    return WMO_ICON[code] || 'ð¡ï¸';
  }

  function _weatherChipHtml() {
    if (!_weatherCache) return '';
    return `<div class="weather-chip">
      <span class="weather-chip-icon">${_weatherCache.icon}</span>
      <span class="weather-chip-temp">${_weatherCache.temp}Â°F</span>
    </div>`;
  }

  function _fetchWeather() {
    const state = App.Storage.getState();
    if (!state.settings.weatherEnabled) return;
    if (_weatherFetching) return;
    // Only call geolocation once per session (or on first toggle-ON)
    _weatherFetching = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;
        fetch(url)
          .then(r => r.json())
          .then(data => {
            const cw = data.current_weather;
            if (!cw) return;
            _weatherCache = {
              icon: _weatherIcon(cw.weathercode),
              temp: Math.round(cw.temperature),
              fetchedAt: Date.now(),
            };
            _weatherFetching = false;
            _renderWeatherChip();
          })
          .catch(() => { _weatherFetching = false; });
      },
      () => { _weatherFetching = false; } // denied / error â hide silently
    );
  }

  function _renderWeatherChip() {
    const el = document.getElementById('dashboard-weather');
    if (el) el.innerHTML = _weatherChipHtml();
  }

  function _clearWeather() {
    _weatherCache = null;
    _weatherFetching = false;
    const el = document.getElementById('dashboard-weather');
    if (el) el.innerHTML = '';
  }

  // ââ Quick Note ââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    if (!state.categories.length) return; // No categories â skip popup
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

  // ââ Today's Tasks âââââââââââââââââââââââââââââââââââââââââââââââââ
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
        <button type="button" class="bell-btn${n.reminderAt ? ' has-reminder' : ''}"
          title="Set reminder"
          onclick="event.stopPropagation();App.Reminders.openPickerForNote('${n.id}')">â°</button>
      </button>
    `).join('');
  }

  function _openTask(id) {
    App.showTab('notes');
    setTimeout(() => App.Notes?._editNote?.(id), 0);
  }

  // ââ Today's Focus âââââââââââââââââââââââââââââââââââââââââââââââââ
  function _saveFocus() {
    const el = document.getElementById('focus-input');
    if (!el) return;
    App.Storage.updateSettings({ todayFocus: el.value });
  }

  // ââ Render ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

    el.innerHTML = `
      <!-- Greeting -->
      <div class="greeting-block">
        <div class="greeting-text">${greetingIcon()} ${greeting}</div>
        <div class="greeting-date">${dateStr}</div>
      </div>

      <!-- Weather chip (opt-in, renders into this slot) -->
      <div id="dashboard-weather"></div>

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
      <div class="quick-note-wrap quick-note-card" style="margin-bottom:var(--space-lg)">
        <span class="quick-note-clip" aria-hidden="true"></span>
        <textarea id="quick-note-ta" class="quick-note-input"
          placeholder="${App.I18n.t('quick_note_ph')}" rows="3"></textarea>
        <div class="quick-note-actions">
          <button class="btn btn-primary btn-sm" onclick="App.Dashboard._saveQuickNote()">
            ${App.I18n.t('save')}
          </button>
        </div>
      </div>

    `;

    // Populate dynamic sections
    _renderTodayTasks();
    // Trigger weather fetch if enabled (no-op if already cached or disabled)
    const _st = App.Storage.getState();
    if (_st.settings.weatherEnabled) {
      if (_weatherCache) { _renderWeatherChip(); } else { _fetchWeather(); }
    }
  }

  App.Dashboard = {
    render,
    _saveQuickNote, _saveFocus,
    _showQuickNoteCategory, _assignQuickCat, _dismissCatPicker,
    _openTask,
    _fetchWeather, _clearWeather,
  };

})(window.App = window.App || {});
