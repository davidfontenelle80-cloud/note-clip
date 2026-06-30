(function (App) {
  'use strict';

  const ROUTE_KEY = 'noteclip_pending_notification_route';

  function routeFromLocation() {
    try {
      const u = new URL(window.location.href);
      const tab = u.searchParams.get('tab') || u.searchParams.get('screen');
      if (tab !== 'notes') return null;
      return {
        type: 'NOTIFICATION_CLICK_ROUTE',
        tab: 'notes',
        sourceType: u.searchParams.get('sourceType') || 'note',
        sourceId: u.searchParams.get('sourceId') || u.searchParams.get('noteId') || '',
      };
    } catch (e) {
      return null;
    }
  }

  function remember(route) {
    if (!route || route.tab !== 'notes') return;
    try { sessionStorage.setItem(ROUTE_KEY, JSON.stringify(route)); } catch (e) {}
  }

  function pending() {
    const fromUrl = routeFromLocation();
    if (fromUrl) return fromUrl;
    try {
      const raw = sessionStorage.getItem(ROUTE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clear() {
    try { sessionStorage.removeItem(ROUTE_KEY); } catch (e) {}
    try {
      const u = new URL(window.location.href);
      const tab = u.searchParams.get('tab') || u.searchParams.get('screen');
      if (tab === 'notes') {
        u.searchParams.delete('tab');
        u.searchParams.delete('screen');
        u.searchParams.delete('sourceType');
        u.searchParams.delete('sourceId');
        u.searchParams.delete('noteId');
        if (u.hash === '#notification') u.hash = '';
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      }
    } catch (e) {}
  }

  function apply(route, attempt) {
    attempt = attempt || 0;
    if (!route || route.tab !== 'notes') return false;
    if (!App || typeof App.showTab !== 'function') {
      if (attempt < 20) setTimeout(() => apply(route, attempt + 1), 150);
      return false;
    }
    try {
      App.showTab('notes');
      if (route.sourceId && App.Notes && typeof App.Notes._editNote === 'function') {
        setTimeout(() => App.Notes._editNote(route.sourceId), 250);
      }
      clear();
      return true;
    } catch (e) {
      console.warn('[NoteClip] Notification route failed:', e);
      if (attempt < 20) setTimeout(() => apply(route, attempt + 1), 150);
      return false;
    }
  }

  function schedule() {
    const route = pending();
    if (!route) return;
    remember(route);
    setTimeout(() => apply(route), 350);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK_ROUTE') {
        remember(event.data);
        apply(event.data);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', schedule);

  App.NotificationRoute = { apply, schedule };
})(window.App = window.App || {});
