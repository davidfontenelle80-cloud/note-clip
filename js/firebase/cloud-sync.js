/**
 * cloud-sync.js - Note Clip PWA
 * Settings-only Firebase Auth plus manual backup/restore.
 */
(function (App) {
  'use strict';

  const AUTH_URL = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
  const FIRESTORE_URL = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

  let _auth = null;
  let _db = null;
  let _authMod = null;
  let _firestoreMod = null;
  let _initPromise = null;
  let _ready = false;
  let _loading = false;
  let _error = '';
  let _user = null;

  function _setLoading(value) {
    _loading = !!value;
    _emit();
  }

  function _setError(err) {
    _error = _message(err);
    _emit();
  }

  function _clearError() {
    _error = '';
    _emit();
  }

  function _emit() {
    if (App.Settings && App.Settings._refreshCloudStatus) App.Settings._refreshCloudStatus();
  }

  function _message(err) {
    if (!err) return '';
    const code = err.code || '';
    const messages = {
      'auth/email-already-in-use': 'Email is already in use.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/missing-password': 'Enter a password.',
      'auth/weak-password': 'Use at least 6 characters for the password.',
      'auth/network-request-failed': 'Cloud is unavailable. Check your connection.',
      'permission-denied': 'Cloud permission denied. Check Firestore rules.',
      'unavailable': 'Cloud is unavailable. Try again later.',
    };
    return messages[code] || err.message || String(err);
  }

  function _cleanState(state) {
    const source = state || {};
    return {
      version: source.version || 1,
      settings: Object.assign({}, source.settings || {}),
      categories: Array.isArray(source.categories) ? source.categories : [],
      notes: Array.isArray(source.notes) ? source.notes : [],
      lists: Array.isArray(source.lists) ? source.lists : [],
      sharedItems: Array.isArray(source.sharedItems) ? source.sharedItems : [],
      drafts: Array.isArray(source.drafts) ? source.drafts : [],
      quickNotes: Array.isArray(source.quickNotes) ? source.quickNotes : [],
    };
  }

  function _counts(state) {
    return {
      notes: state.notes.length,
      lists: state.lists.length,
      categories: state.categories.length,
    };
  }

  function _backupRef(uid) {
    return _firestoreMod.doc(_db, 'noteClipUsers', uid, 'backups', 'current');
  }

  function init() {
    if (_initPromise) return _initPromise;
    if (!App.Firebase || typeof App.Firebase.init !== 'function') {
      const err = new Error('Cloud setup is unavailable. Refresh the app and try again.');
      _ready = true;
      _setError(err);
      return Promise.reject(err);
    }
    _initPromise = App.Firebase.init()
      .then(app => Promise.all([app, import(AUTH_URL)]))
      .then(([app, mod]) => {
        _authMod = mod;
        _auth = mod.getAuth(app);
        return mod.setPersistence(_auth, mod.browserLocalPersistence).catch(err => {
          console.warn('[NoteClip.Cloud] Auth persistence unavailable.', err);
        });
      })
      .then(() => new Promise(resolve => {
        _authMod.onAuthStateChanged(_auth, user => {
          _user = user || null;
          _ready = true;
          _clearError();
          resolve(_user);
          _emit();
        }, err => {
          _ready = true;
          _setError(err);
          resolve(null);
        });
      }))
      .catch(err => {
        _ready = true;
        _initPromise = null;
        _setError(err);
        throw err;
      });
    return _initPromise;
  }

  function _ensureAuth() {
    return init().then(() => {
      if (!_auth || !_authMod) throw new Error('Cloud auth is unavailable.');
      return _auth;
    });
  }

  function _ensureUser() {
    return _ensureAuth().then(() => {
      if (!_auth.currentUser) throw new Error('Sign in before using cloud backup.');
      _user = _auth.currentUser;
      return _user;
    });
  }

  function _ensureFirestore() {
    return Promise.all([
      _ensureUser(),
      _firestoreMod ? Promise.resolve(_firestoreMod) : import(FIRESTORE_URL),
    ]).then(([user, mod]) => {
      _firestoreMod = mod;
      _db = _db || mod.getFirestore(App.Firebase._app);
      return { user, db: _db, mod };
    });
  }

  function signIn(email, password) {
    _setLoading(true);
    _clearError();
    return _ensureAuth()
      .then(() => _authMod.signInWithEmailAndPassword(_auth, email, password))
      .then(result => {
        _user = result.user;
        return _user;
      })
      .catch(err => {
        _setError(err);
        throw err;
      })
      .finally(() => _setLoading(false));
  }

  function createAccount(email, password) {
    _setLoading(true);
    _clearError();
    return _ensureAuth()
      .then(() => _authMod.createUserWithEmailAndPassword(_auth, email, password))
      .then(result => {
        _user = result.user;
        return _user;
      })
      .catch(err => {
        _setError(err);
        throw err;
      })
      .finally(() => _setLoading(false));
  }

  function signOut() {
    _setLoading(true);
    _clearError();
    return _ensureAuth()
      .then(() => _authMod.signOut(_auth))
      .then(() => {
        _user = null;
      })
      .catch(err => {
        _setError(err);
        throw err;
      })
      .finally(() => _setLoading(false));
  }

  function backupNow() {
    _setLoading(true);
    _clearError();
    return _ensureFirestore()
      .then(({ user, mod }) => {
        const now = new Date().toISOString();
        const state = _cleanState(App.Storage.getState());
        state.settings = Object.assign({}, state.settings, {
          cloudSync: true,
          lastCloudBackupAt: now,
        });
        const payload = {
          app: 'note-clip',
          schemaVersion: 1,
          ownerUid: user.uid,
          ownerEmail: user.email || '',
          updatedAt: mod.serverTimestamp(),
          updatedAtIso: now,
          counts: _counts(state),
          state,
        };
        return mod.setDoc(_backupRef(user.uid), payload, { merge: false }).then(() => {
          App.Storage.updateSettings({ cloudSync: true, lastCloudBackupAt: now });
          return payload;
        });
      })
      .catch(err => {
        _setError(err);
        throw err;
      })
      .finally(() => _setLoading(false));
  }

  function restoreFromCloud() {
    _setLoading(true);
    _clearError();
    return _ensureFirestore()
      .then(({ user, mod }) => mod.getDoc(_backupRef(user.uid)))
      .then(snapshot => {
        if (!snapshot.exists()) throw new Error('No cloud backup found for this account.');
        const data = snapshot.data() || {};
        const restored = _cleanState(data.state);
        const now = new Date().toISOString();
        restored.settings = Object.assign({}, restored.settings || {}, {
          cloudSync: true,
          lastCloudBackupAt: restored.settings.lastCloudBackupAt || data.updatedAtIso || '',
          lastCloudRestoreAt: now,
        });
        App.Storage.setState(restored);
        return restored;
      })
      .catch(err => {
        _setError(err);
        throw err;
      })
      .finally(() => _setLoading(false));
  }

  function getStatus() {
    const settings = App.Storage.getState().settings || {};
    return {
      ready: _ready,
      loading: _loading,
      error: _error,
      cloudAvailable: _ready && !_error,
      user: _user,
      email: _user ? (_user.email || '') : '',
      lastBackupAt: settings.lastCloudBackupAt || '',
      lastRestoreAt: settings.lastCloudRestoreAt || '',
    };
  }

  App.Cloud = {
    init,
    signIn,
    createAccount,
    signOut,
    backupNow,
    restoreFromCloud,
    getStatus,
  };

})(window.App = window.App || {});
