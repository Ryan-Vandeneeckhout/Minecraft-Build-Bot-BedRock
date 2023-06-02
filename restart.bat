@echo off
taskkill /IM python.exe /F
taskkill /IM conhost.exe /F
start "" python "bot_program.py"
exit