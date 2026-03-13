/**
 * BusTracker Service
 * Simulates real-time GPS positions for buses along their routes.
 * In production, replace the simulation with actual GPS device feeds.
 */

// Tamil Nadu stop coordinates
const STOP_COORDS = {
    'Tindivanam':    { lat: 12.2317, lng: 79.6475 },
    'Melmaruvathur': { lat: 12.6934, lng: 79.8714 },
    'Chengalpattu':  { lat: 12.6921, lng: 79.9762 },
    'Chennai':       { lat: 13.0827, lng: 80.2707 },
    'Puducherry':    { lat: 11.9416, lng: 79.8083 },
    'Gingee':        { lat: 12.2530, lng: 79.4170 },
    'Villupuram':    { lat: 11.9401, lng: 79.4861 },
    'Madurai':       { lat: 9.9252,  lng: 78.1198 },
    'Trichy':        { lat: 10.7905, lng: 78.7047 },
    'Coimbatore':    { lat: 11.0168, lng: 76.9558 },
    'Salem':         { lat: 11.6643, lng: 78.1460 },
    'Dindigul':      { lat: 10.3624, lng: 77.9695 }
};

// Seed bus data with route stop arrays
const BUS_ROUTES = [
    {
        id: 'SKV-01', name: 'SKV Express', from_stop: 'Tindivanam', to_stop: 'Chennai',
        departure: '21:00', arrival: '23:30', duration: '2h 30m',
        type: 'Express', operator: 'SKV Travels', fare: 150,
        stops: ['Tindivanam', 'Melmaruvathur', 'Chengalpattu', 'Chennai'],
        days: ['Daily']
    },
    {
        id: 'SKV-02', name: 'SKV Deluxe', from_stop: 'Tindivanam', to_stop: 'Chennai',
        departure: '06:30', arrival: '09:00', duration: '2h 30m',
        type: 'Deluxe', operator: 'SKV Travels', fare: 200,
        stops: ['Tindivanam', 'Melmaruvathur', 'Chengalpattu', 'Chennai'],
        days: ['Daily']
    },
    {
        id: 'PNR-01', name: 'Ponnar Travels', from_stop: 'Tindivanam', to_stop: 'Chennai',
        departure: '23:00', arrival: '01:30', duration: '2h 30m',
        type: 'Sleeper', operator: 'Ponnar', fare: 250,
        stops: ['Tindivanam', 'Melmaruvathur', 'Chengalpattu', 'Chennai'],
        days: ['Daily']
    },
    {
        id: 'PNY-10', name: 'Pondy Express', from_stop: 'Tindivanam', to_stop: 'Puducherry',
        departure: '08:00', arrival: '09:30', duration: '1h 30m',
        type: 'Express', operator: 'PRTC', fare: 80,
        stops: ['Tindivanam', 'Gingee', 'Puducherry'],
        days: ['Daily']
    },
    {
        id: 'TNN-21', name: 'TN State Bus', from_stop: 'Tindivanam', to_stop: 'Villupuram',
        departure: '07:00', arrival: '07:45', duration: '45m',
        type: 'Ordinary', operator: 'TNSTC', fare: 30,
        stops: ['Tindivanam', 'Villupuram'],
        days: ['Daily']
    },
    {
        id: 'CHN-MDU', name: 'Madurai King', from_stop: 'Chennai', to_stop: 'Madurai',
        departure: '21:30', arrival: '05:30', duration: '8h',
        type: 'AC Sleeper', operator: 'KPN Travels', fare: 800,
        stops: ['Chennai', 'Chengalpattu', 'Villupuram', 'Trichy', 'Dindigul', 'Madurai'],
        days: ['Daily']
    },
    {
        id: 'CHN-TCY', name: 'Trichy Rider', from_stop: 'Chennai', to_stop: 'Trichy',
        departure: '20:00', arrival: '02:00', duration: '6h',
        type: 'Express', operator: 'SRS Travels', fare: 400,
        stops: ['Chennai', 'Chengalpattu', 'Villupuram', 'Trichy'],
        days: ['Daily']
    }
];

class BusTracker {
    constructor() {
        this.busLocations = {};
        this.alerts = [];
        this._initBuses();
        this._startSimulation();
    }

    _initBuses() {
        BUS_ROUTES.forEach(bus => {
            const stopIndex = Math.floor(Math.random() * (bus.stops.length - 1));
            const fromCoord = STOP_COORDS[bus.stops[stopIndex]];
            const toCoord = STOP_COORDS[bus.stops[stopIndex + 1]] || fromCoord;
            const progress = Math.random();

            this.busLocations[bus.id] = {
                ...bus,
                lat: fromCoord.lat + (toCoord.lat - fromCoord.lat) * progress,
                lng: fromCoord.lng + (toCoord.lng - fromCoord.lng) * progress,
                speed: 40 + Math.random() * 30,
                currentStop: bus.stops[stopIndex],
                nextStop: bus.stops[stopIndex + 1] || bus.to_stop,
                stopIndex,
                progress,
                status: Math.random() > 0.85 ? 'late' : 'on-time',
                delayMinutes: 0,
                heading: 0,
                lastUpdated: new Date().toISOString(),
                passengers: Math.floor(Math.random() * 40) + 10
            };
        });
    }

    _startSimulation() {
        setInterval(() => {
            Object.keys(this.busLocations).forEach(busId => {
                this._moveBus(busId);
            });
        }, 3000); // Update every 3 seconds
    }

    _moveBus(busId) {
        const bus = this.busLocations[busId];
        if (!bus) return;

        const stops = bus.stops;
        const fromCoord = STOP_COORDS[stops[bus.stopIndex]];
        const nextIdx = bus.stopIndex + 1;

        if (nextIdx >= stops.length) {
            // Bus completed route — reset to start
            bus.stopIndex = 0;
            bus.progress = 0;
            bus.currentStop = stops[0];
            bus.nextStop = stops[1];
            return;
        }

        const toCoord = STOP_COORDS[stops[nextIdx]];
        if (!fromCoord || !toCoord) return;

        // Advance progress
        bus.progress += 0.015 + Math.random() * 0.01;

        if (bus.progress >= 1) {
            // Arrived at next stop
            bus.stopIndex = nextIdx;
            bus.progress = 0;
            bus.currentStop = stops[nextIdx];
            bus.nextStop = stops[nextIdx + 1] || bus.to_stop;

            // Occasionally introduce a delay
            if (Math.random() < 0.05) {
                bus.status = 'late';
                bus.delayMinutes = Math.floor(Math.random() * 20) + 5;
                this._addAlert(bus);
            } else if (bus.status === 'late' && Math.random() < 0.3) {
                bus.status = 'on-time';
                bus.delayMinutes = 0;
            }
        } else {
            // Interpolate position between stops
            bus.lat = fromCoord.lat + (toCoord.lat - fromCoord.lat) * bus.progress;
            bus.lng = fromCoord.lng + (toCoord.lng - fromCoord.lng) * bus.progress;
            bus.heading = Math.atan2(toCoord.lng - fromCoord.lng, toCoord.lat - fromCoord.lat) * (180 / Math.PI);
        }

        bus.speed = 35 + Math.random() * 25;
        bus.lastUpdated = new Date().toISOString();
    }

    _addAlert(bus) {
        const alert = {
            id: `alert-${Date.now()}`,
            busId: bus.id,
            busName: bus.name,
            type: 'delay',
            message: `${bus.id} (${bus.name}) is running ${bus.delayMinutes} minutes late near ${bus.currentStop}`,
            timestamp: new Date().toISOString(),
            route: `${bus.from_stop} → ${bus.to_stop}`
        };
        this.alerts.unshift(alert);
        if (this.alerts.length > 20) this.alerts.pop();
    }

    getAllLocations() {
        return Object.values(this.busLocations);
    }

    getBusLocation(busId) {
        return this.busLocations[busId] || null;
    }

    searchBuses(from, to) {
        return Object.values(this.busLocations).filter(bus =>
            bus.from_stop.toLowerCase() === from.toLowerCase() &&
            bus.to_stop.toLowerCase() === to.toLowerCase()
        );
    }

    calculateETA(busId, stopName) {
        const bus = this.busLocations[busId];
        if (!bus) return { error: 'Bus not found' };

        const stopIdx = bus.stops.indexOf(stopName);
        if (stopIdx === -1) return { error: `${stopName} is not on this route` };

        const stopsRemaining = stopIdx - bus.stopIndex;
        if (stopsRemaining < 0) return { message: `Bus has already passed ${stopName}` };

        const minutesPerStop = 30;
        const etaMinutes = stopsRemaining * minutesPerStop + bus.delayMinutes;
        const eta = new Date(Date.now() + etaMinutes * 60000);

        return {
            busId,
            stop: stopName,
            etaMinutes,
            etaTime: eta.toLocaleTimeString('en-IN'),
            status: bus.status,
            delayMinutes: bus.delayMinutes
        };
    }

    getAlerts(route) {
        if (route) {
            return this.alerts.filter(a => a.route.toLowerCase().includes(route.toLowerCase()));
        }
        return this.alerts;
    }

    getAlternatives(from, to, avoidBusId) {
        return Object.values(this.busLocations).filter(bus =>
            bus.from_stop.toLowerCase() === from.toLowerCase() &&
            bus.to_stop.toLowerCase() === to.toLowerCase() &&
            bus.id !== avoidBusId &&
            bus.status !== 'cancelled'
        );
    }
}

module.exports = new BusTracker();
