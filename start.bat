@echo off
title PopcornStats Server
cd /d "%~dp0"

echo ================================================
echo   Popcorn Stats - Movie Recommendation Engine
echo ================================================
echo.

:: Kill any existing server on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Open browser after 3 seconds (background)
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:8000"

:: Start the server
echo   Starting server at http://127.0.0.1:8000
echo   Close this window to stop the server.
echo.
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

pause
