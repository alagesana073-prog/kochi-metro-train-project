@echo off
echo.
echo [1/2] Starting KMTP Python API...
start /B py modul\api.py
echo [2/2] Starting Secure Tunnel (Localtunnel)...
echo ----------------------------------------------------
echo IMPORTANT: When the URL appears below, make sure it 
echo matches the VITE_API_URL in your frontend config.
echo ----------------------------------------------------
npx localtunnel --port 5000
pause
