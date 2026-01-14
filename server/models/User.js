const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: String,
    lastName: String,
    preferences: {
        workingHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '17:00' },
            timezone: { type: String, default: 'UTC' }
        },
        focusTimePreference: {
            duration: { type: Number, default: 2 }, // hours
            preferredTimes: { type: [String], default: ['morning', 'afternoon'] }
        },
        notificationSettings: {
            missedMeetings: { type: Boolean, default: true },
            focusTime: { type: Boolean, default: true },
            dailyInsights: { type: Boolean, default: true },
            emailFollowups: { type: Boolean, default: true }
        },
        productivityGoals: {
            dailyFocusHours: { type: Number, default: 4 },
            weeklyMeetings: { type: Number, default: 10 },
            emailResponseTime: { type: Number, default: 24 } // hours
        }
    },
    learningData: {
        interactionHistory: [{
            insightType: String,
            action: String, // accepted, dismissed, ignored
            timestamp: Date
        }],
        insightStats: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        lastUpdated: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
