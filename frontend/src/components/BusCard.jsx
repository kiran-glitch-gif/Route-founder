import React from 'react'
import { Clock, MapPin, IndianRupee, Navigation, Zap } from 'lucide-react'

function BusCard({ bus, liveData, onTrack }) {
    const live = liveData || bus

    const formatTime = (t) => {
        if (!t) return '--'
        const [h, m] = t.split(':')
        const hour = parseInt(h)
        return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
    }

    const statusColor = {
        'on-time': 'bg-green-500',
        'late': 'bg-yellow-500 animate-pulse',
        'cancelled': 'bg-red-500'
    }[live.status] || 'bg-gray-400'

    const statusText = {
        'on-time': 'text-green-700 bg-green-50',
        'late': 'text-yellow-700 bg-yellow-50',
        'cancelled': 'text-red-700 bg-red-50'
    }[live.status] || 'text-gray-600 bg-gray-50'

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {bus.id}
                        </span>
                        <h3 className="font-semibold text-gray-900">{bus.name}</h3>
                        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusText}`}>
                            {live.status}
                            {live.delayMinutes > 0 && ` +${live.delayMinutes}m`}
                        </span>
                    </div>

                    {/* Type & Operator */}
                    <div className="text-xs text-gray-500 mb-3">
                        {bus.type} · {bus.operator}
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{bus.from_stop}</span>
                        <div className="flex-1 border-t border-dashed border-gray-300 mx-1"></div>
                        <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="font-medium">{bus.to_stop}</span>
                    </div>

                    {/* Live position if available */}
                    {liveData && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <Navigation className="h-3 w-3" />
                            <span>Near <strong>{liveData.currentStop}</strong> → {liveData.nextStop}</span>
                            <Zap className="h-3 w-3 ml-auto" />
                            <span>{Math.round(liveData.speed)} km/h</span>
                        </div>
                    )}
                </div>

                {/* Time & Fare */}
                <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-2xl font-bold text-blue-600">{formatTime(bus.departure)}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {bus.duration}
                    </div>
                    <div className="flex items-center justify-end gap-0.5 text-green-600 font-semibold mt-1">
                        <IndianRupee className="h-4 w-4" />
                        <span>{bus.fare}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Arrives: {formatTime(bus.arrival)}</span>
                <button
                    onClick={onTrack}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Navigation className="h-3 w-3" />
                    Track Live
                </button>
            </div>
        </div>
    )
}

export default BusCard
