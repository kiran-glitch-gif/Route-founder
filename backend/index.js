require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const busTracker = require('./services/busTracker');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to app so routes can emit events
app.set('io', io);
app.set('busTracker', busTracker);

// Routes
app.use('/api/buses', require('./routes/buses'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/stops', require('./routes/stops'));
app.use('/api/routes', require('./routes/stops'));
app.use('/api/tracking', require('./routes/tracking'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── WebSocket: Real-time bus tracking ───────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send all bus locations immediately on connect
    socket.emit('bus:all', busTracker.getAllLocations());

    // Client subscribes to a specific bus
    socket.on('track:bus', (busId) => {
        socket.join(`bus:${busId}`);
        const loc = busTracker.getBusLocation(busId);
        if (loc) socket.emit('bus:update', loc);
    });

    // Client unsubscribes from a bus
    socket.on('untrack:bus', (busId) => {
        socket.leave(`bus:${busId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Broadcast live bus positions every 3 seconds
setInterval(() => {
    const locations = busTracker.getAllLocations();
    io.emit('bus:all', locations);

    // Emit per-bus updates to subscribed rooms
    locations.forEach(bus => {
        io.to(`bus:${bus.id}`).emit('bus:update', bus);
    });

    // Emit any new alerts
    const alerts = busTracker.getAlerts();
    if (alerts.length > 0) {
        io.emit('bus:alerts', alerts.slice(0, 5));
    }
}, 3000);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
    console.log(`🚌 Bus Schedule Agent API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗺️  Real-time tracking active via WebSocket`);
});
