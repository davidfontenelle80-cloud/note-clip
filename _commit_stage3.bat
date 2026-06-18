@echo off
cd /d "C:\Users\david\Documents\note-clip-deploy"
echo === Git status ===
git status
echo.
echo === Staging changed files ===
git add js/notes.js js/dashboard.js js/i18n.js
git add js/storage.js js/lists.js js/shared.js js/settings.js js/communication.js
echo.
echo === Committing Stage 3 fixes ===
git commit -m "Stage 3 fixes: restore/reopen, sort order, search bar, priority labels, date filter, quick-note category picker"
echo.
echo === Pushing to origin/main ===
git push origin main
echo.
echo === Done - GitHub Pages will update in ~1 min ===
pause
