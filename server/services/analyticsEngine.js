const Insight = require('../models/Insight');
const User = require('../models/User');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AnalyticsEngine {
    /**
     * Detect missed meetings for all active users
     */
    async detectMissedMeetings() {
        try {
            const users = await User.find({ 'preferences.notificationSettings.missedMeetings': { $ne: false } });

            for (const user of users) {
                try {
                    // Call AI service to analyze calendar
                    const response = await axios.post(`${AI_SERVICE_URL}/analyze-patterns`, {
                        user_id: user._id.toString(),
                        analysis_type: 'missed_meetings',
                        time_range: '24h'
                    });

                    const missedMeetings = response.data.missed_meetings || [];

                    // Create insights for each missed meeting
                    for (const meeting of missedMeetings) {
                        await Insight.create({
                            userId: user._id,
                            type: 'missed_meeting',
                            priority: meeting.important ? 'high' : 'medium',
                            title: `Missed Meeting: ${meeting.title}`,
                            description: `You missed "${meeting.title}" scheduled for ${meeting.time}. ${meeting.attendees ? `Attendees: ${meeting.attendees.join(', ')}` : ''}`,
                            actionable: true,
                            action: `Send follow-up email to ${meeting.organizer || 'attendees'}`,
                            metadata: meeting
                        });
                    }

                    console.log(`✅ Detected ${missedMeetings.length} missed meetings for user ${user._id}`);
                } catch (error) {
                    console.error(`❌ Error analyzing user ${user._id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Error in detectMissedMeetings:', error);
            throw error;
        }
    }

    /**
     * Generate daily productivity insights for all users
     */
    async generateDailyInsights() {
        try {
            const users = await User.find({ 'preferences.notificationSettings.dailyInsights': { $ne: false } });

            for (const user of users) {
                try {
                    // Call AI service for comprehensive analysis
                    const response = await axios.post(`${AI_SERVICE_URL}/generate-insights`, {
                        user_id: user._id.toString(),
                        time_range: '24h'
                    });

                    const insights = response.data;

                    // Create productivity insight
                    await Insight.create({
                        userId: user._id,
                        type: 'productivity',
                        priority: 'medium',
                        title: '📊 Daily Productivity Report',
                        description: `Productivity Score: ${insights.score}/100. ${insights.summary}`,
                        actionable: false,
                        metadata: {
                            score: insights.score,
                            emailsSent: insights.emails_sent,
                            meetingsAttended: insights.meetings_attended,
                            focusTimeHours: insights.focus_time,
                            topAchievements: insights.achievements,
                            improvements: insights.improvements
                        }
                    });

                    console.log(`✅ Generated daily insights for user ${user._id}`);
                } catch (error) {
                    console.error(`❌ Error generating insights for user ${user._id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Error in generateDailyInsights:', error);
            throw error;
        }
    }

    /**
     * Analyze focus time patterns and suggest optimal blocks
     */
    async analyzeFocusPatterns() {
        try {
            const users = await User.find({ 'preferences.notificationSettings.focusTime': { $ne: false } });

            for (const user of users) {
                try {
                    // Call AI service for pattern analysis
                    const response = await axios.post(`${AI_SERVICE_URL}/suggest-focus-time`, {
                        user_id: user._id.toString(),
                        preferences: user.preferences
                    });

                    const suggestions = response.data.suggestions || [];

                    // Create focus time insights
                    for (const suggestion of suggestions) {
                        await Insight.create({
                            userId: user._id,
                            type: 'focus_time',
                            priority: 'medium',
                            title: '🎯 Focus Time Suggestion',
                            description: `Block ${suggestion.duration} hours for focused work ${suggestion.time}. ${suggestion.reason}`,
                            actionable: true,
                            action: `Block calendar from ${suggestion.start} to ${suggestion.end}`,
                            metadata: suggestion
                        });
                    }

                    console.log(`✅ Analyzed focus patterns for user ${user._id}`);
                } catch (error) {
                    console.error(`❌ Error analyzing focus for user ${user._id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Error in analyzeFocusPatterns:', error);
            throw error;
        }
    }

    /**
     * Update user preferences based on interaction history
     */
    async updateUserPreferences() {
        try {
            const users = await User.find();

            for (const user of users) {
                try {
                    // Get user's insight feedback history
                    const insights = await Insight.find({
                        userId: user._id,
                        'userFeedback.helpful': { $exists: true }
                    }).limit(50);

                    if (insights.length < 5) continue; // Need minimum data

                    // Calculate acceptance rates by type
                    const typeStats = {};
                    insights.forEach(insight => {
                        if (!typeStats[insight.type]) {
                            typeStats[insight.type] = { accepted: 0, total: 0 };
                        }
                        typeStats[insight.type].total++;
                        if (insight.userFeedback.helpful) {
                            typeStats[insight.type].accepted++;
                        }
                    });

                    // Update preferences based on acceptance rates
                    const updates = {};
                    for (const [type, stats] of Object.entries(typeStats)) {
                        const acceptanceRate = stats.accepted / stats.total;

                        // If acceptance rate is low, reduce frequency
                        if (acceptanceRate < 0.3) {
                            updates[`preferences.notificationSettings.${type}`] = false;
                        }
                    }

                    if (Object.keys(updates).length > 0) {
                        await User.findByIdAndUpdate(user._id, updates);
                        console.log(`✅ Updated preferences for user ${user._id}`);
                    }

                    // Store learning data
                    await User.findByIdAndUpdate(user._id, {
                        $set: {
                            'learningData.lastUpdated': new Date(),
                            'learningData.insightStats': typeStats
                        }
                    });

                } catch (error) {
                    console.error(`❌ Error updating preferences for user ${user._id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('❌ Error in updateUserPreferences:', error);
            throw error;
        }
    }

    /**
     * Clean up old expired insights
     */
    async cleanupOldInsights() {
        try {
            const result = await Insight.deleteMany({
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { status: 'dismissed', createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
                ]
            });

            console.log(`✅ Cleaned up ${result.deletedCount} old insights`);
        } catch (error) {
            console.error('❌ Error in cleanupOldInsights:', error);
            throw error;
        }
    }
}

module.exports = new AnalyticsEngine();
