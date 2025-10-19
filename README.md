# Crypto Orderbook

Multi-exchange, real-time orderbook with a Go backend and a React + Vite frontend.

> **Note:** This is an experimental project built quickly for learning and prototyping. Expect rough edges.

Support the project
- If you want to support my work, you can sign up to BingX using my referral: https://bingx.com/en/invite/JGNQPF
- Bingx is one of the Global Top 10 Crypto Exchange. It has low fees and great UX. Also a key sponsor to Chelsea Football Club.

What it is
- Backend: Go service that connects to several exchanges, maintains live orderbooks, and serves a WebSocket feed at ws://localhost:8086/ws. See [cmd/main.go](cmd/main.go) and [internal/websocket/server.go](internal/websocket/server.go).
- Frontend: React app that subscribes to the WebSocket, renders per-exchange orderbooks, aggregated orderbooks, statistics, and charts. See [frontend/src/App.tsx](frontend/src/App.tsx).

Project layout
- Go backend (exchanges, orderbook engine, websocket):
  - [cmd/main.go](cmd/main.go)
  - [internal/exchange](internal/exchange)
  - [internal/orderbook](internal/orderbook)
  - [internal/websocket/server.go](internal/websocket/server.go)
- Frontend (React + Vite + Tailwind):
  - [frontend](frontend)
  - Entry: [frontend/src/main.tsx](frontend/src/main.tsx)
  - App: [frontend/src/App.tsx](frontend/src/App.tsx)

Quick start

Backend (Go 1.22+)
```bash
go run ./cmd/main.go
```

Frontend (Node 18+)
```bash
cd frontend
npm install
npm run dev
# Open the URL printed by Vite http://localhost:5173
```

How it works
- The backend starts a WebSocket server at ws://localhost:8086/ws and streams:
  - orderbook messages per exchange (bids/asks levels)
  - stats messages per exchange (best bid/ask, spread, liquidity at 0.5%, 2%, 10%, totals)
- The frontend connects to ws://localhost:8086/ws (config is in [frontend/src/hooks/useWebSocket.ts](frontend/src/hooks/useWebSocket.ts)) and renders:
  - Exchange Statistics table
  - Individual Order Books or an Aggregated Order Book
  - Liquidity charts (0.5%, 2%, 10%, total)
  - Market filter (All / Spot / Perps), tick size selector, dark/light theme

Controls (frontend)
- Market filter: All, Spot, Perps (top-right toggle)
- Theme: dark/light toggle
- Tick: select the aggregation step (e.g., 0.1, 1, 10, 50, 100)
- Aggregate: toggle between per-exchange and aggregated orderbook views

Exchanges enabled
- The backend is configured in [cmd/main.go](cmd/main.go) to connect to:
  - Binance (spot), Binancef (perps)
  - Bybit (spot), Bybitf (perps)
  - Kraken (spot)
  - OKX (spot)
  - Coinbase (spot)
  - Asterdexf (perps)
  - BingX (spot)

Builds

Backend
```bash
# Build a binary
go build -o crypto-orderbook ./cmd

# Run with race detector
go run -race ./cmd
```

Frontend
```bash
cd frontend
npm run build
npm run preview
```

Notes
- The frontend connects to ws://localhost:8086/ws by default (see [frontend/src/App.tsx](frontend/src/App.tsx) and [frontend/src/hooks/useWebSocket.ts](frontend/src/hooks/useWebSocket.ts)).
- If you change the WebSocket server port in code, update the URL passed to useWebSocket() accordingly.