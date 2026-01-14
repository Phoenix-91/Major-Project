import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, TrendingUp, Zap, Clock, Mail, Calendar,
    MessageSquare, FileText, Settings, BarChart3
} from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { StatCard } from '../components/StatCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { CommandInput } from '../components/CommandInput';
import { GlassCard } from '../components/GlassCard';
import ChatInterface from '../components/ChatInterface';
import ActivityLog from '../components/ActivityLog';

const COMMAND_SUGGESTIONS = [
    "Draft an email to my team about the project update",
    "Schedule a meeting with John next week",
    "Summarize my emails from today",
    "Create a task list for tomorrow"
];

export default function Dashboard() {
    const [chatInput, setChatInput] = useState('');

    const stats = [
        { icon: Zap, label: 'Total Tasks', value: '142', trend: 12 },
        { icon: TrendingUp, label: 'Success Rate', value: '94%', trend: 5 },
        { icon: Clock, label: 'Time Saved', value: '24h', trend: 18 },
        { icon: BarChart3, label: 'Automations', value: '28', trend: 8 }
    ];

    const quickActions = [
        { icon: Mail, title: 'Email Automation', description: 'Draft and send emails' },
        { icon: Calendar, title: 'Schedule Meeting', description: 'Find time and book' },
        { icon: MessageSquare, title: 'Interview Prep', description: 'Practice with AI' },
        { icon: FileText, title: 'Generate Report', description: 'Create documents' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Animated Background */}
            <AnimatedBackground />

            <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                            </div>
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Your AI-powered automation command center
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} index={index} />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Command Input & Chat */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Command Input */}
                        <CommandInput
                            value={chatInput}
                            onChange={setChatInput}
                            onSubmit={() => {
                                console.log('Execute:', chatInput);
                                setChatInput('');
                            }}
                            suggestions={COMMAND_SUGGESTIONS}
                        />

                        {/* Chat Interface */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                <h3 className="font-semibold text-foreground">AI Assistant</h3>
                            </div>
                            <ChatInterface />
                        </GlassCard>

                        {/* Activity Log */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-purple-400" />
                                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                            </div>
                            <ActivityLog />
                        </GlassCard>
                    </div>

                    {/* Right Column - Quick Actions & Insights */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-purple-400" />
                                <h3 className="font-semibold text-foreground">Quick Actions</h3>
                            </div>
                            <div className="space-y-3">
                                {quickActions.map((action, index) => (
                                    <QuickActionCard
                                        key={index}
                                        {...action}
                                        index={index}
                                        onClick={() => console.log('Action:', action.title)}
                                    />
                                ))}
                            </div>
                        </GlassCard>

                        {/* AI Insights */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <h3 className="font-semibold text-foreground">AI Insights</h3>
                            </div>
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
                                >
                                    <p className="text-sm text-foreground mb-2">
                                        💡 <span className="font-semibold">Productivity Tip</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        You're most productive between 9 AM - 11 AM. Schedule important tasks during this time.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
                                >
                                    <p className="text-sm text-foreground mb-2">
                                        📅 <span className="font-semibold">Upcoming</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        You have 3 meetings scheduled for tomorrow. Review your calendar.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20"
                                >
                                    <p className="text-sm text-foreground mb-2">
                                        ⚡ <span className="font-semibold">Quick Win</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        5 emails are waiting for your response. Use AI to draft replies quickly.
                                    </p>
                                </motion.div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
