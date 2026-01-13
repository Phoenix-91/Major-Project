const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Email = require('../models/Email');
const ActivityLog = require('../models/ActivityLog');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.use(requireAuth);

// Get all emails for user
router.get('/', async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const emails = await Email.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(emails);
    } catch (error) {
        next(error);
    }
});

// Draft email using AI
router.post('/draft', async (req, res, next) => {
    try {
        const { recipient, subject, context, tone } = req.body;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Call AI service to generate email
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/draft-email`, {
            recipient,
            subject,
            context,
            tone: tone || 'professional',
            user_id: userId
        });

        const email = new Email({
            userId: user._id,
            recipient,
            subject,
            body: aiResponse.data.body,
            tone: tone || 'professional',
            aiGenerated: true,
            originalCommand: context,
            status: 'draft'
        });

        await email.save();

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'email_drafted',
            description: `Drafted email to ${recipient}`,
            command: context,
            status: 'success',
            relatedEntity: 'Email',
            relatedEntityId: email._id
        });

        res.json(email);
    } catch (error) {
        next(error);
    }
});

// Send email
router.post('/:id/send', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const email = await Email.findOne({ _id: id, userId: user._id });
        if (!email) return res.status(404).json({ error: 'Email not found' });

        // Call AI service to send email
        const result = await axios.post(`${AI_SERVICE_URL}/send-email`, {
            recipient: email.recipient,
            subject: email.subject,
            body: email.body,
            user_id: userId
        });

        email.status = result.data.success ? 'sent' : 'failed';
        email.sentAt = result.data.success ? new Date() : null;
        email.error = result.data.error || null;
        await email.save();

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'email_sent',
            description: `Sent email to ${email.recipient}`,
            status: email.status === 'sent' ? 'success' : 'failed',
            relatedEntity: 'Email',
            relatedEntityId: email._id,
            error: email.error
        });

        res.json(email);
    } catch (error) {
        next(error);
    }
});

// Delete email
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await Email.findOneAndDelete({ _id: id, userId: user._id });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
