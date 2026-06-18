/**
 * firebase-config.js - Note Clip PWA
 * Optional Firebase initialization. This only prepares the Firebase app;
 * auth, backup, restore, and sync flows must call App.Firebase.init().
 */
(function (App) {
  'use strict';

  const firebaseConfig = {
    apiKey:            'AIzaSyAUiVMxG1JbtpaW3KKmYSsTheMP473uTbQ',
    authDomain:        'khub-apps.firebaseapp.com',
    projectId:         'khub-apps',
    storageBucket:     'khub-apps.firebasestorage.app',
    messagingSenderId: '969605091721',
    appId:             '1:969605091721:web:4068564af7bc0dc56c1158',
  };

  App.Firebase = {
    _app: null,
    _initialized: false,

    init() {
      if (this._initialized) return Promise.resolve(this._app);

      return import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js')
        .then(({ getApps, initializeApp }) => {
          this._app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
          this._initialized = true;
          console.log('[NoteClip.Firebase] Initialized.');
          return this._app;
        })
        .catch(err => {
          console.warn('[NoteClip.Firebase] Init failed; offline mode active.', err);
          throw err;
        });
    },
  };

})(window.App = window.App || {});
