/**
 * firebase-config.js - Note Clip PWA
 * Firebase initialization - lazy loaded, optional.
 * Uses shared khub-apps project (same as finance-tracker).
 * Activate by setting settings.cloudSync = true in app settings.
 *
 * SECURITY NOTE: The apiKey below is a Firebase Web API Key.
 * Firebase Web API Keys are intentionally public and client-side -
 * they identify the app to Firebase, NOT grant admin access.
 * Real security is enforced by Firestore security rules.
 * See: https://firebase.google.com/docs/projects/api-keys
 * GitHub secret alert for this file can be dismissed as "False positive".
 */
(function (App) {
  'use strict';

  const APP_URL = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

  const firebaseConfig = {
    apiKey:            "AIzaSyAUiVMxG1JbtpaW3KKmYSsTheMP473uTbQ",
    authDomain:        "khub-apps.firebaseapp.com",
    projectId:         "khub-apps",
    storageBucket:     "khub-apps.firebasestorage.app",
    messagingSenderId: "969605091721",
    appId:             "1:969605091721:web:4068564af7bc0dc56c1158",
  };

  let _initPromise = null;

  // Returns a Promise that resolves with the Firebase App instance.
  // cloud-sync.js calls App.Firebase.init().then(app => ...) so this MUST
  // return a Promise.  It also reads App.Firebase._app (underscore), so we
  // expose the app under both names.
  function init() {
    if (_initPromise) return _initPromise;
    _initPromise = import(APP_URL)
      .then(function (mod) {
        var apps = mod.getApps ? mod.getApps() : [];
        var fbApp = apps.length ? mod.getApp() : mod.initializeApp(firebaseConfig);
        // cloud-sync.js uses App.Firebase._app in _ensureFirestore
        App.Firebase.app  = fbApp;
        App.Firebase._app = fbApp;
        console.log('[NoteClip.Firebase] Initialized.');
        return fbApp;
      })
      .catch(function (err) {
        console.error('[NoteClip.Firebase] Init failed:', err);
        _initPromise = null;
        throw err;
      });
    return _initPromise;
  }

  App.Firebase = { init };

})(window.App = window.App || {});
