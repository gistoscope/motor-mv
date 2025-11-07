@echo off
REM Wrapper for Total Commander / double-click
setlocal
set SCRIPT=%~dp0viewer-4001.ps1
powershell -ExecutionPolicy Bypass -File "%SCRIPT%" %*
endlocal