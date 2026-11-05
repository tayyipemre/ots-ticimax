@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "RESULT=1"

echo.
echo =============================================================
echo  OTS - Trendyol yorumlari guncelleniyor...
echo =============================================================
echo.

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo HATA: Windows PowerShell bulunamadi.
    goto :finish
)

rem ExecutionPolicy yalnizca bu PowerShell oturumu icin atlanir;
rem bilgisayarin kalici guvenlik ayarlari degistirilmez.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0yorumlar.ps1" %*
set "RESULT=%ERRORLEVEL%"

if not "%RESULT%"=="0" (
    echo.
    echo HATA: Yorumlar guncellenemedi. Kod: %RESULT%
    goto :finish
)

echo.
echo BASARILI: yorumlar.json guncellendi.

:finish
echo.
pause
exit /b %RESULT%
