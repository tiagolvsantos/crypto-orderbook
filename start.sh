#!/bin/bash

# Ensure the script is run from the project root directory
if [ ! -d "frontend" ] || [ ! -f "cmd/main.go" ]; then
    echo "Error: Please run this script from the project root directory containing 'frontend' and 'cmd' folders."
    exit 1
fi

# Check if port 8087 is in use and attempt to free it
if netstat -tulnp 2>/dev/null | grep -q ":8087"; then
    echo "Port 8087 is in use. Attempting to free it..."
    PORT_PID=$(netstat -tulnp 2>/dev/null | grep ":8087" | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$PORT_PID" ]; then
        echo "Killing process $PORT_PID using port 8087..."
        kill -9 "$PORT_PID" 2>/dev/null
        sleep 1
    else
        echo "Error: Unable to identify process using port 8087. Please free the port manually."
        exit 1
    fi
fi

# Start crypto-orderbook backend on localhost in background
if [ -f "crypto-orderbook" ]; then
    nohup ./crypto-orderbook -log-interval 10s -symbol BTCUSDT > backend-nohup.out 2>&1 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
else
    nohup go run ./cmd/main.go -log-interval 10s -symbol BTCUSDT > backend-nohup.out 2>&1 &
    BACKEND_PID=$!
    echo "Backend (go run) started with PID: $BACKEND_PID"
fi

# Start crypto-orderbook frontend in background
cd frontend
# Ensure npm is installed and dependencies are set up
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Install frontend dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend with Vite, binding to the host IP
nohup npm run dev -- --host 0.0.0.0 --port 5173 > ../frontend-nohup.out 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Frontend started with PID: $FRONTEND_PID"
echo "Access the app at http://46.62.192.208:5173"
echo "Backend WS (via proxy) at ws://46.62.192.208:8087/ws"
echo "Logs: backend-nohup.out and frontend-nohup.out"
echo "Note: Ensure nginx is configured to proxy ws://46.62.192.208:8087 to ws://localhost:8087"