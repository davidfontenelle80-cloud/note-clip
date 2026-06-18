/**
 * settings.js — Note Clip PWA
 * Settings tab: theme, language, username, reminders, export.
 */
(function (App) {
  'use strict';

  let _cloudInitStarted = false;

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _formatDate(value) {
    if (!value) return App.I18n.t('cloud_never');
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function _cloudSection(state) {
    const t = App.I18n.t.bind(App.I18n);
    const cloud = App.Cloud ? App.Cloud.getStatus() : null;
    const loading = !!cloud?.loading;
    const disabled = loading ? ' disabled' : '';
    const signedIn = !!cloud?.user;
    const accountText = signedIn
      ? t('cloud_signed_in_as', { email: cloud.email })
      : t('cloud_not_signed_in');
    const chip = !App.Cloud
      ? t('settings_offline')
      : loading
        ? t('cloud_loading')
        : signedIn
          ? t('cloud_available')
          : t('settings_local_only');
    const statusSub = cloud?.error
      ? _esc(cloud.error)
      : (signedIn ? t('cloud_available') : t('cloud_not_signed_in'));
    const errorHtml = cloud?.error
      ? `<div class="settings-row-sub" style="color:var(--color-error);margin-top:var(--space-xs)">${_esc(cloud.error)}</div>`
      : '';

    const authControls = signedIn ? `
      <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:var(--space-sm)">
        <div>
          <div class="settings-row-label">${t('cloud_account')}</div>
          <div class="settings-row-sub">${_esc(accountText)}</div>
          ${errorHtml}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.Settings._cloudSignOut()"${disabled}>${t('cloud_sign_out')}</button>
      </div>
      <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:var(--space-sm)">
        <div>
          <div class="settings-row-label">${t('cloud_backup_now')}</div>
          <div class="settings-row-sub">${t('cloud_last_backup')}: ${_formatDate(cloud.lastBackupAt)}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.Settings._cloudBackup()"${disabled}>${t('cloud_backup_now')}</button>
      </div>
      <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:var(--space-sm)">
        <div>
          <div class="settings-row-label">${t('cloud_restore')}</div>
          <div class="settings-row-sub">${t('cloud_last_restore')}: ${_formatDate(cloud.lastRestoreAt)}</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="App.Settings._cloudRestore()"${disabled}>${t('cloud_restore')}</button>
      </div>`
      : `
      <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:var(--space-sm)">
        <div>
          <div class="settings-row-label">${t('cloud_account')}</div>
          <div class="settings-row-sub">${_esc(statusSub)}</div>
          ${errorHtml}
        </div>
        <input id="cloud-email" class="form-input" type="email" autocomplete="email"
          placeholder="${t('cloud_email_ph')}" aria-label="${t('cloud_email')}">
        <input id="cloud-password" class="form-input" type="password" autocomplete="current-password"
          placeholder="${t('cloud_password_ph')}" aria-label="${t('cloud_password')}">
        <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" style="flex:1 1 130px" onclick="App.Settings._cloudSignIn()"${disabled}>${t('cloud_sign_in')}</button>
          <button class="btn btn-secondary btn-sm" style="flex:1 1 130px" onclick="App.Settings._cloudCreateAccount()"${disabled}>${t('cloud_create_account')}</button>
        </div>
      </div>`;

    return `
      <div class="settings-row">
        <div>
          <div class="settings-row-label">${t('cloud_sync')}</div>
          <div class="settings-row-sub">${_esc(statusSub)}</div>
        </div>
        <span class="chip">${_esc(chip)}</span>
      </div>
      ${authControls}`;
  }

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
        <div class="settings-row">
          <div>
            <div class="settings-row-label">${t('theme')}</div>
          </div>
          <div class="theme-toggle">${themeButtons}</div>
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
        ${_cloudSection(state)}
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

    if (App.Cloud && !_cloudInitStarted) {
      _cloudInitStarted = true;
      App.Cloud.init().catch(() => {}).finally(() => _refreshCloudStatus());
    }
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

  function _cloudCredentials() {
    const email = document.getElementById('cloud-email')?.value.trim() || '';
    const password = document.getElementById('cloud-password')?.value || '';
    return { email, password };
  }

  function _cloudSignIn() {
    const { email, password } = _cloudCredentials();
    App.Cloud.signIn(email, password)
      .then(() => App.showToast(App.I18n.t('toast_cloud_signed_in'), 'success'))
      .catch(() => {})
      .finally(() => render());
  }

  function _cloudCreateAccount() {
    const { email, password } = _cloudCredentials();
    App.Cloud.createAccount(email, password)
      .then(() => App.showToast(App.I18n.t('toast_cloud_account_created'), 'success'))
      .catch(() => {})
      .finally(() => render());
  }

  function _cloudSignOut() {
    App.Cloud.signOut()
      .then(() => App.showToast(App.I18n.t('toast_cloud_signed_out'), 'success'))
      .catch(() => {})
      .finally(() => render());
  }

  function _cloudBackup() {
    App.Cloud.backupNow()
      .then(() => App.showToast(App.I18n.t('toast_cloud_backup'), 'success'))
      .catch(() => {})
      .finally(() => render());
  }

  function _cloudRestore() {
    if (!confirm(App.I18n.t('cloud_restore_q'))) return;
    App.Cloud.restoreFromCloud()
      .then(() => {
        App.showToast(App.I18n.t('toast_cloud_restore'), 'success');
        App.refreshCurrentTab();
      })
      .catch(() => {})
      .finally(() => render());
  }

  function _refreshCloudStatus() {
    if (document.getElementById('pane-settings')?.classList.contains('active')) render();
  }

  App.Settings = {
    render, _setTheme, _setLanguage, _saveUsername, _saveReminder, _saveListDefault,
    _cloudSignIn, _cloudCreateAccount, _cloudSignOut, _cloudBackup, _cloudRestore,
    _refreshCloudStatus,
  };

})(window.App = window.App || {});
