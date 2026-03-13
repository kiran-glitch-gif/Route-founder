import React, { useState, useEffect } from 'react'
import { Search, MapPin } from 'lucide-react'
import axios from 'axios'

function SearchBar({ onSearch }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [stops, setStops] = useState([])
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await axios.get('/api/stops')
        setStops(response.data)
      } catch (error) {
        console.error('Error fetching stops:', error)
      }
    }
    fetchStops()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (from && to) {
      onSearch({ from, to })
    }
  }

  const filteredStops = (query) => {
    return stops.filter(stop => 
      stop.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }

  const selectStop = (stop, field) => {
    if (field === 'from') {
      setFrom(stop)
      setShowFromSuggestions(false)
    } else {
      setTo(stop)
      setShowToSuggestions(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            From
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setShowFromSuggestions(true)
            }}
            onFocus={() => setShowFromSuggestions(true)}
            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
            placeholder="Enter departure city"
            className="input-field"
            required
          />
          
          {showFromSuggestions && from && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredStops(from).map((stop, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectStop(stop, 'from')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  {stop}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* To Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            To
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setShowToSuggestions(true)
            }}
            onFocus={() => setShowToSuggestions(true)}
            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
            placeholder="Enter destination city"
            className="input-field"
            required
          />
          
          {showToSuggestions && to && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredStops(to).map((stop, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectStop(stop, 'to')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  {stop}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full btn-primary flex items-center justify-center space-x-2"
      >
        <Search className="h-5 w-5" />
        <span>Search Buses</span>
      </button>
    </form>
  )
}

export default SearchBar