const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const CalendarEvent = require('../models/CalendarEvent');
const ActivityLog = require('../models/ActivityLog');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.use(requireAuth);

// Get all calendar events for user
router.get('/', async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const events = await CalendarEvent.find({
            userId: user._id,
            status: { $ne: 'cancelled' }
        })
            .sort({ startTime: 1 })
            .limit(50);

        res.json(events);
    } catch (error) {
        next(error);
    }
});

// Schedule meeting using AI
router.post('/schedule', async (req, res, next) => {
    try {
        const { title, attendees, startTime, endTime, description, command } = req.body;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check for conflicts
        const conflicts = await CalendarEvent.find({
            userId: user._id,
            status: 'scheduled',
            $or: [
                { startTime: { $lte: new Date(endTime), $gte: new Date(startTime) } },
                { endTime: { $lte: new Date(endTime), $gte: new Date(startTime) } }
            ]
        });

        const event = new CalendarEvent({
            userId: user._id,
            title,
            description,
            attendees: attendees || [],
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            aiGenerated: true,
            originalCommand: command,
            conflictDetected: conflicts.length > 0,
            status: 'scheduled'
        });

        await event.save();

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'meeting_scheduled',
            description: `Scheduled meeting: ${title}`,
            command,
            status: 'success',
            relatedEntity: 'CalendarEvent',
            relatedEntityId: event._id,
            metadata: { conflictDetected: conflicts.length > 0 }
        });

        res.json({ event, conflicts });
    } catch (error) {
        next(error);
    }
});

// Cancel meeting
router.post('/:id/cancel', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const event = await CalendarEvent.findOne({ _id: id, userId: user._id });
        if (!event) return res.status(404).json({ error: 'Event not found' });

        event.status = 'cancelled';
        event.updatedAt = new Date();
        await event.save();

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'meeting_cancelled',
            description: `Cancelled meeting: ${event.title}`,
            status: 'success',
            relatedEntity: 'CalendarEvent',
            relatedEntityId: event._id
        });

        res.json(event);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
