const cron = require('node-cron');
const analyticsEngine = require('./analyticsEngine');
const notificationService = require('./notificationService');

class BackgroundScheduler {
    constructor() {
        this.jobs = [];
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️  Scheduler already running');
            return;
        }

        console.log('🚀 Starting background job scheduler...');

        // Check for missed meetings every 30 minutes
        const missedMeetingsJob = cron.schedule('*/30 * * * *', async () => {
            console.log('🔍 Checking for missed meetings...');
            try {
                await analyticsEngine.detectMissedMeetings();
            } catch (error) {
                console.error('❌ Error detecting missed meetings:', error);
            }
        });

        // Generate daily insights at 9 AM
        const dailyInsightsJob = cron.schedule('0 9 * * *', async () => {
            console.log('📊 Generating daily productivity insights...');
            try {
                await analyticsEngine.generateDailyInsights();
            } catch (error) {
                console.error('❌ Error generating daily insights:', error);
            }
        });

        // Analyze focus time patterns every hour
        const focusTimeJob = cron.schedule('0 * * * *', async () => {
            console.log('🎯 Analyzing focus time patterns...');
            try {
                await analyticsEngine.analyzeFocusPatterns();
            } catch (error) {
                console.error('❌ Error analyzing focus patterns:', error);
            }
        });

        // Update user preferences based on interactions every 6 hours
        const preferenceLearningJob = cron.schedule('0 */6 * * *', async () => {
            console.log('🧠 Learning user preferences...');
            try {
                await analyticsEngine.updateUserPreferences();
            } catch (error) {
                console.error('❌ Error updating preferences:', error);
            }
        });

        // Clean up old insights weekly (Sunday at midnight)
        const cleanupJob = cron.schedule('0 0 * * 0', async () => {
            console.log('🧹 Cleaning up old insights...');
            try {
                await analyticsEngine.cleanupOldInsights();
            } catch (error) {
                console.error('❌ Error cleaning up insights:', error);
            }
        });

        this.jobs = [
            missedMeetingsJob,
            dailyInsightsJob,
            focusTimeJob,
            preferenceLearningJob,
            cleanupJob
        ];

        this.isRunning = true;
        console.log('✅ Background scheduler started successfully');
        console.log('📅 Active jobs:', this.jobs.length);
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Scheduler not running');
            return;
        }

        console.log('🛑 Stopping background scheduler...');
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        this.isRunning = false;
        console.log('✅ Scheduler stopped');
    }

    getStatus() {
        return {
            running: this.isRunning,
            activeJobs: this.jobs.length,
            jobs: [
                { name: 'Missed Meetings Detection', schedule: 'Every 30 minutes' },
                { name: 'Daily Insights Generation', schedule: 'Daily at 9 AM' },
                { name: 'Focus Time Analysis', schedule: 'Every hour' },
                { name: 'Preference Learning', schedule: 'Every 6 hours' },
                { name: 'Cleanup Old Insights', schedule: 'Weekly (Sunday midnight)' }
            ]
        };
    }
}

// Singleton instance
const scheduler = new BackgroundScheduler();

module.exports = scheduler;
