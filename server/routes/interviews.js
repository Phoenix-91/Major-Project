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
        const { jobRole, difficulty, interviewType, jobDescription } = req.body;
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

        // Create session with conversational features
        const session = new InterviewSession({
            userId: user._id,
            jobRole: jobRole || "Software Engineer",
            jobDescription: jobDescription || "",
            resumeText,
            interviewType: interviewType || "general",
            difficulty: difficulty || "medium",
            currentDifficulty: difficulty || "medium",
            sessionState: 'active',
            status: 'in-progress',
            evaluationMetrics: {
                confidence: [],
                clarity: [],
                relevance: []
            },
            conversationHistory: []
        });

        await session.save();

        // Start interview with AI service
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/start`, {
                session_id: session._id.toString(),
                resume_text: resumeText,
                job_role: jobRole || "Software Engineer",
                difficulty: difficulty || "medium",
                interview_type: interviewType || "general"
            });

            res.json({
                ...session.toObject(),
                first_question: aiResponse.data
            });
        } catch (aiError) {
            console.error("AI service error:", aiError.message);
            // Fallback if AI service is down
            res.json({
                ...session.toObject(),
                first_question: {
                    question: "Tell me about yourself and your background.",
                    index: 1,
                    total: 5,
                    category: interviewType || "general",
                    difficulty: difficulty || "medium",
                    interview_type: interviewType || "general"
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

        // Capture the last question before adding user response
        const lastQuestion = session.transcript.length > 0
            ? session.transcript[session.transcript.length - 1]?.content || ""
            : "";

        // Add to transcript
        session.transcript.push({
            role: 'user',
            content: response
        });

        // Get next question and evaluation from AI
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/respond`, {
                session_id: id,
                response: response,
                resume_text: session.resumeText,
                job_role: session.jobRole
            });

            // Store evaluation metrics
            if (aiResponse.data.evaluation) {
                const evaluation = aiResponse.data.evaluation;

                // Add to conversation history
                session.conversationHistory.push({
                    question: lastQuestion,
                    response: response,
                    evaluation: evaluation,
                    timestamp: new Date()
                });

                // Update evaluation metrics arrays
                if (evaluation.confidence) session.evaluationMetrics.confidence.push(evaluation.confidence);
                if (evaluation.clarity) session.evaluationMetrics.clarity.push(evaluation.clarity);
                if (evaluation.relevance) session.evaluationMetrics.relevance.push(evaluation.relevance);
            }

            // Add AI question to transcript if there is one
            if (aiResponse.data.next_question) {
                session.transcript.push({
                    role: 'assistant',
                    content: aiResponse.data.next_question.question
                });

                // Update current difficulty if it changed
                if (aiResponse.data.next_question.difficulty) {
                    session.currentDifficulty = aiResponse.data.next_question.difficulty;
                }
            }

            await session.save();
            res.json(aiResponse.data);
        } catch (aiError) {
            console.error("AI service error:", aiError.message);
            await session.save();
            res.json({
                evaluation: {
                    confidence: 70,
                    clarity: 70,
                    relevance: 70,
                    overall_score: 70,
                    feedback: "Good response.",
                    strength: "Clear communication",
                    improvement: "Add more details"
                },
                next_question: null,
                metrics: {
                    avg_confidence: 70,
                    avg_clarity: 70,
                    avg_relevance: 70
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get session state
router.get('/:id/state', async (req, res) => {
    try {
        const { id } = req.params;
        const session = await InterviewSession.findById(id);

        if (!session) return res.status(404).json({ error: "Session not found" });

        // Calculate current metrics
        const avgConfidence = session.evaluationMetrics.confidence.length > 0
            ? session.evaluationMetrics.confidence.reduce((a, b) => a + b, 0) / session.evaluationMetrics.confidence.length
            : 0;

        const avgClarity = session.evaluationMetrics.clarity.length > 0
            ? session.evaluationMetrics.clarity.reduce((a, b) => a + b, 0) / session.evaluationMetrics.clarity.length
            : 0;

        const avgRelevance = session.evaluationMetrics.relevance.length > 0
            ? session.evaluationMetrics.relevance.reduce((a, b) => a + b, 0) / session.evaluationMetrics.relevance.length
            : 0;

        res.json({
            session_state: session.sessionState,
            interview_type: session.interviewType,
            current_difficulty: session.currentDifficulty,
            questions_answered: session.conversationHistory.length,
            current_metrics: {
                avg_confidence: avgConfidence,
                avg_clarity: avgClarity,
                avg_relevance: avgRelevance
            },
            conversation_history: session.conversationHistory
        });
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
        session.sessionState = 'completed';
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

            // Calculate fallback analytics with conversational metrics
            const avgConfidence = session.evaluationMetrics.confidence.length > 0
                ? session.evaluationMetrics.confidence.reduce((a, b) => a + b, 0) / session.evaluationMetrics.confidence.length
                : 70;

            const avgClarity = session.evaluationMetrics.clarity.length > 0
                ? session.evaluationMetrics.clarity.reduce((a, b) => a + b, 0) / session.evaluationMetrics.clarity.length
                : 70;

            const avgRelevance = session.evaluationMetrics.relevance.length > 0
                ? session.evaluationMetrics.relevance.reduce((a, b) => a + b, 0) / session.evaluationMetrics.relevance.length
                : 70;

            const overallScore = Math.round((avgConfidence + avgClarity + avgRelevance) / 3);

            session.analysis = {
                score: overallScore,
                feedback: "Good communication skills. Technical answers were solid but could be more concise.",
                skill_breakdown: {
                    technical: Math.round(avgRelevance),
                    communication: Math.round(avgClarity),
                    problem_solving: Math.round(avgConfidence),
                    domain_knowledge: Math.round((avgConfidence + avgRelevance) / 2)
                },
                areas_of_improvement: ["System Design", "Error Handling", "Code Optimization"],
                recommended_resources: ["System Design Primer", "React Patterns", "LeetCode Practice"],
                resume_alignment: "Good alignment between resume and interview performance",
                readiness_score: overallScore,
                next_steps: "Practice more system design interviews and work on specific technical areas",
                conversational_metrics: {
                    avg_confidence: avgConfidence,
                    avg_clarity: avgClarity,
                    avg_relevance: avgRelevance,
                    interview_type: session.interviewType,
                    final_difficulty: session.currentDifficulty,
                    total_questions: session.conversationHistory.length
                }
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
