const express = require('express');
const router = express.Router();
const busService = require('../services/busService');

// GET /api/buses - Get all buses
router.get('/', async (req, res) => {
    try {
        const buses = await busService.getAllBuses();
        res.json(buses);
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).json({ error: 'Failed to fetch buses' });
    }
});

// GET /api/buses/search - Search buses by route
router.get('/search', async (req, res) => {
    try {
        const { from, to } = req.query;
        
        if (!from || !to) {
            return res.status(400).json({ error: 'Both from and to parameters are required' });
        }

        const buses = await busService.searchBuses(from, to);
        res.json(buses);
    } catch (error) {
        console.error('Error searching buses:', error);
        res.status(500).json({ error: 'Failed to search buses' });
    }
});

// GET /api/buses/:id - Get single bus details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bus = await busService.getBusById(id);
        
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        
        res.json(bus);
    } catch (error) {
        console.error('Error fetching bus:', error);
        res.status(500).json({ error: 'Failed to fetch bus details' });
    }
});

// GET /api/buses/live-status/:id - Get live status (mock for now)
router.get('/live-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bus = await busService.getBusById(id);
        
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        
        // Mock live status data
        const liveStatus = {
            busId: id,
            currentLocation: 'En route',
            delay: Math.floor(Math.random() * 30), // Random delay 0-30 minutes
            nextStop: bus.stops ? bus.stops[1] : 'Unknown',
            estimatedArrival: bus.arrival,
            status: bus.status
        };
        
        res.json(liveStatus);
    } catch (error) {
        console.error('Error fetching live status:', error);
        res.status(500).json({ error: 'Failed to fetch live status' });
    }
});

module.exports = router;