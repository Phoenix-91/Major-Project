const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String, // 'user' or 'assistant'
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobRole: {
        type: String,
        required: true,
    },
    jobDescription: String,
    resumeText: {
        type: String, // Parsed text from PDF
    },
    // Conversational features
    interviewType: {
        type: String,
        enum: ['general', 'hr', 'technical', 'behavioral', 'situational'],
        default: 'general'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    currentDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    sessionState: {
        type: String,
        enum: ['active', 'paused', 'completed'],
        default: 'active'
    },
    // Conversation tracking
    conversationHistory: [{
        question: String,
        response: String,
        evaluation: {
            confidence: Number,
            clarity: Number,
            relevance: Number,
            overall_score: Number,
            feedback: String,
            strength: String,
            improvement: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    // Real-time evaluation metrics
    evaluationMetrics: {
        confidence: [Number],
        clarity: [Number],
        relevance: [Number]
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress',
    },
    transcript: [messageSchema],
    analysis: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    }, // JSON blob for scores/feedback
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: Date,
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
