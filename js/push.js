/**
 * push.js — Note Clip PWA
 * Handles Web Push subscription and backend reminder sync.
 * All calls are fire-and-forget; failures are silent (local reminders still work).
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

  function _urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw     = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  /**
   * Called when the user grants notification permission.
   * Subscribes to push, posts subscription to the Worker, stores subscriptionId.
   */
  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: _urlB64ToUint8Array(VAPID_PUB_KEY),
      });
      const json = sub.toJSON();
      const resp = await fetch(`${WORKER_URL}/api/subscribe`, {
        method:  'POST',
        headers: _headers(),
        body:    JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (resp.ok) {
        const { subscriptionId } = await resp.json();
        _setSubscriptionId(subscriptionId);
      }
    } catch (e) {
      // Silent — foreground reminders still work
    }
  }

  /**
   * Sync a reminder to the Worker backend.
   * @param {string} sourceType  'note' | 'list_item' | 'task'
   * @param {string} sourceId    note.id or `${listId}_${itemId}`
   * @param {string} title       push notification title
   * @param {string|null} body   push notification body (optional)
   * @param {number} fireAt      unix timestamp in seconds
   */
  async function syncReminder(sourceType, sourceId, title, body, fireAt) {
    const subscriptionId = getSubscriptionId();
    if (!subscriptionId) return; // push not enabled — skip
    try {
      await fetch(`${WORKER_URL}/api/reminders`, {
        method:  'POST',
        headers: _headers(),
        body:    JSON.stringify({ subscriptionId, title, body: body || '', fireAt, sourceType, sourceId }),
      });
    } catch (e) { /* silent */ }
  }

  /**
   * Remove a reminder from the Worker backend (note completed/deleted or reminder cleared).
   */
  async function clearReminder(sourceType, sourceId) {
    try {
      await fetch(`${WORKER_URL}/api/reminders/${sourceType}/${encodeURIComponent(sourceId)}`, {
        method:  'DELETE',
        headers: _headers(),
      });
    } catch (e) { /* silent */ }
  }

  App.Push = { subscribe, syncReminder, clearReminder, getSubscriptionId };

})(window.App = window.App || {});
