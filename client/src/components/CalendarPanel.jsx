import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../services/api';
import { Calendar, Clock, Users, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export default function CalendarPanel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/calendar');
            const upcoming = response.data
                .filter(e => new Date(e.startTime) > new Date())
                .slice(0, 5);
            setEvents(upcoming);
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <CardTitle>Upcoming Events</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse p-3 rounded-lg border">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <CardTitle>Upcoming Events</CardTitle>
                </div>
                <CardDescription>
                    Smart scheduling with conflict detection
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                {events.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm">No upcoming events</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Try: "Schedule a meeting tomorrow at 2pm"
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {events.map((event, index) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "group p-3 rounded-lg border transition-all cursor-pointer",
                                    isToday(event.startTime)
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30"
                                        : "border-border hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="text-sm font-medium flex-1 group-hover:text-green-600 transition-colors">
                                        {event.title}
                                    </p>
                                    {event.conflictDetected && (
                                        <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                                    )}
                                    {isToday(event.startTime) && (
                                        <Badge variant="success" className="shrink-0">
                                            Today
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(event.startTime)}
                                    </div>
                                    {event.attendees && event.attendees.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {event.attendees.length}
                                        </div>
                                    )}
                                </div>
                                {event.aiGenerated && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <Sparkles className="w-3 h-3 text-purple-500" />
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                            AI Scheduled
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
