const express = require('express');
const router = express.Router();
const busService = require('../services/busService');

// GET /api/stops - Get all stops for autocomplete
router.get('/', async (req, res) => {
    try {
        const stops = await busService.getAllStops();
        res.json(stops);
    } catch (error) {
        console.error('Error fetching stops:', error);
        res.status(500).json({ error: 'Failed to fetch stops' });
    }
});

// GET /api/routes - Get all available routes
router.get('/routes', async (req, res) => {
    try {
        const routes = await busService.getAllRoutes();
        res.json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
});

module.exports = router;