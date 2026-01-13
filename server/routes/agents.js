const express = require('express');
const router = express.Router();
const { requireAuth, extractUserId } = require('../middleware/auth');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Require auth for all agent interactions
router.use(requireAuth);
router.use(extractUserId);

/**
 * POST /api/agents/command
 * Process a user command through the AI agent
 */
router.post('/command', async (req, res, next) => {
    try {
        const { command, confirmed } = req.body;
        const { userId } = req; // From extractUserId middleware

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        // Forward to Python AI Service
        const response = await axios.post(`${AI_SERVICE_URL}/process-command`, {
            command,
            user_id: userId,
            confirmed: confirmed || false
        });

        res.json(response.data);
    } catch (error) {
        console.error('AI Service Error:', error.message);

        if (error.response) {
            // Forward error from AI service
            return res.status(error.response.status).json(
                error.response.data || { error: 'AI Service error' }
            );
        }

        next(error);
    }
});

module.exports = router;
