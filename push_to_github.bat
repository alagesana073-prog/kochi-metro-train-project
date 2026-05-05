@echo off
echo.
echo [1/3] Staging all changes...
git add .
echo [2/3] Committing changes with timestamp...
git commit -m "update: kmtp system update on %date% %time%"
echo [3/3] Pushing to GitHub...
git push origin main
echo.
echo DONE! Your changes are now on GitHub and being deployed.
pause
