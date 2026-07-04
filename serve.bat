@echo off
setlocal

REM ============================================================
REM  Sid Automation Lab - local static server
REM  Usage:  serve.bat [port]
REM  Default port: 8080
REM  Open:  http://localhost:8080/
REM ============================================================

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo.
echo  Sid Automation Lab - local server
echo  Root : %ROOT%
echo  Port : %PORT%
echo  URL  : http://localhost:%PORT%/
echo.
echo  Press Ctrl+C to stop.
echo.

REM Start browser a beat AFTER server binds (below); we use a helper that
REM waits 2s then opens the browser, while server runs in foreground.

where python >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" /b cmd /c "timeout /t 2 /nobreak >nul & start """" ""http://localhost:%PORT%/"""
    python -m http.server %PORT% --bind 127.0.0.1
    goto :end
)

where py >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" /b cmd /c "timeout /t 2 /nobreak >nul & start """" ""http://localhost:%PORT%/"""
    py -m http.server %PORT% --bind 127.0.0.1
    goto :end
)

where npx >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" /b cmd /c "timeout /t 2 /nobreak >nul & start """" ""http://localhost:%PORT%/"""
    npx --yes serve -l %PORT% "%ROOT%"
    goto :end
)

echo [ERROR] No Python or Node.js found on PATH.
echo         Install one of:
echo           - Python  ^>= 3   https://www.python.org/downloads/
echo           - Node.js ^>= 18  https://nodejs.org/
echo.

:end
endlocal
