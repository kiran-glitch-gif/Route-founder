import React from 'react'
import { Clock, MapPin, IndianRupee, Users, Wifi, Snowflake } from 'lucide-react'

function BusCard({ bus }) {
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time': return 'bg-green-500'
      case 'late': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getBusTypeIcon = (type) => {
    if (type.includes('AC')) return <Snowflake className="h-4 w-4" />
    if (type.includes('Wifi')) return <Wifi className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        {/* Bus Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {bus.id}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">{bus.name}</h3>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(bus.status)}`}></div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              {getBusTypeIcon(bus.type)}
              <span>{bus.type}</span>
            </div>
            <span>•</span>
            <span>{bus.operator}</span>
          </div>

          {/* Route Info */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium">{bus.from_stop}</span>
            </div>
            <div className="flex-1 border-t border-dashed border-gray-300"></div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="font-medium">{bus.to_stop}</span>
            </div>
          </div>
        </div>

        {/* Time & Price */}
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {formatTime(bus.departure)}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            {bus.duration}
          </div>
          <div className="flex items-center justify-end space-x-1 text-lg font-semibold text-green-600">
            <IndianRupee className="h-5 w-5" />
            <span>{bus.fare}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Arrives: {formatTime(bus.arrival)}
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary text-sm">
            View Route
          </button>
          <button className="btn-primary text-sm">
            Track Live
          </button>
        </div>
      </div>
    </div>
  )
}

export default BusCard