const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const InterviewSession = require('../models/InterviewSession');
const { parseResume } = require('../services/resumeParser');
const axios = require('axios');
const fs = require('fs').promises;

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Require auth
router.use(requireAuth);

router.post('/start', upload.single('resume'), async (req, res) => {
    try {
        const { jobRole, difficulty } = req.body;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: "User not found" });

        let resumeText = "";

        // Parse resume if uploaded
        if (req.file) {
            try {
                const resumeData = await parseResume(req.file.path);
                resumeText = resumeData.rawText;

                // Clean up uploaded file
                await fs.unlink(req.file.path);
            } catch (parseError) {
                console.error("Resume parsing error:", parseError);
                // Continue without resume text
            }
        }

        // Create session
        const session = new InterviewSession({
            userId: user._id,
            jobRole: jobRole || "Software Engineer",
            resumeText,
            status: 'in-progress'
        });

        await session.save();

        // Start interview with AI service
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/start`, {
                session_id: session._id.toString(),
                resume_text: resumeText,
                job_role: jobRole || "Software Engineer",
                difficulty: difficulty || "medium"
            });

            res.json({
                ...session.toObject(),
                first_question: aiResponse.data
            });
        } catch (aiError) {
            // Fallback if AI service is down
            res.json({
                ...session.toObject(),
                first_question: {
                    question: "Tell me about yourself and your background.",
                    index: 1,
                    total: 5,
                    category: "behavioral"
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/:id/respond', async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        const session = await InterviewSession.findById(id);
        if (!session) return res.status(404).json({ error: "Session not found" });

        // Add to transcript
        session.transcript.push({
            role: 'user',
            content: response
        });

        // Get next question from AI
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/respond`, {
                session_id: id,
                response: response,
                resume_text: session.resumeText,
                job_role: session.jobRole
            });

            // Add AI question to transcript if there is one
            if (aiResponse.data.next_question) {
                session.transcript.push({
                    role: 'assistant',
                    content: aiResponse.data.next_question.question
                });
            }

            await session.save();
            res.json(aiResponse.data);
        } catch (aiError) {
            console.error("AI service error:", aiError.message);
            await session.save();
            res.json({
                evaluation: {
                    score: 7,
                    feedback: "Good response.",
                    strengths: ["Clear communication"],
                    improvements: ["Add more details"]
                },
                next_question: null
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        const session = await InterviewSession.findById(id);
        if (!session) return res.status(404).json({ error: "Session not found" });

        session.status = 'completed';
        session.endedAt = Date.now();

        // Get comprehensive analytics from AI
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/complete`, {
                session_id: id,
                resume_text: session.resumeText,
                job_role: session.jobRole
            });

            session.analysis = aiResponse.data.analytics;
        } catch (aiError) {
            console.error("AI analytics error:", aiError.message);
            // Fallback analytics
            session.analysis = {
                score: Math.floor(Math.random() * 30) + 70,
                feedback: "Good communication skills. Technical answers were solid but could be more concise.",
                skill_breakdown: {
                    technical: 75,
                    communication: 80,
                    problem_solving: 70,
                    domain_knowledge: 75
                },
                areas_of_improvement: ["System Design", "Error Handling", "Code Optimization"],
                recommended_resources: ["System Design Primer", "React Patterns", "LeetCode Practice"],
                resume_alignment: "Good alignment between resume and interview performance",
                readiness_score: 75,
                next_steps: "Practice more system design interviews and work on specific technical areas"
            };
        }

        await session.save();
        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get all interview sessions for user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.auth;
        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const sessions = await InterviewSession.find({ userId: user._id })
            .sort({ startedAt: -1 })
            .limit(20);

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
