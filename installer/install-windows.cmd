@echo off
setlocal
chcp 65001 >nul
title Codex Work Platform Installer
echo Installing and starting Codex Work Platform...
echo 正在安装并启动 Codex 工作台……
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1" -Start
if errorlevel 1 pause
