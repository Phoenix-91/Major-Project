const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['missed_meeting', 'focus_time', 'productivity', 'email_followup', 'general'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    actionable: {
        type: Boolean,
        default: true
    },
    action: {
        type: String // Suggested action command
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Additional context data
    },
    status: {
        type: String,
        enum: ['pending', 'viewed', 'accepted', 'dismissed', 'expired'],
        default: 'pending'
    },
    userFeedback: {
        helpful: { type: Boolean },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
}, {
    timestamps: true
});

// Index for efficient queries
insightSchema.index({ userId: 1, status: 1, createdAt: -1 });
insightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for age
insightSchema.virtual('age').get(function () {
    return Date.now() - this.createdAt;
});

// Method to mark as viewed
insightSchema.methods.markViewed = function () {
    this.status = 'viewed';
    return this.save();
};

// Method to accept insight
insightSchema.methods.accept = function (feedback = {}) {
    this.status = 'accepted';
    if (feedback.rating) this.userFeedback.rating = feedback.rating;
    if (feedback.comment) this.userFeedback.comment = feedback.comment;
    this.userFeedback.helpful = true;
    return this.save();
};

// Method to dismiss insight
insightSchema.methods.dismiss = function (feedback = {}) {
    this.status = 'dismissed';
    if (feedback.rating) this.userFeedback.rating = feedback.rating;
    if (feedback.comment) this.userFeedback.comment = feedback.comment;
    this.userFeedback.helpful = false;
    return this.save();
};

// Static method to get pending insights for user
insightSchema.statics.getPending = function (userId, limit = 10) {
    return this.find({
        userId,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    })
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit);
};

// Static method to get insights by type
insightSchema.statics.getByType = function (userId, type, limit = 5) {
    return this.find({ userId, type })
        .sort({ createdAt: -1 })
        .limit(limit);
};

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;
