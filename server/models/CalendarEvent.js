const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    attendees: [{
        email: String,
        name: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
    }],
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    location: String,
    meetingLink: String,
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled',
    },
    aiGenerated: {
        type: Boolean,
        default: false,
    },
    originalCommand: String,
    googleEventId: String, // For Google Calendar sync
    reminders: [{
        minutes: Number,
        sent: Boolean,
    }],
    conflictDetected: Boolean,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
