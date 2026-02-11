@echo off
REM Windows startup script for LeetCode Agent

echo.
echo ========================================
echo LeetCode Agent Startup Script
echo ========================================
echo.

REM Start backend server
echo Starting backend server on port 3001...
start cmd /k "cd server && npm install && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend dev server
echo Starting frontend dev server on port 5173...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo Services starting...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo ========================================
echo.
