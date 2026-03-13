const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const claudeService = require('../services/claudeService');
const busService = require('../services/busService');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// POST /api/agent/chat - AI chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, session_id, context = {} } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let sessionId = session_id;
        let conversationHistory = [];

        // Get or create session
        if (sessionId) {
            const sessionQuery = 'SELECT messages FROM chat_sessions WHERE id = $1';
            const sessionResult = await pool.query(sessionQuery, [sessionId]);
            
            if (sessionResult.rows.length > 0) {
                conversationHistory = sessionResult.rows[0].messages || [];
            }
        } else {
            sessionId = uuidv4();
        }

        // Search for relevant buses based on message content
        const relevantBuses = await busService.searchBusesForChat(message);

        // Get AI response
        const aiResponse = await claudeService.getChatResponse(
            message, 
            relevantBuses, 
            conversationHistory,
            context
        );

        // Update conversation history
        const newMessages = [
            ...conversationHistory,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
        ];

        // Save to database
        const upsertQuery = `
            INSERT INTO chat_sessions (id, messages, updated_at) 
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (id) 
            DO UPDATE SET messages = $2, updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(upsertQuery, [sessionId, JSON.stringify(newMessages)]);

        res.json({
            response: aiResponse,
            session_id: sessionId,
            relevant_buses: relevantBuses.length
        });

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// GET /api/agent/sessions/:id - Get chat session
router.get('/sessions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM chat_sessions WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

module.exports = router;