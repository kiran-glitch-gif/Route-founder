const express = require('express');
const router = express.Router();
const busService = require('../services/busService');

// GET /api/buses — all buses
router.get('/', async (req, res) => {
    try {
        const buses = await busService.getAllBuses();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch buses', detail: err.message });
    }
});

// GET /api/buses/search?from=&to= — search by route
router.get('/search', async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({ error: 'Both from and to query params are required' });
        }
        const buses = await busService.searchBuses(from, to);
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: 'Search failed', detail: err.message });
    }
});

// GET /api/buses/:id — single bus
router.get('/:id', async (req, res) => {
    try {
        const bus = await busService.getBusById(req.params.id);
        if (!bus) return res.status(404).json({ error: `Bus ${req.params.id} not found` });
        res.json(bus);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bus', detail: err.message });
    }
});

module.exports = router;
