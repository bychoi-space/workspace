@echo off
chcp 65001 >nul
title Workspace Editor - 매일 자동 백업 스케줄 해제

echo ==================================================================
echo  Workspace Editor 매일 자동 백업 스케줄 등록 해제
echo ==================================================================
echo.

:: 관리자 권한 확인 및 자동 상승 (UAC Elevation)
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [안내] 작업 스케줄러 수정을 위해 관리자 권한으로 승격합니다...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup_daily_schedule.ps1" -Action uninstall

echo.
echo ==================================================================
echo  스케줄 등록이 해제되었습니다. 아무 키나 누르면 창을 닫습니다.
echo ==================================================================
pause >nul
