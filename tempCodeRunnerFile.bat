@echo off
REM Neon to Local PostgreSQL Migration Script (Windows)
REM This script automates the process of migrating your Neon database to local PostgreSQL

echo ===================================
echo Neon to Local PostgreSQL Migration
echo ===================================
echo.

REM Configuration
set /p NEON_URL="Enter your Neon database URL: "
set /p LOCAL_DB_NAME="Enter local database name (default: guattend): "
if "%LOCAL_DB_NAME%"=="" set LOCAL_DB_NAME=guattend

set /p LOCAL_USER="Enter local postgres username (default: postgres): "
if "%LOCAL_USER%"=="" set LOCAL_USER=postgres

REM Fixed: Now actually prompts for password instead of hardcoding
set /p LOCAL_PASSWORD="Enter local postgres password: "

set BACKUP_FILE=neon_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
set BACKUP_FILE=%BACKUP_FILE: =0%

echo.
echo Step 1: Checking if PostgreSQL is installed...
where pg_dump >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    echo To add PostgreSQL to PATH:
    echo 1. Search for "Environment Variables" in Windows
    echo 2. Edit System Environment Variables
    echo 3. Add: C:\Program Files\PostgreSQL\16\bin
    pause
    exit /b 1
)
echo [OK] PostgreSQL is installed

echo.
echo Step 2: Backing up Neon database...
echo This may take a few moments depending on database size...
pg_dump "%NEON_URL%" > "%BACKUP_FILE%" 2>error.log
if %errorlevel% neq 0 (
    echo [ERROR] Backup failed
    echo.
    echo Common issues:
    echo - Check your internet connection
    echo - Verify Neon URL is correct
    echo - Ensure Neon database is accessible
    echo.
    echo Error details saved in error.log
    type error.log
    pause
    exit /b 1
)
echo [OK] Backup created: %BACKUP_FILE%
for %%A in ("%BACKUP_FILE%") do echo     File size: %%~zA bytes

echo.
echo Step 3: Creating local database...
set PGPASSWORD=%LOCAL_PASSWORD%

REM Check if database exists and drop it
psql -U %LOCAL_USER% -lqt 2>nul | findstr /C:"%LOCAL_DB_NAME%" >nul
if %errorlevel% equ 0 (
    echo Database '%LOCAL_DB_NAME%' exists, dropping it...
    psql -U %LOCAL_USER% -c "DROP DATABASE IF EXISTS %LOCAL_DB_NAME%;" 2>error.log
    if %errorlevel% neq 0 (
        echo [WARNING] Could not drop existing database
        type error.log
    )
)

REM Create new database
psql -U %LOCAL_USER% -c "CREATE DATABASE %LOCAL_DB_NAME%;" 2>error.log
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database
    echo.
    echo Common issues:
    echo - Wrong postgres password
    echo - PostgreSQL service not running
    echo - Insufficient permissions
    echo.
    echo Error details:
    type error.log
    pause
    exit /b 1
)
echo [OK] Database '%LOCAL_DB_NAME%' created

echo.
echo Step 4: Importing data to local database...
echo This may take a few moments...
psql -U %LOCAL_USER% -d %LOCAL_DB_NAME% < "%BACKUP_FILE%" 2>error.log
if %errorlevel% neq 0 (
    echo [ERROR] Import failed
    echo Error details:
    type error.log
    pause
    exit /b 1
)
echo [OK] Data imported successfully

echo.
echo Step 5: Verifying import...
for /f %%i in ('psql -U %LOCAL_USER% -d %LOCAL_DB_NAME% -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2^>nul') do set TABLE_COUNT=%%i
echo [OK] Tables imported: %TABLE_COUNT%

echo.
echo ===================================
echo Migration Complete!
echo ===================================
echo.
echo Your local database connection string:
echo postgresql://%LOCAL_USER%:%LOCAL_PASSWORD%@localhost:5432/%LOCAL_DB_NAME%
echo.
echo Update your .env.local file with:
echo DATABASE_URL="postgresql://%LOCAL_USER%:%LOCAL_PASSWORD%@localhost:5432/%LOCAL_DB_NAME%"
echo.
echo Backup file saved: %BACKUP_FILE%
echo You can delete this file after verifying the migration works.
echo.
echo To verify, run:
echo   psql -U %LOCAL_USER% -d %LOCAL_DB_NAME%
echo   \dt
echo.

REM Cleanup
set PGPASSWORD=
if exist error.log del error.log

pausepg_dump --version