@echo off
echo ========================================
echo   JHUB Gallery - Starting Backend
echo ========================================
echo.

cd "%~dp0backend"

echo Checking if backend folder exists...
if not exist "src\index.js" (
    echo ERROR: Backend files not found!
    echo Make sure you're in the right directory.
    pause
    exit /b 1
)

echo.
echo Starting backend server on port 4000...
echo Backend will run at: http://localhost:4000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node src\index.js

pause
