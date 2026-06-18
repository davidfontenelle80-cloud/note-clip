@echo off
cd /d "C:\Users\david\Documents\note-clip-deploy"
echo === Git status before ===
git status
echo.
echo === Staging js/app.js deletion ===
git add -u js/app.js
echo.
echo === Committing ===
git commit -m "Remove js/app.js: dead KHub monolith, replaced by modular JS system"
echo.
echo === Pushing to origin/main ===
git push origin main
echo.
echo === Done - press any key to close ===
pause
