@echo off
cd /d "C:\Users\david\Documents\note-clip-deploy"
echo === Git status ===
git status
echo.
echo === Staging Stage 4b files ===
git add css/styles.css sw.js
echo.
echo === Committing Stage 4b: fix card-delete-btn dark mode contrast, CACHE_VERSION v9 ===
git commit -m "Stage 4b: fix card-delete-btn invisible in dark mode (use CSS vars), CACHE_VERSION v9"
echo.
echo === Pushing to origin/main ===
git push origin main
echo.
echo === Done - GitHub Pages will update in ~1 min ===
pause
