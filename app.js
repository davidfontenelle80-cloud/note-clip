/**
 * app.js — Note Clip PWA
 * Tab router, SW registration, global helpers (showToast, applyTheme, refreshCurrentTab).
 * Load LAST — all feature modules must be loaded first.
 */
(function (App) {
  'use strict';

  const TABS = ['dashboard','notes','lists','shared','communication','settings'];
  let _activeTab = 'dashboard';

  // ── Tab routing ──────────────────────────────────────────────────
  function showTab(name) {
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
      shared:        () => App.Shared?.render(),
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
      shared:        () => App.Shared?.onFab(),
      communication: () => App.Communication?.onFab(),
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
    document.addEventListener('keydown', e => {
      // Escape closes any open modal
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

    // Apply saved language
    App.I18n.set(state.settings.language || 'en');

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

    console.log('[NoteClip] App ready.');
  }

  // Expose globals
  Object.assign(App, { showTab, refreshCurrentTab, showToast, applyTheme, onFab, enhanceModal, restoreFocus });

  document.addEventListener('DOMContentLoaded', init);

})(window.App = window.App || {});
