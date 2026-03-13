require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const busTracker = require('./services/busTracker');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Attach shared services to app
app.set('io', io);
app.set('busTracker', busTracker);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/buses',    require('./routes/buses'));
app.use('/api/agent',    require('./routes/agent'));
app.use('/api/stops',    require('./routes/stops'));
app.use('/api/routes',   require('./routes/stops'));
app.use('/api/tracking', require('./routes/tracking'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        activeBuses: busTracker.getAllLocations().length,
        websocket: 'active'
    });
});

// ─── AgentCity Verification Endpoints ────────────────────────────────────────
// Processes "input" or "query" fields and returns a meaningful bus agent response

async function processAgentInput(text) {
    if (!text || typeof text !== 'string') {
        return 'Please provide a bus route query. Example: "Buses from Chennai to Madurai" or "Where is SKV-01?"';
    }

    const lower = text.toLowerCase();
    const buses  = busTracker.getAllLocations();
    const alerts = busTracker.getAlerts();

    // ── Live bus location query ──────────────────────────────────────────────
    const busIdMatch = text.match(/\b([A-Z]{2,4}-\d{2,3})\b/i);
    if (busIdMatch) {
        const bus = busTracker.getBusLocation(busIdMatch[1].toUpperCase());
        if (bus) {
            return {
                bus_id:       bus.id,
                name:         bus.name,
                route:        `${bus.from_stop} → ${bus.to_stop}`,
                current_stop: bus.currentStop,
                next_stop:    bus.nextStop,
                speed:        `${Math.round(bus.speed)} km/h`,
                status:       bus.status,
                delay:        bus.delayMinutes > 0 ? `+${bus.delayMinutes} min` : 'None',
                fare:         `₹${bus.fare}`,
                type:         bus.type,
                operator:     bus.operator,
                last_updated: bus.lastUpdated,
                message:      `${bus.id} - ${bus.departure} | Status: ${bus.status}${bus.delayMinutes > 0 ? ` (+${bus.delayMinutes}m late)` : ''}`
            };
        }
    }

    // ── Route search: "from X to Y" ──────────────────────────────────────────
    const routeMatch = lower.match(/from\s+([a-z]+)\s+to\s+([a-z]+)/);
    if (routeMatch) {
        const from = routeMatch[1];
        const to   = routeMatch[2];
        const found = busTracker.searchBuses(from, to);
        if (found.length > 0) {
            return {
                route:   `${from} → ${to}`,
                count:   found.length,
                buses:   found.map(b => ({
                    id:       b.id,
                    name:     b.name,
                    display:  `${b.id} - ${b.departure}`,
                    type:     b.type,
                    fare:     `₹${b.fare}`,
                    status:   b.status,
                    duration: b.duration
                })),
                message: `Found ${found.length} bus(es) from ${from} to ${to}`
            };
        }
        return { message: `No direct buses found from ${from} to ${to}. Try Chennai, Madurai, Trichy, Tindivanam, Puducherry.` };
    }

    // ── Delay / alert query ──────────────────────────────────────────────────
    if (lower.includes('delay') || lower.includes('late') || lower.includes('alert')) {
        const late = buses.filter(b => b.status === 'late');
        return {
            total_alerts:  alerts.length,
            delayed_buses: late.length,
            alerts:        alerts.slice(0, 5).map(a => a.message),
            buses:         late.map(b => `${b.id} - ${b.name} (+${b.delayMinutes}m late near ${b.currentStop})`),
            message:       late.length > 0
                ? `${late.length} bus(es) currently delayed`
                : 'All buses are running on time'
        };
    }

    // ── All live buses ───────────────────────────────────────────────────────
    if (lower.includes('all') || lower.includes('live') || lower.includes('track')) {
        return {
            total_buses: buses.length,
            on_time:     buses.filter(b => b.status === 'on-time').length,
            late:        buses.filter(b => b.status === 'late').length,
            buses:       buses.map(b => ({
                id:      b.id,
                display: `${b.id} - ${b.departure}`,
                route:   `${b.from_stop} → ${b.to_stop}`,
                status:  b.status,
                near:    b.currentStop
            })),
            message: `Tracking ${buses.length} live buses across Tamil Nadu`
        };
    }

    // ── Default: show capabilities ───────────────────────────────────────────
    return {
        agent:        'Tamil Nadu Bus Schedule Agent',
        capabilities: [
            'Real-time bus tracking (GPS simulation)',
            'Route search between Tamil Nadu cities',
            'Live delay alerts and notifications',
            'ETA calculation at any stop',
            'AI-powered natural language queries',
            'WebSocket live position streaming'
        ],
        active_buses: buses.length,
        sample_routes: ['Tindivanam → Chennai', 'Chennai → Madurai', 'Chennai → Trichy', 'Tindivanam → Puducherry'],
        example_queries: [
            'Buses from Chennai to Madurai',
            'Where is SKV-01?',
            'Any delays today?',
            'Track all live buses'
        ],
        message: `Bus Schedule Agent is live with ${buses.length} active buses. Ask me about routes, delays, or live tracking.`
    };
}

// Primary AgentCity endpoint — POST /
app.post('/', async (req, res) => {
    try {
        const text   = req.body.input || req.body.query || '';
        console.log(`🤖 AgentCity request: "${text}"`);
        const result = await processAgentInput(text);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ result: `Error: ${err.message}` });
    }
});

// Fallback research endpoint — POST /research
app.post('/research', async (req, res) => {
    try {
        const text   = req.body.query || req.body.input || '';
        console.log(`🤖 AgentCity /research: "${text}"`);
        const result = await processAgentInput(text);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ result: `Error: ${err.message}` });
    }
});

// ─── WebSocket: Real-time bus tracking ───────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send all current bus locations immediately
    socket.emit('bus:all', busTracker.getAllLocations());

    // Subscribe to a specific bus
    socket.on('track:bus', (busId) => {
        socket.join(`bus:${busId}`);
        const loc = busTracker.getBusLocation(busId);
        if (loc) socket.emit('bus:update', loc);
    });

    // Unsubscribe from a bus
    socket.on('untrack:bus', (busId) => {
        socket.leave(`bus:${busId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Broadcast live positions every 3 seconds
setInterval(() => {
    const locations = busTracker.getAllLocations();
    io.emit('bus:all', locations);

    // Per-bus room updates
    locations.forEach(bus => {
        io.to(`bus:${bus.id}`).emit('bus:update', bus);
    });

    // Broadcast active alerts
    const alerts = busTracker.getAlerts();
    if (alerts.length > 0) {
        io.emit('bus:alerts', alerts.slice(0, 5));
    }
}, 3000);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log('');
    console.log('🚌  Bus Schedule Agent API');
    console.log('─────────────────────────────────────────');
    console.log(`🌐  REST API   → http://localhost:${PORT}/api`);
    console.log(`❤️   Health     → http://localhost:${PORT}/api/health`);
    console.log(`🗺️   Tracking   → http://localhost:${PORT}/api/tracking/live`);
    console.log(`🤖  AI Agent   → POST http://localhost:${PORT}/api/agent/chat`);
    console.log(`🔌  WebSocket  → ws://localhost:${PORT}`);
    console.log('─────────────────────────────────────────');
    console.log(`🏙️  AgentCity  → POST http://localhost:${PORT}/`);
    console.log(`🏙️  AgentCity  → POST http://localhost:${PORT}/research`);
    console.log('─────────────────────────────────────────');
    console.log('');
});
