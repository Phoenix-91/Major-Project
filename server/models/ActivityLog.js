const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'email_sent',
            'email_drafted',
            'meeting_scheduled',
            'meeting_cancelled',
            'command_processed',
            'interview_started',
            'interview_completed',
            'recommendation_generated',
            'recommendation_executed',
        ],
    },
    description: {
        type: String,
        required: true,
    },
    command: String, // Original user command
    aiPlan: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    }, // AI-generated plan
    aiReasoning: String, // Why AI chose this action
    confidence: Number, // AI confidence score (0-1)
    status: {
        type: String,
        enum: ['success', 'failed', 'pending', 'cancelled'],
        default: 'success',
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    }, // Additional context
    relatedEntity: {
        type: String, // 'Email', 'CalendarEvent', etc.
        ref: String,
    },
    relatedEntityId: mongoose.Schema.Types.ObjectId,
    error: String,
    executionTime: Number, // milliseconds
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
