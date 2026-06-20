/**
 * push.js - Note Clip PWA
 * Handles Web Push subscription and backend reminder sync.
 * Local reminders still work if the background push backend is unavailable.
 */
(function (App) {
  'use strict';

  const WORKER_URL    = 'https://note-clip-push.davidfontenelle80.workers.dev';
  const VAPID_PUB_KEY = 'BGA5XrD1QxrqjItGmiEmDCaOlv38nc8PJo9pumvk5xVHfuVIwVBoEJEbGTWoE4POoazNKgRicX2Dfs-Ppb9uzKA';
  const PUSH_SECRET   = '743eebae9b13fa7cbb54c446beba1c0750ee37e73ea6213d1b235ab7ee4c2341';

  const STORAGE_KEY = 'noteClip_pushSubscriptionId';

  function _headers() {
    return { 'Content-Type': 'application/json', 'X-Push-Secret': PUSH_SECRET };
  }

  function getSubscriptionId() {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch(e) { return ''; }
  }

  function _setSubscriptionId(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch(e) {}
  }

  function _clearSubscriptionId() {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  }

  function _urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw     = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Background push is not supported on this browser.');
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: _urlB64ToUint8Array(VAPID_PUB_KEY),
        });
      }

      const json = sub.toJSON();
      const resp = await fetch(`${WORKER_URL}/api/subscribe`, {
        method: 'POST',
        headers: _headers(),
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (!resp.ok) {
        _clearSubscriptionId();
        throw new Error('Background notification server rejected the subscription.');
      }

      const { subscriptionId } = await resp.json();
      if (!subscriptionId) {
        _clearSubscriptionId();
        throw new Error('Background notification server did not return a subscription id.');
      }
      _setSubscriptionId(subscriptionId);
      return subscriptionId;
    } catch (e) {
      _clearSubscriptionId();
      console.warn('[NoteClip.Push] Background push subscription failed.', e);
      throw e;
    }
  }

  async function _ensureSubscriptionId() {
    return getSubscriptionId() || await subscribe();
  }

  async function sendTestPush() {
    const subscriptionId = await _ensureSubscriptionId();
    const fireAt = Math.floor(Date.now() / 1000) + 10;
    const resp = await fetch(`${WORKER_URL}/api/reminders`, {
      method: 'POST',
      headers: _headers(),
      body: JSON.stringify({
        subscriptionId,
        title: 'Note Clip Reminder',
        body: 'Background notification test.',
        fireAt,
        sourceType: 'test',
        sourceId: 'settings-test-' + Date.now(),
      }),
    });
    if (!resp.ok) {
      throw new Error('Background notification test could not be scheduled.');
    }
    return fireAt;
  }

  async function diagnose() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { supported: false, connected: false };
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return { supported: true, connected: !!sub && !!getSubscriptionId() };
    } catch(e) {
      return { supported: true, connected: false };
    }
  }

  async function syncReminder(sourceType, sourceId, title, body, fireAt) {
    const subscriptionId = getSubscriptionId();
    if (!subscriptionId) return false;
    try {
      const resp = await fetch(`${WORKER_URL}/api/reminders`, {
        method: 'POST',
        headers: _headers(),
        body: JSON.stringify({ subscriptionId, title, body: body || '', fireAt, sourceType, sourceId }),
      });
      return resp.ok;
    } catch (e) {
      console.warn('[NoteClip.Push] Reminder sync failed.', e);
      return false;
    }
  }

  async function clearReminder(sourceType, sourceId) {
    try {
      const subscriptionId = getSubscriptionId();
      const url = new URL(`${WORKER_URL}/api/reminders/${sourceType}/${encodeURIComponent(sourceId)}`);
      if (subscriptionId) url.searchParams.set('subscriptionId', subscriptionId);
      await fetch(url.toString(), {
        method: 'DELETE',
        headers: _headers(),
      });
    } catch (e) {
      console.warn('[NoteClip.Push] Reminder clear failed.', e);
    }
  }

  App.Push = { subscribe, syncReminder, clearReminder, getSubscriptionId, sendTestPush, diagnose };

})(window.App = window.App || {});
