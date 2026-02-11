#!/bin/bash
# Unix/Linux/macOS startup script for LeetCode Agent

echo ""
echo "========================================"
echo "LeetCode Agent Startup Script"
echo "========================================"
echo ""

# Start backend server
echo "Starting backend server on port 3001..."
cd server
npm install
npm start &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend dev server
echo "Starting frontend dev server on port 5173..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Services starting..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait
