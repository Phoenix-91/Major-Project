const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');

router.use(requireAuth);

// Get activity logs for user
router.get('/', async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const { limit = 50, action, status } = req.query;

        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const filter = { userId: user._id };
        if (action) filter.action = action;
        if (status) filter.status = status;

        const logs = await ActivityLog.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (error) {
        next(error);
    }
});

// Get activity stats
router.get('/stats', async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const User = require('../models/User');
        const user = await User.findOne({ clerkId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const stats = await ActivityLog.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
