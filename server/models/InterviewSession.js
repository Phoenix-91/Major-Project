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
