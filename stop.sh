#!/bin/bash

read -p "Are you sure you want to stop crypto-orderbook (y/N)? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Stop backend
if [ -f "crypto-orderbook" ]; then
    pkill -f "./crypto-orderbook"
    echo "Backend stopped."
else
    pkill -f "go run ./cmd/main.go"
    echo "Backend stopped."
fi

# Stop frontend
pkill -f "npm run dev.*frontend"
echo "Frontend stopped."

echo "All components stopped. Check 'ps aux | grep -E \"crypto-orderbook|npm run dev\"' if needed."