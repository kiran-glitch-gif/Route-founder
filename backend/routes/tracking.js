const express = require('express');
const router = express.Router();

// GET /api/tracking/live — all live bus positions
router.get('/live', (req, res) => {
    const busTracker = req.app.get('busTracker');
    res.json(busTracker.getAllLocations());
});

// GET /api/tracking/live/:id — single bus live position
router.get('/live/:id', (req, res) => {
    const busTracker = req.app.get('busTracker');
    const bus = busTracker.getBusLocation(req.params.id);
    if (!bus) return res.status(404).json({ error: `Bus ${req.params.id} not found` });
    res.json(bus);
});

// GET /api/tracking/alerts — current delay/cancellation alerts
router.get('/alerts', (req, res) => {
    const busTracker = req.app.get('busTracker');
    const { route } = req.query;
    res.json(busTracker.getAlerts(route));
});

// GET /api/tracking/eta/:busId/:stop — ETA for a bus at a stop
router.get('/eta/:busId/:stop', (req, res) => {
    const busTracker = req.app.get('busTracker');
    const eta = busTracker.calculateETA(req.params.busId, req.params.stop);
    res.json(eta);
});

module.exports = router;
