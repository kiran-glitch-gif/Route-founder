# Bus Schedule Agent 🚌

A smart bus schedule finder for Tamil Nadu with AI-powered chat assistance. Users can search for buses by route and get intelligent responses about bus schedules, timings, and travel information.

## Features

- **Smart Bus Search**: Search buses by source and destination
- **AI Chat Assistant**: Natural language queries about bus routes and schedules
- **Real-time Information**: Bus timings, fares, and status updates
- **Tamil Nadu Routes**: Comprehensive coverage of major Tamil Nadu bus routes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

### Backend
- Node.js with Express
- PostgreSQL database
- Anthropic Claude API for AI chat
- CORS enabled for cross-origin requests

## Project Structure

```
bus-schedule-agent/
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── routes/
│   │   ├── buses.js
│   │   ├── agent.js
│   │   └── stops.js
│   ├── services/
│   │   ├── claudeService.js
│   │   └── busService.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── BusCard.jsx
│   │   │   └── AgentChat.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## API Endpoints

- `GET /api/buses` - Get all buses
- `GET /api/buses/search?from=&to=` - Search buses by route
- `GET /api/buses/:id` - Get single bus details
- `GET /api/buses/live-status/:id` - Get live bus status
- `GET /api/stops` - Get all bus stops
- `GET /api/routes` - Get all available routes
- `POST /api/agent/chat` - AI chat endpoint

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Anthropic API key

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb busdb

# Run schema and seed data
psql -d busdb -f backend/db/schema.sql
psql -d busdb -f backend/db/seed.sql
```

### 3. Environment Configuration

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/busdb
PORT=3001
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NODE_ENV=development
```

### 4. Run the Application

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Sample Data

The application comes with sample Tamil Nadu bus routes including:

- **SKV Express** (Tindivanam ↔ Chennai)
- **Pondy Express** (Tindivanam ↔ Puducherry)
- **Madurai King** (Chennai ↔ Madurai)
- **Trichy Rider** (Chennai ↔ Trichy)
- And more routes covering major Tamil Nadu cities

## AI Chat Features

The AI assistant can help with:
- Finding buses between specific routes
- Checking bus timings and fares
- Getting information about bus types (AC, Sleeper, Express)
- Route suggestions and travel tips
- Real-time status updates

## Development

### Adding New Routes

Add new bus data to `backend/db/seed.sql`:

```sql
INSERT INTO buses VALUES
('BUS-ID', 'Bus Name', 'From City', 'To City', 'HH:MM', 'HH:MM', 'Duration', 'Type', 'Status', 'Operator', 'stops_json', 'days_json', fare);
```

### Customizing AI Responses

Modify the system prompt in `backend/services/claudeService.js` to customize AI behavior.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.