const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'failed'],
        default: 'draft',
    },
    tone: {
        type: String,
        enum: ['professional', 'casual', 'formal', 'friendly'],
        default: 'professional',
    },
    aiGenerated: {
        type: Boolean,
        default: false,
    },
    originalCommand: String,
    sentAt: Date,
    error: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Email', emailSchema);
