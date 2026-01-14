const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Insight = require('../models/Insight');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Require auth for all routes
router.use(requireAuth);

/**
 * GET /api/insights
 * Fetch pending insights for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.auth;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const limit = parseInt(req.query.limit) || 10;
        const insights = await Insight.getPending(user._id, limit);

        res.json({
            success: true,
            count: insights.length,
            insights
        });
    } catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

/**
 * GET /api/insights/all
 * Fetch all insights with optional filtering
 */
router.get('/all', async (req, res) => {
    try {
        const { userId } = req.auth;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { type, status, limit = 50 } = req.query;

        const query = { userId: user._id };
        if (type) query.type = type;
        if (status) query.status = status;

        const insights = await Insight.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: insights.length,
            insights
        });
    } catch (error) {
        console.error('Error fetching all insights:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

/**
 * GET /api/insights/daily
 * Get daily productivity report
 */
router.get('/daily', async (req, res) => {
    try {
        const { userId } = req.auth;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get today's productivity insight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyInsight = await Insight.findOne({
            userId: user._id,
            type: 'productivity',
            createdAt: { $gte: today }
        }).sort({ createdAt: -1 });

        if (!dailyInsight) {
            return res.json({
                success: true,
                message: 'No daily report available yet',
                report: null
            });
        }

        res.json({
            success: true,
            report: {
                ...dailyInsight.toObject(),
                score: dailyInsight.metadata?.score || 0,
                summary: dailyInsight.description,
                details: dailyInsight.metadata
            }
        });
    } catch (error) {
        console.error('Error fetching daily report:', error);
        res.status(500).json({ error: 'Failed to fetch daily report' });
    }
});

/**
 * POST /api/insights/:id/feedback
 * Submit user feedback on an insight
 */
router.post('/:id/feedback', async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;
        const { helpful, rating, comment, action } = req.body;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const insight = await Insight.findOne({ _id: id, userId: user._id });
        if (!insight) return res.status(404).json({ error: 'Insight not found' });

        // Update feedback
        if (action === 'accept') {
            await insight.accept({ rating, comment });
        } else if (action === 'dismiss') {
            await insight.dismiss({ rating, comment });
        } else {
            insight.userFeedback.helpful = helpful;
            if (rating) insight.userFeedback.rating = rating;
            if (comment) insight.userFeedback.comment = comment;
            await insight.save();
        }

        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            insight
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

/**
 * PATCH /api/insights/:id/status
 * Update insight status (mark as viewed, etc.)
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;
        const { status } = req.body;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const insight = await Insight.findOne({ _id: id, userId: user._id });
        if (!insight) return res.status(404).json({ error: 'Insight not found' });

        if (status === 'viewed') {
            await insight.markViewed();
        } else {
            insight.status = status;
            await insight.save();
        }

        res.json({
            success: true,
            insight
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

/**
 * GET /api/insights/stats
 * Get insight statistics for the user
 */
router.get('/stats', async (req, res) => {
    try {
        const { userId } = req.auth;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const stats = await Insight.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: 1 },
                    accepted: {
                        $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                    },
                    dismissed: {
                        $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] }
                    },
                    avgRating: { $avg: '$userFeedback.rating' }
                }
            }
        ]);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
