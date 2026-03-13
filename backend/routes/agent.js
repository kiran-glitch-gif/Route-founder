const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const agentOrchestrator = require('../services/agentOrchestrator');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /api/agent/chat — Agentic chat with tool use
router.post('/chat', async (req, res) => {
    try {
        const { message, session_id, context = {} } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const busTracker = req.app.get('busTracker');
        let sessionId = session_id;
        let conversationHistory = [];

        // Load existing session
        if (sessionId) {
            try {
                const result = await pool.query('SELECT messages FROM chat_sessions WHERE id = $1', [sessionId]);
                if (result.rows.length > 0) {
                    conversationHistory = (result.rows[0].messages || []).filter(
                        m => m.role === 'user' || m.role === 'assistant'
                    );
                }
            } catch (_) {}
        } else {
            sessionId = uuidv4();
        }

        // Run the agentic loop
        const { response: aiResponse, toolsUsed } = await agentOrchestrator.runAgent(
            message,
            conversationHistory,
            busTracker,
            context
        );

        // Persist conversation
        const newMessages = [
            ...conversationHistory,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ];

        await pool.query(
            `INSERT INTO chat_sessions (id, messages, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET messages = $2, updated_at = CURRENT_TIMESTAMP`,
            [sessionId, JSON.stringify(newMessages)]
        );

        res.json({ response: aiResponse, session_id: sessionId, tools_used: toolsUsed });
    } catch (error) {
        console.error('Agent chat error:', error);
        res.status(500).json({ error: 'Failed to process message', detail: error.message });
    }
});

// GET /api/agent/sessions/:id
router.get('/sessions/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM chat_sessions WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

module.exports = router;
