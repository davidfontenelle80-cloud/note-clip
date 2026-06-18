@echo off
cd /d "C:\Users\david\Documents\note-clip-deploy"
echo === Git status ===
git status
echo.
echo === Staging Stage 4 files ===
git add js/lists.js js/storage.js js/i18n.js sw.js
echo.
echo === Committing Stage 4 Lists improvements ===
git commit -m "Stage 4: goal list completed section, template copy, item editing, defaultListBehavior fix, CACHE_VERSION v8"
echo.
echo === Pushing to origin/main ===
git push origin main
echo.
echo === Done - GitHub Pages will update in ~1 min ===
pause
