/**
 * theme.js — QuickNotes / KHub pattern
 * Supports: 'dark' | 'light' | 'system'
 * Stored in localStorage under 'qn_theme'.
 */
(function () {
  'use strict';

  const DARK_META  = '#050607';
  const LIGHT_META = '#eef1f5';
  const KEY        = 'qn_theme';

  let _pref = localStorage.getItem(KEY) || 'system';

  function _resolved() {
    if (_pref === 'dark')  return 'dark';
    if (_pref === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(pref) {
    if (pref) {
      _pref = pref;
      localStorage.setItem(KEY, pref);
    }
    const theme = _resolved();
    document.documentElement.setAttribute('data-theme', theme);

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === 'dark' ? DARK_META : LIGHT_META;

    // Update theme selector buttons if rendered
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === _pref);
    });
  }

  function toggle() {
    apply(_resolved() === 'dark' ? 'light' : 'dark');
  }

  function reset() {
    localStorage.removeItem(KEY);
    _pref = 'system';
    apply();
  }

  // React to OS theme changes when on 'system'
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (_pref === 'system') apply();
  });

  window.KHub = window.KHub || {};
  window.KHub.Theme = {
    apply,
    toggle,
    reset,
    get current() { return _pref; },
    get resolved() { return _resolved(); },
  };

  // Apply immediately (before DOM ready) to avoid flash
  apply();
})();
