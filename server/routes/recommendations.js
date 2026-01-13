const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Recommendation = require('../models/Recommendation');

router.use(requireAuth);

// Get active recommendations for user
router.get('/', async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const recommendations = await Recommendation.find({
            userId: user._id,
            status: 'pending',
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        })
            .sort({ priority: -1, createdAt: -1 })
            .limit(10);

        res.json(recommendations);
    } catch (error) {
        next(error);
    }
});

// Dismiss recommendation
router.post('/:id/dismiss', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const recommendation = await Recommendation.findOneAndUpdate(
            { _id: id, userId: user._id },
            { status: 'dismissed' },
            { new: true }
        );

        if (!recommendation) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        res.json(recommendation);
    } catch (error) {
        next(error);
    }
});

// Execute recommendation
router.post('/:id/execute', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.auth;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const recommendation = await Recommendation.findOne({ _id: id, userId: user._id });
        if (!recommendation) {
            return res.status(404).json({ error: 'Recommendation not found' });
        }

        recommendation.status = 'executed';
        recommendation.executedAt = new Date();
        await recommendation.save();

        res.json({
            recommendation,
            command: recommendation.suggestedAction.command
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
