import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import EmailPanel from '../components/EmailPanel';
import CalendarPanel from '../components/CalendarPanel';
import ProactivePanel from '../components/ProactivePanel';
import ActivityLog from '../components/ActivityLog';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    const [chatInput, setChatInput] = useState('');

    const handleProactiveExecute = (command) => {
        setChatInput(command);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Your AI-powered automation command center
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <motion.div
                        className="hidden md:flex gap-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">24/7</div>
                            <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-5 h-5" />
                                100%
                            </div>
                            <div className="text-xs text-muted-foreground">Automated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                                <Zap className="w-5 h-5" />
                                Fast
                            </div>
                            <div className="text-xs text-muted-foreground">Response</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Main Chat Area - Takes 2 columns */}
                    <motion.div variants={item} className="lg:col-span-2 space-y-6">
                        <ChatInterface key={chatInput} initialInput={chatInput} />
                        <ActivityLog limit={5} />
                    </motion.div>

                    {/* Sidebar Panels - Takes 1 column */}
                    <motion.div variants={item} className="space-y-6">
                        <ProactivePanel onExecute={handleProactiveExecute} />
                        <EmailPanel />
                        <CalendarPanel />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
