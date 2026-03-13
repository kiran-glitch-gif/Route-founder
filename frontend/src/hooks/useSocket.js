import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
    const socketRef = useRef(null)
    const [buses, setBuses] = useState([])
    const [alerts, setAlerts] = useState([])
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        socketRef.current = io('http://localhost:3001', {
            transports: ['websocket', 'polling']
        })

        socketRef.current.on('connect', () => {
            setConnected(true)
            console.log('🔌 Connected to real-time tracking')
        })

        socketRef.current.on('disconnect', () => {
            setConnected(false)
        })

        socketRef.current.on('bus:all', (data) => {
            setBuses(data)
        })

        socketRef.current.on('bus:alerts', (data) => {
            setAlerts(data)
        })

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    const trackBus = (busId) => {
        socketRef.current?.emit('track:bus', busId)
    }

    const untrackBus = (busId) => {
        socketRef.current?.emit('untrack:bus', busId)
    }

    return { buses, alerts, connected, trackBus, untrackBus }
}
