#!/bin/bash
# RVT (Russian Vocab Tracker) v2.5 - Auto-launcher
# Opens the app in the default browser and starts a local server

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PORT=8000
URL="http://localhost:$PORT"

# Kill any existing server on port 8000
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start Python HTTP server in background
cd "$SCRIPT_DIR"
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 1

# Open in default browser
if command -v open &> /dev/null; then
    # macOS
    open "$URL"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "$URL"
elif command -v start &> /dev/null; then
    # Windows
    start "$URL"
else
    echo "Please open $URL in your browser"
fi

# Keep server running
wait $SERVER_PID
