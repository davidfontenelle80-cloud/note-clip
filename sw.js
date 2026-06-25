const CACHE_VERSION = 'note-clip-v63';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/i18n.js',
  './js/storage.js',
  './js/dashboard.js',
  './js/notes.js',
  './js/lists.js',
  './js/shared.js',
  './js/communication.js',
  './js/calendar.js',
  './js/push.js',
  './js/reminders.js',
  './js/settings.js',
  './js/firebase/firebase-config.js',
  './js/firebase/cloud-sync.js',
  './js/onboarding.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const LEGACY_CALENDAR_NAV_ICON = '<span class="nav-icon nav-stationery nav-calendar" aria-hidden="true"><span class="nav-glyph"></span></span>';
const CONSISTENT_CALENDAR_NAV_ICON = `<svg width="24" height="24" viewBox="0 0 28 28" class="nav-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="5" y="6" width="18" height="17" rx="2" fill="currentColor" fill-opacity="0.08"/>
  <rect x="5" y="6" width="18" height="17" rx="2"/>
  <line x1="9" y1="3.5" x2="9" y2="8"/>
  <line x1="19" y1="3.5" x2="19" y2="8"/>
  <line x1="5" y1="11" x2="23" y2="11"/>
  <line x1="9" y1="15" x2="11" y2="15"/>
  <line x1="14" y1="15" x2="16" y2="15"/>
  <line x1="19" y1="15" x2="21" y2="15"/>
  <line x1="9" y1="19" x2="11" y2="19"/>
  <line x1="14" y1="19" x2="16" y2="19"/>
</svg>`;

const NAV_STYLE_ID = 'noteclip-light-nav-force-refresh';
const PAPER_STYLE_ID = 'noteclip-icon-paper-cards';

const INJECTED_STYLE = `<style id="${NAV_STYLE_ID}">
  .bottom-nav {
    align-items: center !important;
    justify-content: space-around !important;
    gap: 4px !important;
    padding: 8px 12px max(8px, env(safe-area-inset-bottom, 0px)) !important;
    height: var(--bottom-nav-height) !important;
    overflow: visible !important;
  }
  html:not([data-theme="dark"]) .bottom-nav {
    background:
      radial-gradient(circle at 16% 0%, rgba(255,255,255,.50) 0, rgba(255,255,255,.18) 30%, transparent 58%),
      linear-gradient(180deg, rgba(246,239,220,.96), rgba(225,207,160,.96)) !important;
    border-top-color: rgba(118,82,22,.26) !important;
    box-shadow: 0 -12px 28px rgba(103,73,26,.18), inset 0 1px 0 rgba(255,255,255,.76), inset 0 -1px 0 rgba(112,77,18,.08) !important;
  }
  html[data-theme="dark"] .bottom-nav {
    background: linear-gradient(180deg, rgba(42,35,22,.96), rgba(20,17,12,.98)) !important;
    border-top-color: rgba(238,198,91,.28) !important;
    box-shadow: 0 -14px 30px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,230,155,.12) !important;
  }
  .nav-tab {
    position: relative !important;
    flex: 1 1 0 !important;
    width: auto !important;
    max-width: 86px !important;
    min-width: 0 !important;
    min-height: 58px !important;
    padding: 6px 4px 5px !important;
    margin: 0 !important;
    gap: 4px !important;
    overflow: visible !important;
    border-radius: 18px !important;
    font-weight: 800 !important;
    background: transparent !important;
    border: 1px solid transparent !important;
    box-shadow: none !important;
    transform: none !important;
    transition: background .18s ease, box-shadow .18s ease, transform .18s ease, color .18s ease !important;
  }
  .nav-tab::before { content: none !important; display: none !important; }
  html:not([data-theme="dark"]) .nav-tab { color: #4b3513 !important; text-shadow: 0 1px 0 rgba(255,255,255,.75) !important; }
  html[data-theme="dark"] .nav-tab { color: #d7bd73 !important; text-shadow: 0 1px 2px rgba(0,0,0,.72) !important; }
  .nav-tab > span[data-i18n] {
    max-width: 100% !important;
    width: 100% !important;
    overflow: hidden !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
    font-size: 11px !important;
    line-height: 1.05 !important;
    font-weight: 850 !important;
    text-align: center !important;
  }
  .nav-tab[data-tab="dashboard"] > span[data-i18n],
  .nav-tab[data-tab="calendar"] > span[data-i18n],
  .nav-tab[data-tab="settings"] > span[data-i18n] {
    font-size: 10px !important;
    letter-spacing: -.25px !important;
  }
  html:not([data-theme="dark"]) .nav-tab > span[data-i18n] { color: #4b3513 !important; }
  html[data-theme="dark"] .nav-tab > span[data-i18n] { color: #d7bd73 !important; }
  .nav-tab > svg.nav-icon {
    box-sizing: border-box !important;
    width: 34px !important;
    height: 32px !important;
    padding: 5px !important;
    border-radius: 11px !important;
    margin: 0 auto !important;
    transition: background .18s ease, box-shadow .18s ease, transform .18s ease, filter .18s ease !important;
  }
  html:not([data-theme="dark"]) .nav-tab > svg.nav-icon {
    color: #2b1c05 !important;
    background: linear-gradient(145deg,#fff6c1 0%,#ffe58d 56%,#d7ae42 100%) !important;
    border: 1px solid rgba(83,57,12,.30) !important;
    box-shadow: inset 1px 1px 0 rgba(255,255,255,.78), inset -1px -1px 0 rgba(108,73,14,.14), 0 4px 7px rgba(93,64,16,.18) !important;
  }
  html[data-theme="dark"] .nav-tab > svg.nav-icon {
    color: #f2d277 !important;
    background: linear-gradient(145deg,#6f5620 0%,#3f3118 62%,#251d11 100%) !important;
    border: 1px solid rgba(238,198,91,.35) !important;
    box-shadow: inset 1px 1px 0 rgba(255,230,155,.16), inset -1px -1px 0 rgba(0,0,0,.34), 0 5px 8px rgba(0,0,0,.40) !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active {
    color: #1d1102 !important;
    background: rgba(255, 224, 128, .20) !important;
    border-color: rgba(139,88,8,.20) !important;
    box-shadow: 0 0 0 5px rgba(255,224,128,.13), 0 8px 18px rgba(91,58,8,.18), inset 0 1px 0 rgba(255,255,255,.50) !important;
    transform: translateY(-2px) !important;
  }
  html[data-theme="dark"] .nav-tab.active {
    color: #fff0b8 !important;
    background: rgba(126,89,20,.30) !important;
    border-color: rgba(244,198,83,.28) !important;
    box-shadow: 0 0 0 5px rgba(255,214,105,.10), 0 8px 18px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,233,161,.13) !important;
    transform: translateY(-2px) !important;
  }
  .nav-tab.active::after {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    bottom: 1px !important;
    width: 7px !important;
    height: 7px !important;
    transform: translateX(-50%) !important;
    border-radius: 50% !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active::after { background:#5d3700 !important; box-shadow:0 0 0 3px rgba(255,236,162,.55),0 2px 4px rgba(83,50,3,.20) !important; }
  html[data-theme="dark"] .nav-tab.active::after { background:#ffd76a !important; box-shadow:0 0 0 3px rgba(255,215,106,.18),0 0 10px rgba(255,207,78,.34),0 2px 4px rgba(0,0,0,.40) !important; }
  .nav-tab.active > span[data-i18n] { font-weight: 900 !important; }
  html:not([data-theme="dark"]) .nav-tab.active > span[data-i18n] { color:#1d1102 !important; }
  html[data-theme="dark"] .nav-tab.active > span[data-i18n] { color:#fff0b8 !important; }
  .nav-tab.active > svg.nav-icon {
    transform: scale(1.06) !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active > svg.nav-icon {
    color:#120a01 !important;
    background: linear-gradient(145deg,#fff3aa 0%,#ffc93e 52%,#b87405 100%) !important;
    border-color: rgba(89,51,0,.52) !important;
    box-shadow: 0 0 0 4px rgba(255,233,145,.32), 0 0 18px rgba(255,205,73,.32), inset 1px 1px 0 rgba(255,255,255,.78), inset -1px -1px 0 rgba(85,55,8,.22), 0 7px 10px rgba(102,66,10,.28) !important;
  }
  html[data-theme="dark"] .nav-tab.active > svg.nav-icon {
    color:#fff3bd !important;
    background: linear-gradient(145deg,#b37c14 0%,#79520d 52%,#38240a 100%) !important;
    border-color: rgba(255,213,95,.50) !important;
    box-shadow: 0 0 0 4px rgba(255,214,105,.13), 0 0 18px rgba(255,207,78,.25), inset 1px 1px 0 rgba(255,233,161,.20), inset -1px -1px 0 rgba(0,0,0,.32), 0 8px 13px rgba(0,0,0,.52) !important;
  }
</style>
<style id="${PAPER_STYLE_ID}">
  :root {
    --real-paper-bg: #fff1be;
    --real-paper-deep: #cfa23e;
    --real-paper-ink: #211d15;
    --real-paper-muted: rgba(33,29,21,.66);
    --real-paper-edge: rgba(122,95,49,.36);
    --real-paper-shadow: rgba(44,36,22,.25);
    --real-paper-contact: rgba(38,31,20,.34);
    --real-clip: rgba(245,248,249,.50);
    --real-clip-edge: rgba(101,110,116,.42);
  }
  html[data-theme="dark"] {
    --real-paper-bg: #d6bc57;
    --real-paper-deep: #806822;
    --real-paper-ink: #171204;
    --real-paper-muted: rgba(23,18,4,.66);
    --real-paper-edge: rgba(255,226,120,.20);
    --real-paper-shadow: rgba(0,0,0,.52);
    --real-paper-contact: rgba(0,0,0,.55);
    --real-clip: rgba(235,238,238,.42);
    --real-clip-edge: rgba(216,224,226,.30);
  }
  .focus-card,
  .quick-note-card,
  .note-card,
  .category-card,
  .list-card,
  .mini-calendar,
  .settings-section,
  .share-card,
  .card,
  .modal-sheet {
    position: relative !important;
    overflow: visible !important;
    isolation: isolate !important;
    border-radius: 34px !important;
    border: 1px solid var(--real-paper-edge) !important;
    color: var(--real-paper-ink) !important;
    background:
      radial-gradient(circle at 17% 15%, rgba(255,255,255,.58) 0, rgba(255,255,255,.28) 18%, transparent 48%),
      radial-gradient(circle at 82% 86%, color-mix(in srgb, var(--paper-deep, var(--real-paper-deep)) 34%, transparent) 0, transparent 42%),
      linear-gradient(145deg, #fff9ce 0%, var(--paper-bg, var(--real-paper-bg)) 58%, var(--paper-deep, var(--real-paper-deep)) 100%) !important;
    box-shadow:
      0 2px 4px rgba(255,255,255,.42) inset,
      1px 1px 0 rgba(255,255,255,.50) inset,
      -1px -1px 0 rgba(98,70,24,.10) inset,
      0 3px 4px rgba(105,75,28,.09),
      0 16px 26px var(--real-paper-shadow),
      9px 21px 34px rgba(38,34,25,.16),
      0 20px 0 -14px var(--real-paper-contact) !important;
  }
  .focus-card,
  .quick-note-card,
  .note-card,
  .category-card,
  .list-card { padding-top: max(var(--space-md), 20px) !important; }
  .focus-card::before,
  .quick-note-card::before,
  .modal-sheet::before {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    top: -44px !important;
    z-index: 8 !important;
    width: 62px !important;
    height: 96px !important;
    transform: translateX(-50%) !important;
    border-radius: 22px 22px 28px 28px !important;
    border: 3px solid var(--real-clip-edge) !important;
    border-top-color: rgba(255,255,255,.62) !important;
    background:
      linear-gradient(90deg, rgba(255,255,255,.45), transparent 20%, transparent 78%, rgba(80,90,96,.10)),
      linear-gradient(180deg, rgba(255,255,255,.64), var(--real-clip) 52%, rgba(130,140,146,.18)) !important;
    box-shadow: 5px 9px 12px rgba(42,38,30,.18), inset 2px 2px 0 rgba(255,255,255,.42), inset -1px -1px 0 rgba(70,80,86,.10) !important;
    pointer-events: none !important;
  }
  .focus-card::before { width: 30px !important; height: 44px !important; top: -17px !important; border-radius: 12px 12px 17px 17px !important; border-width: 2px !important; opacity: .82 !important; }
  .note-card::before,
  .category-card::before,
  .list-card::before,
  .mini-calendar::before,
  .settings-section::before,
  .share-card::before,
  .card::before {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    top: -11px !important;
    z-index: 8 !important;
    width: 22px !important;
    height: 32px !important;
    transform: translateX(-50%) !important;
    border-radius: 9px 9px 14px 14px !important;
    border: 2px solid var(--real-clip-edge) !important;
    background: linear-gradient(180deg, rgba(255,255,255,.52), var(--real-clip)) !important;
    box-shadow: 3px 5px 9px rgba(42,38,30,.14), inset 1px 1px 0 rgba(255,255,255,.34) !important;
    opacity: .54 !important;
    pointer-events: none !important;
  }
  .focus-card::after,
  .quick-note-card::after,
  .note-card::after,
  .category-card::after,
  .list-card::after,
  .mini-calendar::after,
  .settings-section::after,
  .share-card::after,
  .card::after,
  .modal-sheet::after {
    content: none !important;
    display: none !important;
  }
  .note-card[data-color="lavender"] { --paper-bg:#efe4ff; --paper-deep:#b89bd8; }
  .note-card[data-color="sky"]      { --paper-bg:#e0f3ff; --paper-deep:#8dbddb; }
  .note-card[data-color="mint"]     { --paper-bg:#e4f6dc; --paper-deep:#9fc77b; }
  .note-card[data-color="yellow"]   { --paper-bg:#fff1be; --paper-deep:#cfa23e; }
  .note-card[data-color="coral"]    { --paper-bg:#ffd7cf; --paper-deep:#d4897a; }
  .note-card[data-color="peach"]    { --paper-bg:#ffe2be; --paper-deep:#d79b55; }
  .category-card:nth-child(6n+1) { --paper-bg:#fff1be; --paper-deep:#cfa23e; }
  .category-card:nth-child(6n+2) { --paper-bg:#efe4ff; --paper-deep:#b89bd8; }
  .category-card:nth-child(6n+3) { --paper-bg:#e4f6dc; --paper-deep:#9fc77b; }
  .category-card:nth-child(6n+4) { --paper-bg:#e0f3ff; --paper-deep:#8dbddb; }
  .category-card:nth-child(6n+5) { --paper-bg:#ffe2be; --paper-deep:#d79b55; }
  .category-card:nth-child(6n+6) { --paper-bg:#ffd7cf; --paper-deep:#d4897a; }
  .quick-note-card, .focus-card { --paper-bg:#fff0ba; --paper-deep:#c89531; }
  .list-card { --paper-bg:#fff4ca; --paper-deep:#c8a14a; }
  .mini-calendar { --paper-bg:#f7e7bd; --paper-deep:#c8a962; }
  .settings-section { --paper-bg:#fff7db; --paper-deep:#d0b263; }
  html[data-theme="dark"] .note-card[data-color="lavender"] { --paper-bg:#765d96; --paper-deep:#37284c; }
  html[data-theme="dark"] .note-card[data-color="sky"]      { --paper-bg:#527c9e; --paper-deep:#17314d; }
  html[data-theme="dark"] .note-card[data-color="mint"]     { --paper-bg:#628b62; --paper-deep:#183b23; }
  html[data-theme="dark"] .note-card[data-color="yellow"]   { --paper-bg:#d2b84f; --paper-deep:#735f18; }
  html[data-theme="dark"] .note-card[data-color="coral"]    { --paper-bg:#aa6759; --paper-deep:#4b241d; }
  html[data-theme="dark"] .note-card[data-color="peach"]    { --paper-bg:#bd8345; --paper-deep:#51320f; }
  .note-card-title, .category-name, .list-title, .focus-label, .section-title, .modal-title { color: var(--real-paper-ink) !important; }
  .note-card-body, .category-count, .list-item-text, .focus-input, .quick-note-input, .settings-row-sub { color: var(--real-paper-muted) !important; }
  .quick-note-input, .focus-input, .list-add-input, .form-input, .form-textarea, .form-select {
    background: rgba(255,252,224,.34) !important;
    border-color: rgba(112,77,18,.14) !important;
    box-shadow: inset 0 1px 2px rgba(75,53,18,.06), inset 0 1px 0 rgba(255,255,255,.44) !important;
  }
  .list-card-header, .quick-note-actions, .settings-section-label, .settings-row, .list-item, .modal-actions.sticky-actions {
    background: rgba(255,250,214,.15) !important;
    border-color: rgba(112,77,18,.12) !important;
  }
  .note-card:hover, .category-card:hover, .list-card:hover, .card:hover {
    transform: translateY(-3px) !important;
    box-shadow:
      0 2px 4px rgba(255,255,255,.45) inset,
      1px 1px 0 rgba(255,255,255,.55) inset,
      0 4px 6px rgba(105,75,28,.10),
      0 20px 34px var(--real-paper-shadow),
      13px 26px 44px rgba(38,34,25,.18),
      0 23px 0 -15px var(--real-paper-contact) !important;
  }
</style>`;

function shouldPatchHtml(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}

function patchInjectedStyles(html) {
  html = html.replace(/<style id="noteclip-light-nav-force-refresh">[\s\S]*?<\/style>/, '');
  html = html.replace(/<style id="noteclip-icon-paper-cards">[\s\S]*?<\/style>/, '');
  const styles = INJECTED_STYLE;
  if (html.includes('</head>')) return html.replace('</head>', `${styles}\n</head>`);
  return styles + html;
}

async function patchHtmlResponse(request, response) {
  if (!response || !response.ok || !shouldPatchHtml(request)) return response;

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('text/html')) return response;

  let html = await response.text();
  if (html.includes(LEGACY_CALENDAR_NAV_ICON)) {
    html = html.replace(LEGACY_CALENDAR_NAV_ICON, CONSISTENT_CALENDAR_NAV_ICON);
  }
  html = patchInjectedStyles(html);

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function precache() {
  const cache = await caches.open(CACHE_VERSION);
  await Promise.all(PRECACHE_URLS.map(async url => {
    const request = new Request(url, { cache: 'reload' });
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, await patchHtmlResponse(request, response));
    }
  }));
}

self.addEventListener('install', event => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()).then(() => {
    self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'RELOAD_READY' }));
    });
  }));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(caches.match(event.request).then(async cached => {
    if (cached) return patchHtmlResponse(event.request, cached);

    const response = await fetch(event.request);
    if (response.ok) {
      const normalized = await patchHtmlResponse(event.request, response.clone());
      const cacheClone = normalized.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(event.request, cacheClone));
      return normalized;
    }
    return response;
  }));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Background push notifications ────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Note Clip Reminder', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      tag:  data.tag  || 'note-clip-reminder',
    })
  );
});
