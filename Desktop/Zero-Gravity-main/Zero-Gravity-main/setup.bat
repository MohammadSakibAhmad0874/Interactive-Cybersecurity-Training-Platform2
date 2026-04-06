@echo off
echo ===================================
echo DevMatch Setup Script
echo ===================================

echo Installing backend dependencies...
cd /d "%~dp0backend"
call npm install

echo Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install

echo Installing AI service dependencies...
cd /d "%~dp0ai-service"
pip install -r requirements.txt

echo ===================================
echo Setup complete! To run DevMatch:
echo   Terminal 1: cd backend  ^&^& npm run dev
echo   Terminal 2: cd frontend ^&^& npm run dev
echo   Terminal 3: cd ai-service ^&^& python app.py
echo ===================================
pause
