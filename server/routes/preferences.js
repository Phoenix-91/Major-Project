const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');

// Require auth for all routes
router.use(requireAuth);

/**
 * GET /api/preferences
 * Get user preferences
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.auth;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            preferences: user.preferences || {}
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

/**
 * PATCH /api/preferences
 * Update user preferences
 */
router.patch('/', async (req, res) => {
    try {
        const { userId } = req.auth;
        const updates = req.body;

        const user = await User.findOne({ clerkId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update preferences
        if (updates.workingHours) {
            user.preferences.workingHours = {
                ...user.preferences.workingHours,
                ...updates.workingHours
            };
        }

        if (updates.focusTimePreference) {
            user.preferences.focusTimePreference = {
                ...user.preferences.focusTimePreference,
                ...updates.focusTimePreference
            };
        }

        if (updates.notificationSettings) {
            user.preferences.notificationSettings = {
                ...user.preferences.notificationSettings,
                ...updates.notificationSettings
            };
        }

        if (updates.productivityGoals) {
            user.preferences.productivityGoals = {
                ...user.preferences.productivityGoals,
                ...updates.productivityGoals
            };
        }

        await user.save();

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

module.exports = router;
