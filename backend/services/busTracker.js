/**
 * BusTracker — Real-time GPS simulation for Tamil Nadu buses.
 * Buses move along their actual stop sequences every 3 seconds.
 * Replace _moveBus() with real GPS device feeds in production.
 */

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

const BUS_ROUTES = [
    {
        id: 'SKV-01', name: 'SKV Express',
        from_stop: 'Tindivanam', to_stop: 'Chennai',
        departure: '21:00', arrival: '23:30', duration: '2h 30m',
        type: 'Express', operator: 'SKV Travels', fare: 150,
        stops: ['Tindivanam', 'Melmaruvathur', 'Chengalpattu', 'Chennai']
    },
    {
        id: 'SKV-02', name: 'SKV Deluxe',
        from_stop: 'Tindivanam', to_stop: 'Chennai',
        departure: '06:30', arrival: '09:00', duration: '2h 30m',
        type: 'Deluxe', operator: 'SKV Travels', fare: 200,
        stops: ['Tindivanam', 'Melmaruvathur', 'Chengalpattu', 'Chennai']
    },
    {
        id: 'PNR-01', name: 'Ponnar Travels',
        from_stop: 'Tindivanam', to_stop: 'Chennai',
        departure: '23:00', arrival: '01:30', duration: '2h 30m',
        type: 'Sleeper', operator: 'Ponnar', fare: 250,
        stops: ['Tindivanam', 'Melmaruvathur', 'Chengalpattu', 'Chennai']
    },
    {
        id: 'PNY-10', name: 'Pondy Express',
        from_stop: 'Tindivanam', to_stop: 'Puducherry',
        departure: '08:00', arrival: '09:30', duration: '1h 30m',
        type: 'Express', operator: 'PRTC', fare: 80,
        stops: ['Tindivanam', 'Gingee', 'Puducherry']
    },
    {
        id: 'TNN-21', name: 'TN State Bus',
        from_stop: 'Tindivanam', to_stop: 'Villupuram',
        departure: '07:00', arrival: '07:45', duration: '45m',
        type: 'Ordinary', operator: 'TNSTC', fare: 30,
        stops: ['Tindivanam', 'Villupuram']
    },
    {
        id: 'CHN-MDU', name: 'Madurai King',
        from_stop: 'Chennai', to_stop: 'Madurai',
        departure: '21:30', arrival: '05:30', duration: '8h',
        type: 'AC Sleeper', operator: 'KPN Travels', fare: 800,
        stops: ['Chennai', 'Chengalpattu', 'Villupuram', 'Trichy', 'Dindigul', 'Madurai']
    },
    {
        id: 'CHN-TCY', name: 'Trichy Rider',
        from_stop: 'Chennai', to_stop: 'Trichy',
        departure: '20:00', arrival: '02:00', duration: '6h',
        type: 'Express', operator: 'SRS Travels', fare: 400,
        stops: ['Chennai', 'Chengalpattu', 'Villupuram', 'Trichy']
    },
    {
        id: 'CBE-CHN', name: 'Coimbatore Express',
        from_stop: 'Coimbatore', to_stop: 'Chennai',
        departure: '22:00', arrival: '06:00', duration: '8h',
        type: 'AC Sleeper', operator: 'KPN Travels', fare: 750,
        stops: ['Coimbatore', 'Salem', 'Villupuram', 'Chennai']
    },
    {
        id: 'SLM-CHN', name: 'Salem Special',
        from_stop: 'Salem', to_stop: 'Chennai',
        departure: '19:30', arrival: '01:30', duration: '6h',
        type: 'Express', operator: 'SRS Travels', fare: 350,
        stops: ['Salem', 'Villupuram', 'Chennai']
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
            const from = STOP_COORDS[bus.stops[stopIndex]];
            const to   = STOP_COORDS[bus.stops[stopIndex + 1]] || from;
            const progress = Math.random();

            this.busLocations[bus.id] = {
                ...bus,
                lat:          from.lat + (to.lat - from.lat) * progress,
                lng:          from.lng + (to.lng - from.lng) * progress,
                speed:        40 + Math.random() * 30,
                currentStop:  bus.stops[stopIndex],
                nextStop:     bus.stops[stopIndex + 1] || bus.to_stop,
                stopIndex,
                progress,
                status:       Math.random() > 0.85 ? 'late' : 'on-time',
                delayMinutes: 0,
                heading:      0,
                passengers:   Math.floor(Math.random() * 40) + 10,
                lastUpdated:  new Date().toISOString()
            };
        });
    }

    _startSimulation() {
        setInterval(() => {
            Object.keys(this.busLocations).forEach(id => this._moveBus(id));
        }, 3000);
    }

    _moveBus(busId) {
        const bus = this.busLocations[busId];
        if (!bus) return;

        const { stops } = bus;
        const nextIdx = bus.stopIndex + 1;

        // Reset when route is complete
        if (nextIdx >= stops.length) {
            bus.stopIndex = 0;
            bus.progress  = 0;
            bus.currentStop = stops[0];
            bus.nextStop    = stops[1];
            return;
        }

        const from = STOP_COORDS[stops[bus.stopIndex]];
        const to   = STOP_COORDS[stops[nextIdx]];
        if (!from || !to) return;

        bus.progress += 0.015 + Math.random() * 0.01;

        if (bus.progress >= 1) {
            // Arrived at next stop
            bus.stopIndex   = nextIdx;
            bus.progress    = 0;
            bus.currentStop = stops[nextIdx];
            bus.nextStop    = stops[nextIdx + 1] || bus.to_stop;

            // Random delay event
            if (Math.random() < 0.05) {
                bus.status       = 'late';
                bus.delayMinutes = Math.floor(Math.random() * 20) + 5;
                this._addAlert(bus);
            } else if (bus.status === 'late' && Math.random() < 0.3) {
                bus.status       = 'on-time';
                bus.delayMinutes = 0;
            }
        } else {
            bus.lat = from.lat + (to.lat - from.lat) * bus.progress;
            bus.lng = from.lng + (to.lng - from.lng) * bus.progress;
            bus.heading = Math.atan2(to.lng - from.lng, to.lat - from.lat) * (180 / Math.PI);
        }

        bus.speed       = 35 + Math.random() * 25;
        bus.lastUpdated = new Date().toISOString();
    }

    _addAlert(bus) {
        this.alerts.unshift({
            id:        `alert-${Date.now()}`,
            busId:     bus.id,
            busName:   bus.name,
            type:      'delay',
            message:   `${bus.id} (${bus.name}) is running ${bus.delayMinutes} minutes late near ${bus.currentStop}`,
            route:     `${bus.from_stop} → ${bus.to_stop}`,
            timestamp: new Date().toISOString()
        });
        if (this.alerts.length > 20) this.alerts.pop();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    getAllLocations() {
        return Object.values(this.busLocations);
    }

    getBusLocation(busId) {
        return this.busLocations[busId] || null;
    }

    searchBuses(from, to) {
        return Object.values(this.busLocations).filter(b =>
            b.from_stop.toLowerCase() === from.toLowerCase() &&
            b.to_stop.toLowerCase()   === to.toLowerCase()
        );
    }

    calculateETA(busId, stopName) {
        const bus = this.busLocations[busId];
        if (!bus) return { error: 'Bus not found' };

        const stopIdx = bus.stops.indexOf(stopName);
        if (stopIdx === -1) return { error: `${stopName} is not on this route` };
        if (stopIdx < bus.stopIndex) return { message: `Bus has already passed ${stopName}` };

        const stopsRemaining = stopIdx - bus.stopIndex;
        const etaMinutes     = stopsRemaining * 30 + bus.delayMinutes;
        const eta            = new Date(Date.now() + etaMinutes * 60000);

        return {
            busId,
            stop:         stopName,
            etaMinutes,
            etaTime:      eta.toLocaleTimeString('en-IN'),
            status:       bus.status,
            delayMinutes: bus.delayMinutes
        };
    }

    getAlerts(route) {
        if (route) {
            return this.alerts.filter(a =>
                a.route.toLowerCase().includes(route.toLowerCase())
            );
        }
        return this.alerts;
    }

    getAlternatives(from, to, avoidBusId) {
        return Object.values(this.busLocations).filter(b =>
            b.from_stop.toLowerCase() === from.toLowerCase() &&
            b.to_stop.toLowerCase()   === to.toLowerCase()   &&
            b.id !== avoidBusId &&
            b.status !== 'cancelled'
        );
    }
}

module.exports = new BusTracker();
