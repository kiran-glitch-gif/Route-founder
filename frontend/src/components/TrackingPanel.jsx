import React from 'react'
import { Navigation, Clock, Users, Zap, AlertTriangle } from 'lucide-react'

function TrackingPanel({ buses, selectedBus, onBusSelect, alerts }) {
    const getStatusColor = (status) => {
        if (status === 'on-time') return 'text-green-600 bg-green-50'
        if (status === 'late') return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    const getStatusDot = (status) => {
        if (status === 'on-time') return 'bg-green-500'
        if (status === 'late') return 'bg-yellow-500 animate-pulse'
        return 'bg-red-500 animate-pulse'
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-800">Live Alerts</span>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                        {alerts.slice(0, 3).map(alert => (
                            <p key={alert.id} className="text-xs text-yellow-700">{alert.message}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Bus List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 sticky top-0 bg-white pb-1">
                    Live Buses ({buses.length})
                </h3>
                {buses.map(bus => (
                    <div
                        key={bus.id}
                        onClick={() => onBusSelect(bus)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedBus?.id === bus.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {bus.id}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${getStatusDot(bus.status)}`}></div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(bus.status)}`}>
                                {bus.status}
                                {bus.delayMinutes > 0 && ` +${bus.delayMinutes}m`}
                            </span>
                        </div>

                        <div className="text-sm font-medium text-gray-800">{bus.name}</div>
                        <div className="text-xs text-gray-500">{bus.from_stop} → {bus.to_stop}</div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {bus.nextStop}
                            </span>
                            <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {Math.round(bus.speed)} km/h
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {bus.passengers}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Bus Detail */}
            {selectedBus && (
                <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Route Progress</h4>
                    <div className="space-y-1">
                        {selectedBus.stops?.map((stop, i) => {
                            const isPassed = i < selectedBus.stopIndex
                            const isCurrent = i === selectedBus.stopIndex
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                        isPassed ? 'bg-green-500' :
                                        isCurrent ? 'bg-blue-500 animate-pulse' :
                                        'bg-gray-300'
                                    }`}></div>
                                    <span className={`text-xs ${
                                        isCurrent ? 'font-bold text-blue-600' :
                                        isPassed ? 'text-gray-400 line-through' :
                                        'text-gray-600'
                                    }`}>{stop}</span>
                                    {isCurrent && (
                                        <span className="text-xs text-blue-500 ml-auto">← Now</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TrackingPanel
