/**
 * onboarding.js - Note Clip PWA
 * First-run profile setup and optional cloud prompt.
 */
(function (App) {
  'use strict';

  const CLOUD_PROMPT_KEY = 'noteClip_cloudPromptDismissed_v1';
  let _draft = { username: '', language: 'en', theme: 'light' };

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _hasProfile() {
    return !!(App.Storage.getState().settings.username || '').trim();
  }

  function _setDraft(patch) {
    const currentName = document.getElementById('onboard-name')?.value || _draft.username;
    _draft = Object.assign({}, _draft, patch);
    _draft.username = currentName;
    const settingsPatch = {};
    if (patch.language) settingsPatch.language = _draft.language;
    if (patch.theme) settingsPatch.theme = _draft.theme;
    if (Object.keys(settingsPatch).length) App.Storage.updateSettings(settingsPatch);
    if (patch.language) App.I18n.set(_draft.language);
    if (patch.theme) App.applyTheme(_draft.theme);
    render();
  }

  function maybeShow() {
    if (_hasProfile()) return;
    const settings = App.Storage.getState().settings || {};
    _draft = {
      username: '',
      language: settings.language || App.I18n.current() || 'en',
      theme: settings.theme || 'light',
    };
    render();
  }

  function render() {
    document.getElementById('onboarding-overlay')?.remove();
    const t = App.I18n.t.bind(App.I18n);
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboard-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="onboard-paper" role="document">
        <span class="empty-stationery empty-notes onboard-stationery" aria-hidden="true"><span></span></span>
        <div class="onboard-title">${t('onboard_title')}</div>
        <div class="onboard-sub">${t('onboard_sub')}</div>
        <label class="form-label" for="onboard-name">${t('onboard_name')}</label>
        <input id="onboard-name" class="form-input onboard-input" autocomplete="given-name"
          placeholder="${t('onboard_name_ph')}" value="${_esc(_draft.username)}">
        <div class="onboard-options" aria-label="${t('language')}">
          <button class="theme-btn${_draft.language === 'en' ? ' active' : ''}" onclick="App.Onboarding._setDraft({language:'en'})">English</button>
          <button class="theme-btn${_draft.language === 'es' ? ' active' : ''}" onclick="App.Onboarding._setDraft({language:'es'})">Español</button>
        </div>
        <div class="onboard-options" aria-label="${t('theme')}">
          ${['light','dark','system'].map(theme => `
            <button class="theme-btn${_draft.theme === theme ? ' active' : ''}" onclick="App.Onboarding._setDraft({theme:'${theme}'})">
              ${t('theme_' + theme)}
            </button>`).join('')}
        </div>
        <button class="btn btn-primary" onclick="App.Onboarding._finish()">${t('onboard_continue')}</button>
      </div>`;
    document.body.appendChild(overlay);
    App.enhanceModal?.(overlay);
    document.getElementById('onboard-name')?.focus();
  }

  function _finish() {
    const input = document.getElementById('onboard-name');
    const username = (input?.value || '').trim();
    if (!username) {
      input?.focus();
      App.showToast(App.I18n.t('onboard_name_required'), 'error');
      return;
    }
    App.Storage.updateSettings({
      username,
      language: _draft.language,
      theme: _draft.theme,
    });
    App.I18n.set(_draft.language);
    App.applyTheme(_draft.theme);
    document.getElementById('onboarding-overlay')?.remove();
    App.refreshCurrentTab();
    showCloudPrompt();
  }

  function _dismissCloudPrompt() {
    localStorage.setItem(CLOUD_PROMPT_KEY, '1');
    document.getElementById('cloud-onboarding-prompt')?.remove();
  }

  function _setupCloud() {
    localStorage.setItem(CLOUD_PROMPT_KEY, '1');
    document.getElementById('cloud-onboarding-prompt')?.remove();
    App.showTab('settings');
    setTimeout(() => document.getElementById('cloud-email')?.focus(), 60);
  }

  function showCloudPrompt() {
    if (localStorage.getItem(CLOUD_PROMPT_KEY) === '1') return;
    const t = App.I18n.t.bind(App.I18n);
    const overlay = document.createElement('div');
    overlay.id = 'cloud-onboarding-prompt';
    overlay.className = 'modal-backdrop';
    overlay.innerHTML = `
      <div class="modal-sheet cloud-onboard-modal" role="dialog" aria-modal="true" aria-labelledby="cloud-onboard-title">
        <div id="cloud-onboard-title" class="modal-title">${t('onboard_cloud_title')}</div>
        <p class="settings-row-sub" style="margin:0 0 var(--space-md)">${t('onboard_cloud_sub')}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="App.Onboarding._dismissCloudPrompt()">${t('onboard_cloud_later')}</button>
          <button class="btn btn-primary" onclick="App.Onboarding._setupCloud()">${t('onboard_cloud_setup')}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    App.enhanceModal?.('cloud-onboarding-prompt');
  }

  App.Onboarding = {
    maybeShow,
    _setDraft,
    _finish,
    _dismissCloudPrompt,
    _setupCloud,
  };

})(window.App = window.App || {});
