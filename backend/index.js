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
    console.log('');
});
