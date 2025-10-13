@echo off
echo ========================================
echo   JHUB Gallery - Starting Frontend
echo ========================================
echo.

cd "%~dp0frontend"

echo Checking if frontend folder exists...
if not exist "package.json" (
    echo ERROR: Frontend files not found!
    echo Make sure you're in the right directory.
    pause
    exit /b 1
)

echo.
echo Starting frontend development server...
echo Frontend will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev

pause
