@echo off
chcp 65001 >nul
title Workspace Editor - 지금 즉시 수동 백업

echo ==================================================================
echo  Workspace Editor 프로젝트 및 스크린 즉시 수동 백업
echo ==================================================================
echo.
echo 백업을 시작합니다... (소요 시간 약 1~2초)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\daily_auto_backup.ps1"

echo.
echo ==================================================================
echo  백업 작업이 완료되었습니다. 아무 키나 누르면 창을 닫습니다.
echo ==================================================================
pause >nul
