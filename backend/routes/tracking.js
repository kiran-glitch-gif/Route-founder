const express = require('express');
const router = express.Router();

// GET /api/tracking/live - All live bus locations
router.get('/live', (req, res) => {
    const busTracker = req.app.get('busTracker');
    res.json(busTracker.getAllLocations());
});

// GET /api/tracking/live/:id - Single bus live location
router.get('/live/:id', (req, res) => {
    const busTracker = req.app.get('busTracker');
    const bus = busTracker.getBusLocation(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
});

// GET /api/tracking/alerts - Current delay alerts
router.get('/alerts', (req, res) => {
    const busTracker = req.app.get('busTracker');
    res.json(busTracker.getAlerts());
});

// GET /api/tracking/eta/:busId/:stop - ETA for a bus at a stop
router.get('/eta/:busId/:stop', (req, res) => {
    const busTracker = req.app.get('busTracker');
    const eta = busTracker.calculateETA(req.params.busId, req.params.stop);
    res.json(eta);
});

module.exports = router;
