@echo off
chcp 65001 >nul
title Workspace Editor - 프로젝트 및 스크린 롤백 복원 도구

echo ==================================================================
echo  Workspace Editor 산출물 복원 및 롤백 도구
echo ==================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\restore_data.ps1"

echo.
echo ==================================================================
echo  작업이 완료되었습니다. 아무 키나 누르면 창을 닫습니다.
echo ==================================================================
pause >nul
