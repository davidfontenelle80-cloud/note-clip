# Note Clip - Build Rules

## Session startup (every time)
1. Request folder: `C:\Users\david\OneDrive\Documents\GitHub\note-clip`
2. Request computer use: GitHub Desktop (for commit/push)
3. Read this file before touching any code
4. Confirm the local checkout matches remote before editing. At minimum compare the latest commit hash and `sw.js` `CACHE_VERSION` against remote/live GitHub Pages. If OneDrive is stale, do not edit or push it; start from a fresh remote checkout and preserve remote source as the source of truth.

## What this app is
Personal notes + lists PWA for David. Multi-tab, offline-first, warm paper aesthetic.
Live: https://davidfontenelle80-cloud.github.io/note-clip/

## Stack
- Vanilla JS, no framework, no build step
- IIFE module pattern (window.App namespace)
- localStorage key: `noteClip_v1`
- PWA: manifest + service worker (cache-first)
- Firebase: optional, lazy init (`js/firebase/firebase-config.js`)
- Cloudflare Worker + D1: optional background Web Push for reminders

## File load order (DO NOT change)
index.html loads scripts in this exact order:
1. `js/i18n.js` - translations (no deps)
2. `js/storage.js` - state (no deps)
3. `js/dashboard.js` - dashboard tab
4. `js/calendar.js` - calendar tab
5. `js/notes.js` - notes + categories tab
6. `js/lists.js` - lists tab
7. `js/communication.js` - communication tools
8. `js/settings.js` - settings tab
9. `js/firebase/firebase-config.js` - optional Firebase
10. `js/firebase/cloud-sync.js` - optional Firebase backup/restore
11. `js/push.js` - Cloudflare Web Push client
12. `js/reminders.js` - local reminders + notification wiring
13. `js/onboarding.js` - onboarding prompts
14. `app.js` - tab router (MUST BE LAST)

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
  settings: { language, theme, username, defaultReminderTime, defaultListBehavior, cloudSync, todayFocus, weatherEnabled },
  categories: [{ id, name, icon, color }],
  notes: [{ id, title, body, categoryId, color, status, priority, dueDate, dueTime,
             reminder, reminderAt, appointmentName, appointmentDatetime, leaveBy, locationName, address,
             archived, completed, createdAt, updatedAt }],
  lists: [{ id, name, type, items:[{id,text,checked,createdAt,reminderAt}], createdAt }],
  sharedItems: [{ id, title, content, sharedAt }],
  drafts: [{ id, type, context, content, language, createdAt }],
  quickNotes: []
}
```

## Note card colors (cycling, stored on note)
lavender, sky, mint, yellow, coral, peach

## Default categories (no church, no hospital)
Work, Medical, Personal, Home, Documents, Follow-Up, Orders, Ideas.

Icons belong to categories only. Add/Edit Note must not include icon selection.

## Deploy rules
- **NEVER run git in bash** - OneDrive mount blocks `.git` writes
- **Always use GitHub Desktop** (computer use) to commit and push from the OneDrive checkout
- It is acceptable to inspect or repair from a fresh temp checkout, but do not push stale OneDrive files over remote
- **Bump CACHE_VERSION in sw.js** on every deploy that changes app files
- Verify live: `curl -s "https://davidfontenelle80-cloud.github.io/note-clip/sw.js" | grep CACHE_VERSION`
- Before committing from any checkout, confirm `js/firebase/cloud-sync.js` is the real Firebase implementation from remote, not a local stub. Never overwrite the real cloud sync file with a no-op placeholder.

## Cloudflare Push + Firebase Boundaries
- Background reminder notifications use Cloudflare Worker + D1 + Web Push. This is separate from Firebase and must not read, write, or share data with the Firebase `khub-apps` backup project.
- Firebase is optional cloud backup/restore only. Keep `js/firebase/firebase-config.js` and `js/firebase/cloud-sync.js` isolated from Cloudflare push work.
- VAPID public keys may be embedded in client JS. VAPID private keys, Cloudflare API tokens, Worker deployment tokens, and real backend secrets must never be committed or pasted into repo docs.
- Any client-side shared-secret header is only a basic abuse filter because public JS can expose it. Treat it as non-secret from a security perspective; real secrets live in Worker environment variables/secrets.
- If a Cloudflare Worker is added to this repo, include `wrangler.toml`, D1 migrations/schema, Worker source, cron trigger config, and setup notes that explain required secret names without exposing secret values.
- Background push must be tested on installed PWAs, not only desktop browser permission. Required proof: subscribe, schedule a reminder, fully close/force-quit the app, lock the phone, and confirm the notification arrives at the scheduled time.
- Reminder CRUD must stay consistent across local and backend paths: saving a reminder upserts it in D1, editing changes the existing backend reminder, and completing/deleting/clearing a note or list item deletes the backend reminder.
- If Cloudflare push fails, local/foreground reminders must keep working. Surface connection/test failures clearly in Settings, but do not break note/list save flows.

## Design tokens
See `css/styles.css` `:root` block. All values from tokens - no raw hex/px in JS.
Background: `#F5F2ED` (warm paper). Primary: `#C8A96E` (warm gold).

## Ship checklist
1. No console errors
2. All visible tabs render real content
3. Light/dark theme both work
4. Language toggle EN/ES works
5. Notes CRUD works (create, edit, delete visible on card)
6. Categories CRUD works (delete button visible on card)
7. Lists CRUD + items work
8. Reminder notification foreground behavior still works
9. Background push behavior tested on installed PWA when push code changes
10. PWA installs on iPhone Safari
11. `CACHE_VERSION` bumped when app files change
12. Verified live with curl
