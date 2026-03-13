const express = require('express');
const router = express.Router();
const busService = require('../services/busService');

// GET /api/stops — all stop names (for autocomplete)
router.get('/', async (req, res) => {
    try {
        const stops = await busService.getAllStops();
        res.json(stops);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stops', detail: err.message });
    }
});

// GET /api/routes — all unique routes with bus count
router.get('/routes', async (req, res) => {
    try {
        const routes = await busService.getAllRoutes();
        res.json(routes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch routes', detail: err.message });
    }
});

module.exports = router;
