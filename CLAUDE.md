# Note Clip — Build Rules

## Session startup (every time)
1. Request folder: `C:\Users\david\OneDrive\Documents\GitHub\note-clip`
2. Request computer use: GitHub Desktop (for commit/push)
3. Read this file before touching any code

## What this app is
Personal notes + lists PWA for David. Multi-tab, offline-first, warm paper aesthetic.
Live: https://davidfontenelle80-cloud.github.io/note-clip/

## Stack
- Vanilla JS, no framework, no build step
- IIFE module pattern (window.App namespace)
- localStorage key: `noteClip_v1`
- PWA: manifest + service worker (cache-first)
- Firebase: optional, lazy init (js/firebase/firebase-config.js)

## File load order (DO NOT change)
index.html loads scripts in this exact order:
1. js/i18n.js — translations (no deps)
2. js/storage.js — state (no deps)
3. js/dashboard.js — dashboard tab
4. js/notes.js — notes + categories tab
5. js/lists.js — lists tab
6. js/shared.js — shared tab
7. js/communication.js — communication tab
8. js/settings.js — settings tab
9. js/firebase/firebase-config.js — optional Firebase
10. app.js — tab router (MUST BE LAST)

## Module pattern
Every JS file uses:
```js
(function (App) {
  'use strict';
  App.ModuleName = { render() {}, ... };
})(window.App = window.App || {});
```

## State shape (localStorage key: noteClip_v1)
```js
{
  version: 1,
  settings: { language, theme, username, defaultReminderTime, defaultListBehavior, cloudSync, todayFocus },
  categories: [{ id, name, icon, color }],
  notes: [{ id, title, body, categoryId, color, status, priority, dueDate, dueTime,
             reminder, appointmentName, appointmentDatetime, leaveBy, locationName, address,
             archived, completed, createdAt, updatedAt }],
  lists: [{ id, name, type, items:[{id,text,checked,createdAt}], createdAt }],
  sharedItems: [{ id, title, content, sharedAt }],
  drafts: [{ id, type, context, content, language, createdAt }],
  quickNotes: []
}
```

## Note card colors (cycling, stored on note)
lavender, sky, mint, yellow, coral, peach

## Default categories (no church, no hospital)
Work 💼, Medical 🩺, Personal 👤, Home 🏠, Documents 📄, Follow-Up 🔔, Orders 📦, Ideas 💡

## Deploy rules
- **NEVER run git in bash** — OneDrive mount blocks .git writes
- **Always use GitHub Desktop** (computer use) to commit and push
- **Bump CACHE_VERSION in sw.js** on every deploy
- Verify live: `curl -s "https://davidfontenelle80-cloud.github.io/note-clip/sw.js" | grep CACHE_VERSION`

## Design tokens
See css/styles.css :root block. All values from tokens — no raw hex/px in JS.
Background: #F5F2ED (warm paper). Primary: #C8A96E (warm gold).

## Ship checklist
1. No console errors
2. All 6 tabs render real content
3. Light/dark theme both work
4. Language toggle EN/ES works
5. Notes CRUD works (create, edit, delete visible on card)
6. Categories CRUD works (delete button visible on card)
7. Lists CRUD + items work
8. PWA installs on iPhone Safari
9. CACHE_VERSION bumped
10. Verified live with curl
