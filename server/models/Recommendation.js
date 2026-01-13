const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            'follow_up_email',
            'meeting_reminder',
            'focus_time',
            'productivity_insight',
            'missed_meeting_follow_up',
            'schedule_optimization',
        ],
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    aiReasoning: String, // Why this recommendation was made
    suggestedAction: {
        command: String, // Command to execute
        parameters: Map,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'dismissed', 'executed'],
        default: 'pending',
    },
    relatedEntities: [{
        type: String,
        id: mongoose.Schema.Types.ObjectId,
    }],
    expiresAt: Date, // Recommendations can expire
    executedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient querying
recommendationSchema.index({ userId: 1, status: 1, createdAt: -1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

module.exports = mongoose.model('Recommendation', recommendationSchema);
