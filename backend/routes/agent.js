const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const agentOrchestrator = require('../services/agentOrchestrator');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// POST /api/agent/chat — agentic chat with tool use
router.post('/chat', async (req, res) => {
    try {
        const { message, session_id, context = {} } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'message (string) is required' });
        }

        const busTracker = req.app.get('busTracker');
        let sessionId = session_id || uuidv4();
        let conversationHistory = [];

        // Load existing session history from DB
        try {
            const result = await pool.query(
                'SELECT messages FROM chat_sessions WHERE id = $1',
                [sessionId]
            );
            if (result.rows.length > 0) {
                // Only keep user/assistant turns for Claude context
                conversationHistory = (result.rows[0].messages || []).filter(
                    m => m.role === 'user' || m.role === 'assistant'
                );
            }
        } catch (_) {
            // DB not configured — run stateless
        }

        // Run the agentic loop (Claude + tools)
        const { response: aiResponse, toolsUsed } = await agentOrchestrator.runAgent(
            message,
            conversationHistory,
            busTracker,
            context
        );

        // Persist updated conversation
        const newMessages = [
            ...conversationHistory,
            { role: 'user',      content: message,    timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ];

        try {
            await pool.query(
                `INSERT INTO chat_sessions (id, messages, updated_at)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 ON CONFLICT (id) DO UPDATE SET messages = $2, updated_at = CURRENT_TIMESTAMP`,
                [sessionId, JSON.stringify(newMessages)]
            );
        } catch (_) {
            // DB not configured — skip persistence
        }

        res.json({
            response:   aiResponse,
            session_id: sessionId,
            tools_used: toolsUsed
        });

    } catch (err) {
        console.error('Agent chat error:', err);
        res.status(500).json({ error: 'Failed to process message', detail: err.message });
    }
});

// GET /api/agent/sessions/:id — retrieve a chat session
router.get('/sessions/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM chat_sessions WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch session', detail: err.message });
    }
});

module.exports = router;
