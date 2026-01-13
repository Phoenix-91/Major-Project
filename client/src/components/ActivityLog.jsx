import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../services/api';
import { Mail, Clock, CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export default function ActivityLog({ limit = 10 }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/activity?limit=${limit}`);
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'email_sent':
            case 'email_drafted':
                return Mail;
            case 'meeting_scheduled':
            case 'meeting_cancelled':
                return Clock;
            default:
                return Activity;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'destructive';
            case 'pending':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse flex gap-3">
                                <div className="w-10 h-10 bg-muted rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchActivities}
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
                <CardDescription>
                    Track all your AI automation actions
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                {activities.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm">No recent activity</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Start by giving a command to your AI assistant
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-3">
                            {activities.map((activity, index) => {
                                const Icon = getActionIcon(activity.action);
                                return (
                                    <motion.div
                                        key={activity._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                            activity.status === 'success' && "bg-green-500/10 text-green-600",
                                            activity.status === 'failed' && "bg-red-500/10 text-red-600",
                                            activity.status === 'pending' && "bg-yellow-500/10 text-yellow-600"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-sm font-medium truncate">
                                                    {activity.description}
                                                </p>
                                                <Badge variant={getStatusVariant(activity.status)} className="shrink-0">
                                                    {activity.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                            {activity.aiReasoning && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="text-xs text-muted-foreground mt-2 pl-3 border-l-2 border-purple-500/30 italic"
                                                >
                                                    AI: {activity.aiReasoning}
                                                </motion.p>
                                            )}
                                            {activity.confidence && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${activity.confidence * 100}%` }}
                                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {Math.round(activity.confidence * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </CardContent>
        </Card>
    );
}
