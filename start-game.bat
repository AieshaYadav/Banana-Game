@echo off
title Banana Game Enterprise Launcher
echo ===================================================
echo   🍌 Starting Banana Game Enterprise Full-Stack
echo ===================================================
cd /d "%~dp0"

echo [1/2] Starting Node Express Backend Server on port 5000...
start "Banana Game Backend (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend Client on port 5173...
start "Banana Game Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [✓] Launching browser to http://localhost:5173...
start http://localhost:5173

echo.
echo Both servers are now running! Keep the two terminal windows open while playing.
echo When you are done, simply close the terminal windows.
