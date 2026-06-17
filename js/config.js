/**
 * config.js — QuickNotes / KHub pattern
 * Establishes window.KHub namespace, feature flags, and conditional logging.
 */
(function () {
  'use strict';

  const isDev = ['localhost', '127.0.0.1', ''].includes(location.hostname) ||
                location.protocol === 'file:';

  window.KHub = window.KHub || {};

  const _listeners = {};

  window.KHub.on = function (event, fn) {
    (_listeners[event] = _listeners[event] || []).push(fn);
  };
  window.KHub.off = function (event, fn) {
    if (_listeners[event]) _listeners[event] = _listeners[event].filter(f => f !== fn);
  };
  window.KHub.emit = function (event, data) {
    (_listeners[event] || []).forEach(fn => { try { fn(data); } catch (e) { console.error('[KHub event]', event, e); } });
  };

  window.KHub.Config = {
    appName:    'QuickNotes',
    version:    '1.0.0',
    repo:       'davidfontenelle80-cloud/quick-notes',
    isDev,
    isProd:     !isDev,
    features: {
      auth:     false,
      firebase: false,
    },
    log:  (...a) => { if (isDev) console.log('[QuickNotes]', ...a); },
    warn: (...a) => { if (isDev) console.warn('[QuickNotes]', ...a); },
  };
})();
