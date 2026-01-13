import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProactive } from '../hooks/useProactive';
import { Lightbulb, X, Play, Loader2, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export default function ProactivePanel({ onExecute }) {
    const { recommendations, loading, dismiss, execute } = useProactive();
    const [executingId, setExecutingId] = useState(null);

    const handleExecute = async (rec) => {
        setExecutingId(rec._id);
        try {
            await execute(rec._id);
            if (onExecute) {
                onExecute(rec.command);
            }
        } finally {
            setExecutingId(null);
        }
    };

    const getPriorityVariant = (priority) => {
        const variants = {
            high: 'destructive',
            medium: 'warning',
            low: 'secondary'
        };
        return variants[priority] || 'secondary';
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high':
                return TrendingUp;
            case 'medium':
                return Clock;
            default:
                return Lightbulb;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <CardTitle>AI Suggestions</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
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
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <CardTitle>AI Suggestions</CardTitle>
                </div>
                <CardDescription>
                    Proactive recommendations based on your patterns
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                {recommendations.length === 0 ? (
                    <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm">No suggestions yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            AI will learn from your patterns and suggest actions
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="space-y-3">
                            {recommendations.map((rec, index) => {
                                const PriorityIcon = getPriorityIcon(rec.priority);
                                return (
                                    <motion.div
                                        key={rec._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative p-4 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all"
                                    >
                                        {/* Priority Indicator */}
                                        <div className={cn(
                                            "absolute top-0 left-0 w-1 h-full rounded-l-lg",
                                            rec.priority === 'high' && "bg-red-500",
                                            rec.priority === 'medium' && "bg-yellow-500",
                                            rec.priority === 'low' && "bg-blue-500"
                                        )} />

                                        <div className="pl-3">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <PriorityIcon className="w-4 h-4 text-purple-600 shrink-0" />
                                                    <p className="text-sm font-medium group-hover:text-purple-600 transition-colors">
                                                        {rec.title}
                                                    </p>
                                                </div>
                                                <Badge variant={getPriorityVariant(rec.priority)} className="shrink-0">
                                                    {rec.priority}
                                                </Badge>
                                            </div>

                                            <p className="text-xs text-muted-foreground mb-3">
                                                {rec.description}
                                            </p>

                                            {rec.reasoning && (
                                                <div className="mb-3 p-2 rounded bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                                    <p className="text-xs text-purple-700 dark:text-purple-300 italic">
                                                        💡 {rec.reasoning}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleExecute(rec)}
                                                    disabled={executingId === rec._id}
                                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                >
                                                    {executingId === rec._id ? (
                                                        <>
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            Executing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-3 h-3 mr-1" />
                                                            Execute
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => dismiss(rec._id)}
                                                    disabled={executingId === rec._id}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
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
