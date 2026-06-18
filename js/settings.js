/**
 * settings.js — Note Clip PWA
 * Settings tab: theme, language, username, reminders, export.
 */
(function (App) {
  'use strict';

  function render() {
    const el = document.getElementById('pane-settings');
    if (!el) return;
    const state = App.Storage.getState();
    const s = state.settings;
    const t = App.I18n.t.bind(App.I18n);
    const lang = s.language || 'en';

    const themeButtons = ['light','dark','system'].map(th =>
      `<button class="theme-btn${s.theme===th?' active':''}" onclick="App.Settings._setTheme('${th}')">
        ${t('theme_'+th)}
      </button>`
    ).join('');

    const noteCountStr = state.notes.length;
    const listCountStr = state.lists.length;

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${t('settings')}</span>
      </div>

      <!-- Appearance -->
      <div class="settings-section">
        <div class="settings-section-label">${t('settings_appearance')}</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">${t('theme')}</div>
          </div>
          <div class="theme-toggle">${themeButtons}</div>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">${t('language')}</div>
          </div>
          <div class="lang-toggle">
            <button class="lang-btn${lang==='en'?' active':''}" data-lang="en"
              onclick="App.Settings._setLanguage('en')">EN</button>
            <button class="lang-btn${lang==='es'?' active':''}" data-lang="es"
              onclick="App.Settings._setLanguage('es')">ES</button>
          </div>
        </div>
      </div>

      <!-- Profile -->
      <div class="settings-section">
        <div class="settings-section-label">${t('settings_profile')}</div>
        <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:var(--space-sm)">
          <div class="settings-row-label">${t('username')}</div>
          <input id="settings-username" class="form-input"
            placeholder="${t('username_ph')}" value="${(s.username||'').replace(/"/g,'&quot;')}">
          <button class="btn btn-primary btn-sm" onclick="App.Settings._saveUsername()">
            ${t('save')}
          </button>
        </div>
      </div>

      <!-- Defaults -->
      <div class="settings-section">
        <div class="settings-section-label">${t('settings_defaults')}</div>
        <div class="settings-row">
          <div class="settings-row-label">${t('reminder_default')}</div>
          <input type="time" id="settings-reminder" class="form-input" style="width:auto"
            value="${s.defaultReminderTime||'08:00'}"
            onchange="App.Settings._saveReminder()">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${t('list_default')}</div>
          <select id="settings-list-default" class="form-select" style="width:auto;min-width:130px"
            onchange="App.Settings._saveListDefault()">
            <option value="reusable"${s.defaultListBehavior==='reusable'?' selected':''}>${t('list_reusable')}</option>
            <option value="goal"${s.defaultListBehavior==='goal'?' selected':''}>${t('list_goal')}</option>
            <option value="template"${s.defaultListBehavior==='template'?' selected':''}>${t('list_template')}</option>
          </select>
        </div>
      </div>

      <!-- Data -->
      <div class="settings-section">
        <div class="settings-section-label">${t('settings_data_sync')}</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">${t('cloud_sync')}</div>
            <div class="settings-row-sub">${t('cloud_status')}</div>
          </div>
          <span class="chip">${t('settings_offline')}</span>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">${t('export_backup')}</div>
            <div class="settings-row-sub">${t('settings_count', {notes: noteCountStr, lists: listCountStr})}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.Storage.exportJSON()">${t('settings_export_btn')}</button>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="settings-section-label">${t('settings_about')}</div>
        <div class="settings-row">
          <div class="settings-row-label">Note Clip</div>
          <span class="text-muted text-sm">v1.0</span>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">${t('settings_storage')}</div>
          <span class="text-muted text-sm">${t('settings_local_only')}</span>
        </div>
      </div>
    `;
  }

  function _setTheme(theme) {
    App.Storage.updateSettings({ theme });
    App.applyTheme(theme);
    render();
  }

  function _setLanguage(lang) {
    App.Storage.updateSettings({ language: lang });
    App.I18n.set(lang);
    // Re-render all tabs
    App.refreshCurrentTab();
    render();
  }

  function _saveUsername() {
    const val = document.getElementById('settings-username')?.value.trim() || '';
    App.Storage.updateSettings({ username: val });
    App.showToast(App.I18n.t('toast_saved'), 'success');
  }

  function _saveReminder() {
    const val = document.getElementById('settings-reminder')?.value || '08:00';
    App.Storage.updateSettings({ defaultReminderTime: val });
  }

  function _saveListDefault() {
    const val = document.getElementById('settings-list-default')?.value || 'reusable';
    App.Storage.updateSettings({ defaultListBehavior: val });
  }

  App.Settings = { render, _setTheme, _setLanguage, _saveUsername, _saveReminder, _saveListDefault };

})(window.App = window.App || {});
