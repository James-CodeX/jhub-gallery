@echo off
REM JHUB Gallery - Docker Quick Start Script for Windows
REM This script helps you get started with Docker quickly

echo.
echo ========================================
echo  JHUB Gallery - Docker Quick Start
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    echo Please install Docker Desktop which includes Docker Compose
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo [OK] Docker Compose is installed
echo.

REM Check if .env file exists
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy .env.docker .env >nul
    echo [OK] .env file created
    echo.
    echo [WARNING] IMPORTANT: Please edit .env and change the following:
    echo    - POSTGRES_PASSWORD
    echo    - MINIO_SECRET_KEY
    echo    - JWT_SECRET
    echo.
    echo Press any key to continue after updating .env file...
    pause >nul
) else (
    echo [OK] .env file already exists
)

echo.
echo [INFO] Starting Docker containers...
echo.

REM Start services
docker compose up -d

echo.
echo [INFO] Waiting for services to be healthy (this may take a minute)...
echo.

REM Wait a bit for services to start
timeout /t 30 /nobreak >nul

echo.
echo [INFO] Service Status:
docker compose ps

echo.
echo ========================================
echo  JHUB Gallery is now running!
echo ========================================
echo.
echo [ACCESS] The application:
echo    Frontend:      http://localhost:3000
echo    Backend API:   http://localhost:4000
echo    MinIO Console: http://localhost:9001
echo    API Health:    http://localhost:4000/health
echo.
echo [LOGS] View logs:
echo    docker compose logs -f
echo.
echo [STOP] Stop services:
echo    docker compose down
echo.
echo [DOCS] For more information, see DOCKER_DEPLOYMENT.md
echo.
pause
