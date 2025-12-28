@echo off
echo.
echo ========================================
echo   Installing Python dependencies...
echo ========================================
echo.

pip install -r requirements.txt

echo.
echo ========================================
echo   Starting Game Gallery Server
echo ========================================
echo.

python server.py
