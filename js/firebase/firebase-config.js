/**
 * firebase-config.js — Note Clip PWA
 * Firebase initialization — lazy loaded, optional.
 * Uses shared khub-apps project (same as finance-tracker).
 * Activate by setting settings.cloudSync = true in app settings.
 */
(function (App) {
  'use strict';

  const firebaseConfig = {
    apiKey:            "AIzaSyAUiVMxG1JbtpaW3KKmYSsTheMP473uTbQ",
    authDomain:        "khub-apps.firebaseapp.com",
    projectId:         "khub-apps",
    storageBucket:     "khub-apps.firebasestorage.app",
    messagingSenderId: "969605091721",
    appId:             "1:969605091721:web:4068564af7bc0dc56c1158",
  };

  let _initialized = false;

  function init() {
    if (_initialized) return;
    if (typeof firebase === 'undefined') {
      console.warn('[NoteClip.Firebase] Firebase SDK not loaded.');
      return;
    }
    try {
      const fbApp = firebase.apps?.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      const db   = firebase.firestore();
      const auth = firebase.auth();
      App.Firebase = { app: fbApp, db, auth };
      _initialized = true;
      console.log('[NoteClip.Firebase] Initialized.');
    } catch (err) {
      console.error('[NoteClip.Firebase] Init failed:', err);
    }
  }

  App.Firebase = { init };

})(window.App = window.App || {});
