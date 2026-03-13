import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom animated bus icon
const createBusIcon = (status) => {
    const color = status === 'on-time' ? '#22c55e' : status === 'late' ? '#f59e0b' : '#ef4444'
    return L.divIcon({
        className: '',
        html: `
            <div style="
                background:${color};
                border:3px solid white;
                border-radius:50%;
                width:28px;height:28px;
                display:flex;align-items:center;justify-content:center;
                box-shadow:0 2px 8px rgba(0,0,0,0.4);
                font-size:14px;
            ">🚌</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    })
}

const stopIcon = L.divIcon({
    className: '',
    html: `<div style="
        background:#3b82f6;border:2px solid white;border-radius:50%;
        width:12px;height:12px;box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
})

// Tamil Nadu stop coordinates
const STOP_COORDS = {
    'Tindivanam':    [12.2317, 79.6475],
    'Melmaruvathur': [12.6934, 79.8714],
    'Chengalpattu':  [12.6921, 79.9762],
    'Chennai':       [13.0827, 80.2707],
    'Puducherry':    [11.9416, 79.8083],
    'Gingee':        [12.2530, 79.4170],
    'Villupuram':    [11.9401, 79.4861],
    'Madurai':       [9.9252,  78.1198],
    'Trichy':        [10.7905, 78.7047],
    'Coimbatore':    [11.0168, 76.9558],
    'Salem':         [11.6643, 78.1460],
    'Dindigul':      [10.3624, 77.9695]
}

function FlyToSelected({ selectedBus }) {
    const map = useMap()
    useEffect(() => {
        if (selectedBus) {
            map.flyTo([selectedBus.lat, selectedBus.lng], 11, { duration: 1.2 })
        }
    }, [selectedBus, map])
    return null
}

function LiveMap({ buses, selectedBus, onBusSelect }) {
    const center = [11.5, 79.5] // Tamil Nadu center

    return (
        <MapContainer
            center={center}
            zoom={7}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToSelected selectedBus={selectedBus} />

            {/* Draw route polyline for selected bus */}
            {selectedBus && selectedBus.stops && (
                <>
                    <Polyline
                        positions={selectedBus.stops
                            .filter(s => STOP_COORDS[s])
                            .map(s => STOP_COORDS[s])}
                        color="#3b82f6"
                        weight={3}
                        dashArray="6 4"
                        opacity={0.7}
                    />
                    {selectedBus.stops.filter(s => STOP_COORDS[s]).map((stop, i) => (
                        <Marker key={i} position={STOP_COORDS[stop]} icon={stopIcon}>
                            <Popup>
                                <div className="text-sm font-medium">{stop}</div>
                            </Popup>
                        </Marker>
                    ))}
                </>
            )}

            {/* Bus markers */}
            {buses.map(bus => (
                <Marker
                    key={bus.id}
                    position={[bus.lat, bus.lng]}
                    icon={createBusIcon(bus.status)}
                    eventHandlers={{ click: () => onBusSelect(bus) }}
                >
                    <Popup>
                        <div className="min-w-[160px]">
                            <div className="font-bold text-blue-600">{bus.id}</div>
                            <div className="font-medium">{bus.name}</div>
                            <div className="text-xs text-gray-600 mt-1">
                                {bus.from_stop} → {bus.to_stop}
                            </div>
                            <div className="text-xs mt-1">
                                Next stop: <span className="font-medium">{bus.nextStop}</span>
                            </div>
                            <div className="text-xs">
                                Speed: <span className="font-medium">{Math.round(bus.speed)} km/h</span>
                            </div>
                            <div className={`text-xs font-semibold mt-1 ${
                                bus.status === 'on-time' ? 'text-green-600' :
                                bus.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                ● {bus.status.toUpperCase()}
                                {bus.delayMinutes > 0 && ` (+${bus.delayMinutes}m)`}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}

export default LiveMap
