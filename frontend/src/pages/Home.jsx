import React, { useState, useEffect, lazy, Suspense } from 'react'
import SearchBar from '../components/SearchBar'
import BusCard from '../components/BusCard'
import AgentChat from '../components/AgentChat'
import TrackingPanel from '../components/TrackingPanel'
import { useSocket } from '../hooks/useSocket'
import { Bus, MessageCircle, Map, Search, Wifi, WifiOff } from 'lucide-react'
import axios from 'axios'

// Lazy load map to avoid SSR issues with Leaflet
const LiveMap = lazy(() => import('../components/LiveMap'))

const TABS = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'tracking', label: 'Live Tracking', icon: Map },
    { id: 'chat', label: 'AI Agent', icon: MessageCircle },
]

function Home() {
    const [activeTab, setActiveTab] = useState('search')
    const [buses, setBuses] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedBus, setSelectedBus] = useState(null)
    const { buses: liveBuses, alerts, connected, trackBus, untrackBus } = useSocket()

    const handleSearch = async ({ from, to }) => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/buses/search?from=${from}&to=${to}`)
            setBuses(res.data)
        } catch {
            setBuses([])
        } finally {
            setLoading(false)
        }
    }

    const handleBusSelect = (bus) => {
        setSelectedBus(bus)
        trackBus(bus.id)
    }

    useEffect(() => {
        axios.get('/api/buses').then(r => setBuses(r.data)).catch(() => {})
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-xl">
                            <Bus className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Bus Schedule Agent</h1>
                            <p className="text-xs text-blue-300">Tamil Nadu Real-Time Tracker</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live connection indicator */}
                        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                            connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {connected
                                ? <><Wifi className="h-3 w-3" /> Live</>
                                : <><WifiOff className="h-3 w-3" /> Offline</>
                            }
                        </div>

                        {/* Alert badge */}
                        {alerts.length > 0 && (
                            <div className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1.5 rounded-full">
                                ⚠ {alerts.length} alert{alerts.length > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white text-blue-700'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                                {tab.id === 'tracking' && connected && (
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* ── SEARCH TAB ── */}
                {activeTab === 'search' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Find Your Bus</h2>
                            <SearchBar onSearch={handleSearch} />
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-white font-semibold">
                                    {buses.length} bus{buses.length !== 1 ? 'es' : ''} found
                                </h3>
                                {buses.map(bus => (
                                    <BusCard
                                        key={bus.id}
                                        bus={bus}
                                        liveData={liveBuses.find(b => b.id === bus.id)}
                                        onTrack={() => {
                                            handleBusSelect(bus)
                                            setActiveTab('tracking')
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── LIVE TRACKING TAB ── */}
                {activeTab === 'tracking' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
                        {/* Map */}
                        <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden shadow-lg" style={{ minHeight: '500px' }}>
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            }>
                                <LiveMap
                                    buses={liveBuses}
                                    selectedBus={selectedBus}
                                    onBusSelect={handleBusSelect}
                                />
                            </Suspense>
                        </div>

                        {/* Tracking Panel */}
                        <div className="bg-white rounded-xl shadow-lg p-4 overflow-hidden flex flex-col">
                            <TrackingPanel
                                buses={liveBuses}
                                selectedBus={selectedBus}
                                onBusSelect={handleBusSelect}
                                alerts={alerts}
                            />
                        </div>
                    </div>
                )}

                {/* ── AI AGENT TAB ── */}
                {activeTab === 'chat' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg p-6" style={{ height: '70vh' }}>
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                                <div className="bg-purple-100 p-2 rounded-xl">
                                    <MessageCircle className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">AI Bus Agent</h3>
                                    <p className="text-xs text-gray-500">Powered by Claude · Uses live bus data</p>
                                </div>
                            </div>
                            <div className="h-[calc(100%-80px)]">
                                <AgentChat />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home
