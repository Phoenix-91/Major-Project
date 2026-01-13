const cron = require('node-cron');
const Recommendation = require('../models/Recommendation');
const ActivityLog = require('../models/ActivityLog');
const CalendarEvent = require('../models/CalendarEvent');
const Email = require('../models/Email');
const User = require('../models/User');
const { logger } = require('../middleware/errorHandler');

/**
 * Proactive AI Recommendation Engine
 * Runs periodically to analyze user patterns and generate suggestions
 */

// Run every hour
cron.schedule('0 * * * *', async () => {
    logger.info('Running proactive recommendation engine...');

    try {
        const users = await User.find();

        for (const user of users) {
            await generateRecommendations(user);
        }

        logger.info('Proactive recommendations generated successfully');
    } catch (error) {
        logger.error('Error generating recommendations:', error);
    }
});

async function generateRecommendations(user) {
    const userId = user._id;
    const now = new Date();

    // 1. Check for missed meeting follow-ups
    const recentMeetings = await CalendarEvent.find({
        userId,
        endTime: { $lt: now, $gte: new Date(now - 24 * 60 * 60 * 1000) }, // Last 24 hours
        status: 'completed'
    });

    for (const meeting of recentMeetings) {
        // Check if follow-up email was sent
        const followUpExists = await Email.findOne({
            userId,
            recipient: { $in: meeting.attendees.map(a => a.email) },
            createdAt: { $gte: meeting.endTime }
        });

        if (!followUpExists && meeting.attendees.length > 0) {
            await Recommendation.create({
                userId,
                type: 'follow_up_email',
                title: `Send follow-up for "${meeting.title}"`,
                description: `Consider sending a follow-up email to attendees of your recent meeting.`,
                priority: 'medium',
                aiReasoning: `Meeting ended ${Math.round((now - meeting.endTime) / (1000 * 60 * 60))} hours ago without follow-up communication.`,
                suggestedAction: {
                    command: `Draft a follow-up email to ${meeting.attendees[0].email} about ${meeting.title}`,
                    parameters: {
                        recipient: meeting.attendees[0].email,
                        subject: `Follow-up: ${meeting.title}`,
                        context: `meeting follow-up`
                    }
                },
                relatedEntities: [{ type: 'CalendarEvent', id: meeting._id }],
                expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000) // Expires in 48 hours
            });
        }
    }

    // 2. Suggest focus time based on calendar gaps
    const upcomingEvents = await CalendarEvent.find({
        userId,
        startTime: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: 'scheduled'
    }).sort({ startTime: 1 });

    if (upcomingEvents.length > 5) {
        const busyDays = new Set(upcomingEvents.map(e => e.startTime.toDateString()));

        if (busyDays.size >= 4) {
            await Recommendation.create({
                userId,
                type: 'focus_time',
                title: 'Schedule focus time',
                description: `You have ${upcomingEvents.length} meetings this week. Consider blocking time for focused work.`,
                priority: 'high',
                aiReasoning: `High meeting density detected (${upcomingEvents.length} meetings across ${busyDays.size} days). Focus time recommended for productivity.`,
                suggestedAction: {
                    command: 'Schedule 2 hours of focus time tomorrow morning',
                    parameters: {}
                },
                expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
            });
        }
    }

    // 3. Productivity insights based on activity logs
    const recentActivities = await ActivityLog.find({
        userId,
        timestamp: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }
    });

    const emailsSent = recentActivities.filter(a => a.action === 'email_sent').length;
    const meetingsScheduled = recentActivities.filter(a => a.action === 'meeting_scheduled').length;

    if (emailsSent > 20 || meetingsScheduled > 10) {
        await Recommendation.create({
            userId,
            type: 'productivity_insight',
            title: 'Weekly productivity summary',
            description: `This week: ${emailsSent} emails sent, ${meetingsScheduled} meetings scheduled. Great productivity!`,
            priority: 'low',
            aiReasoning: `High activity levels detected. User is actively using automation features.`,
            suggestedAction: {
                command: 'Show me my productivity stats',
                parameters: {}
            },
            expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        });
    }

    // 4. Check for upcoming meetings without preparation
    const soonMeetings = await CalendarEvent.find({
        userId,
        startTime: { $gte: now, $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000) }, // Next 2 hours
        status: 'scheduled'
    });

    for (const meeting of soonMeetings) {
        if (meeting.description || meeting.attendees.length > 0) {
            await Recommendation.create({
                userId,
                type: 'meeting_reminder',
                title: `Upcoming: "${meeting.title}"`,
                description: `Meeting starts in ${Math.round((meeting.startTime - now) / (1000 * 60))} minutes.`,
                priority: 'high',
                aiReasoning: `Meeting approaching. Reminder to prepare or join.`,
                suggestedAction: {
                    command: `Show details for meeting ${meeting.title}`,
                    parameters: { meetingId: meeting._id.toString() }
                },
                relatedEntities: [{ type: 'CalendarEvent', id: meeting._id }],
                expiresAt: meeting.startTime
            });
        }
    }

    // Clean up expired recommendations
    await Recommendation.deleteMany({
        expiresAt: { $lt: now }
    });
}

// Export for manual triggering
module.exports = { generateRecommendations };
