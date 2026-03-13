import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Wrench } from 'lucide-react'
import axios from 'axios'

const SUGGESTIONS = [
    'Where is SKV-01 right now?',
    'Buses from Tindivanam to Chennai',
    'Is CHN-MDU running on time?',
    'Cheapest bus to Puducherry',
    'Any delays today?',
    'When does SKV-02 reach Chennai?'
]

function AgentChat({ context = {} }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I\'m your Tamil Nadu bus AI agent. I can track live buses, check delays, find routes, and calculate ETAs. What do you need?',
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const [toolsUsed, setToolsUsed] = useState(0)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text) => {
        const msg = text || input.trim()
        if (!msg || loading) return

        setMessages(prev => [...prev, { role: 'user', content: msg }])
        setInput('')
        setLoading(true)

        try {
            const res = await axios.post('/api/agent/chat', {
                message: msg,
                session_id: sessionId,
                context
            })
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
            setSessionId(res.data.session_id)
            setToolsUsed(prev => prev + (res.data.tools_used || 0))
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please check your API key and try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Tool usage badge */}
            {toolsUsed > 0 && (
                <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2">
                    <Wrench className="h-3 w-3" />
                    Agent used {toolsUsed} tool calls this session
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-600'
                            }`}>
                                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl rounded-tl-none">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span className="text-xs text-gray-500">Agent thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length === 1 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(s)}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about live buses, delays, ETAs..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    )
}

export default AgentChat
