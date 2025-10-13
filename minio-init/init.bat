@echo off
REM MinIO Initialization Script for Windows
REM This script creates buckets and sets policies for JHUB Gallery

echo Initializing MinIO for JHUB Gallery...

REM Wait for MinIO to be ready
echo Waiting for MinIO to be ready...
:wait_loop
curl -s http://localhost:9000/minio/health/live >nul 2>&1
if errorlevel 1 (
    echo MinIO is unavailable - waiting...
    timeout /t 2 /nobreak >nul
    goto wait_loop
)

echo MinIO is ready!

REM Configure mc (MinIO Client)
mc alias set myminio http://localhost:9000 minioadmin minioadmin123

REM Create buckets
echo Creating buckets...
mc mb myminio/jhub-photos-original --ignore-existing
mc mb myminio/jhub-photos-thumbnails --ignore-existing

REM Set public read policy on thumbnails bucket
echo Setting public read policy on thumbnails bucket...
mc anonymous set download myminio/jhub-photos-thumbnails

REM Set versioning on original photos bucket
echo Enabling versioning on original photos bucket...
mc version enable myminio/jhub-photos-original

REM Display bucket information
echo.
echo MinIO initialization complete!
echo.
echo Bucket Information:
mc ls myminio

echo.
echo JHUB Gallery MinIO setup completed successfully!
