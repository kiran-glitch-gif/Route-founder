import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import BusCard from '../components/BusCard'
import AgentChat from '../components/AgentChat'
import { Bus, MessageCircle, X } from 'lucide-react'
import axios from 'axios'

function Home() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSearch = async (searchParams) => {
    setLoading(true)
    setSearchPerformed(true)
    
    try {
      const { from, to } = searchParams
      const response = await axios.get(`/api/buses/search?from=${from}&to=${to}`)
      setBuses(response.data)
    } catch (error) {
      console.error('Search error:', error)
      setBuses([])
    } finally {
      setLoading(false)
    }
  }

  const loadAllBuses = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/buses')
      setBuses(response.data)
      setSearchPerformed(true)
    } catch (error) {
      console.error('Error loading buses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllBuses()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bus className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bus Schedule Agent</h1>
                <p className="text-sm text-gray-600">Smart bus finder for Tamil Nadu</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center space-x-2 btn-primary"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Ask AI Agent</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search Section */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4">Find Your Bus</h2>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Results Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {searchPerformed ? `Available Buses (${buses.length})` : 'Loading Buses...'}
                </h2>
                {searchPerformed && (
                  <button
                    onClick={loadAllBuses}
                    className="btn-secondary text-sm"
                  >
                    Show All Buses
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : buses.length > 0 ? (
                <div className="space-y-4">
                  {buses.map((bus) => (
                    <BusCard key={bus.id} bus={bus} />
                  ))}
                </div>
              ) : searchPerformed ? (
                <div className="text-center py-12">
                  <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
                  <p className="text-gray-600">Try searching for a different route or check back later.</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            {showChat ? (
              <div className="card h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h3 className="text-lg font-semibold">AI Bus Assistant</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <AgentChat />
              </div>
            ) : (
              <div className="card text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Ask our AI agent about bus routes, timings, and travel tips.
                </p>
                <button
                  onClick={() => setShowChat(true)}
                  className="btn-primary"
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home