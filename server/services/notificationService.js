const EventEmitter = require('events');
const Insight = require('../models/Insight');

class NotificationService extends EventEmitter {
    constructor() {
        super();
        this.subscribers = new Map(); // userId -> Set of connections
    }

    /**
     * Subscribe a user connection to notifications
     */
    subscribe(userId, connection) {
        if (!this.subscribers.has(userId)) {
            this.subscribers.set(userId, new Set());
        }
        this.subscribers.get(userId).add(connection);

        console.log(`✅ User ${userId} subscribed to notifications`);

        // Send any pending insights immediately
        this.sendPendingInsights(userId, connection);
    }

    /**
     * Unsubscribe a user connection
     */
    unsubscribe(userId, connection) {
        if (this.subscribers.has(userId)) {
            this.subscribers.get(userId).delete(connection);

            if (this.subscribers.get(userId).size === 0) {
                this.subscribers.delete(userId);
            }
        }

        console.log(`✅ User ${userId} unsubscribed from notifications`);
    }

    /**
     * Send pending insights to a specific connection
     */
    async sendPendingInsights(userId, connection) {
        try {
            const insights = await Insight.getPending(userId, 5);

            if (insights.length > 0) {
                connection.send(JSON.stringify({
                    type: 'pending_insights',
                    data: insights
                }));
            }
        } catch (error) {
            console.error('❌ Error sending pending insights:', error);
        }
    }

    /**
     * Notify user about a new insight
     */
    async notifyUser(userId, insight) {
        try {
            const connections = this.subscribers.get(userId.toString());

            if (connections && connections.size > 0) {
                const message = JSON.stringify({
                    type: 'new_insight',
                    data: insight
                });

                connections.forEach(connection => {
                    if (connection.readyState === 1) { // WebSocket.OPEN
                        connection.send(message);
                    }
                });

                console.log(`✅ Notified user ${userId} about new insight`);
            } else {
                console.log(`ℹ️  No active connections for user ${userId}`);
            }

            // Emit event for other services
            this.emit('insight_created', { userId, insight });

        } catch (error) {
            console.error('❌ Error notifying user:', error);
        }
    }

    /**
     * Broadcast insight to all connected users
     */
    async broadcastInsight(insight) {
        await this.notifyUser(insight.userId, insight);
    }

    /**
     * Send batch of insights to user
     */
    async sendBatch(userId, insights) {
        try {
            const connections = this.subscribers.get(userId.toString());

            if (connections && connections.size > 0) {
                const message = JSON.stringify({
                    type: 'insight_batch',
                    data: insights
                });

                connections.forEach(connection => {
                    if (connection.readyState === 1) {
                        connection.send(message);
                    }
                });

                console.log(`✅ Sent batch of ${insights.length} insights to user ${userId}`);
            }
        } catch (error) {
            console.error('❌ Error sending batch:', error);
        }
    }

    /**
     * Get active subscriber count
     */
    getSubscriberCount() {
        let total = 0;
        this.subscribers.forEach(connections => {
            total += connections.size;
        });
        return total;
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            activeUsers: this.subscribers.size,
            totalConnections: this.getSubscriberCount(),
            users: Array.from(this.subscribers.keys())
        };
    }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
