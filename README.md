# Bus Schedule Agent — Backend API

Tamil Nadu real-time bus tracking API with AI agents, WebSocket live tracking, and REST endpoints.

## Stack
- Node.js + Express
- PostgreSQL (optional — works without it for tracking/AI)
- Anthropic Claude (claude-sonnet-4-20250514) with tool use
- Socket.io for real-time WebSocket

## Quick Start

```bash
cd backend
npm install
# configure .env (see below)
npm run dev
```

## Environment — `backend/.env`

```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:password@localhost:5432/busdb
PORT=3001
```

> Without `DATABASE_URL`, buses/stops endpoints won't work but tracking and AI agent still run.

## Database Setup (optional)

```bash
createdb busdb
psql -d busdb -f backend/db/schema.sql
psql -d busdb -f backend/db/seed.sql
```

## API Endpoints

### Buses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buses` | All buses |
| GET | `/api/buses/search?from=&to=` | Search by route |
| GET | `/api/buses/:id` | Single bus details |

### Stops & Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stops` | All stop names |
| GET | `/api/routes` | All routes with bus count |

### Real-Time Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracking/live` | All live bus positions |
| GET | `/api/tracking/live/:id` | Single bus live position |
| GET | `/api/tracking/alerts` | Current delay alerts |
| GET | `/api/tracking/eta/:busId/:stop` | ETA at a stop |

### AI Agent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/chat` | Agentic chat with tool use |
| GET | `/api/agent/sessions/:id` | Retrieve chat session |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health + active bus count |

## WebSocket Events

Connect to `ws://localhost:3001`

| Event | Direction | Payload |
|-------|-----------|---------|
| `bus:all` | server → client | Array of all bus locations |
| `bus:update` | server → client | Single bus update |
| `bus:alerts` | server → client | Latest delay alerts |
| `track:bus` | client → server | `busId` string |
| `untrack:bus` | client → server | `busId` string |

## AI Agent Chat — Request/Response

```bash
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Where is SKV-01 right now?"}'
```

```json
{
  "response": "SKV-01 (SKV Express) is currently near Melmaruvathur heading to Chengalpattu. Status: on-time. Fare: ₹150.",
  "session_id": "uuid-here",
  "tools_used": 1
}
```

## AI Agent Tools

The agent uses Claude's tool use to call these functions before answering:

- `get_bus_location` — live GPS, speed, status
- `search_buses` — find buses between stops
- `get_route_stops` — intermediate stops
- `calculate_eta` — ETA at any stop
- `get_delay_alerts` — current alerts
- `suggest_alternative_route` — alternatives for delayed buses
