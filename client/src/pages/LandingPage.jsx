import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { ArrowRight, Sparkles, Zap, Shield, Brain, Calendar, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function LandingPage() {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: Brain,
            title: "AI-Powered Automation",
            description: "Natural language commands that understand context and intent",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Mail,
            title: "Smart Email Management",
            description: "Draft, send, and manage emails with AI assistance",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Calendar,
            title: "Intelligent Scheduling",
            description: "Automatic conflict detection and smart meeting suggestions",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: MessageSquare,
            title: "Interview Simulator",
            description: "AI-powered interview prep with real-time feedback",
            color: "from-orange-500 to-red-500"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-px w-px bg-white rounded-full"
                            animate={{
                                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">AI Agent</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center gap-4">
                                <Button onClick={() => navigate('/dashboard')} className="bg-white text-purple-900 hover:bg-white/90">
                                    Go to Dashboard
                                </Button>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                    </motion.div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 container mx-auto px-4 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-white">Powered by Advanced AI</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Your AI-Powered
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Automation Assistant
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Transform your productivity with intelligent automation.
                        Manage emails, schedule meetings, and prepare for interviews—all through natural language.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 text-lg px-8">
                                    Get Started Free
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Button
                                size="lg"
                                onClick={() => navigate('/dashboard')}
                                className="bg-white text-purple-900 hover:bg-white/90 text-lg px-8"
                            >
                                Go to Dashboard
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </SignedIn>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => navigate('/interview')}
                            className="border-white/20 text-white hover:bg-white/10 text-lg px-8"
                        >
                            Try Interview Simulator
                        </Button>
                    </motion.div>
                </div>

                {/* Feature Cards */}
                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05, y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Card className={cn(
                                "bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all cursor-pointer",
                                activeFeature === index && "border-white/30 shadow-lg shadow-purple-500/20"
                            )}>
                                <CardHeader>
                                    <div className={cn(
                                        "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-4",
                                        feature.color
                                    )}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <CardTitle className="text-white">{feature.title}</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 container mx-auto px-4 py-20">
                <motion.div
                    className="grid md:grid-cols-3 gap-8 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    {[
                        { value: "10+", label: "AI Tools" },
                        { value: "100%", label: "Automated" },
                        { value: "24/7", label: "Available" }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-gray-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-8 text-center text-gray-400">
                    <p>© 2026 AI Agent Automation Platform. Built with ❤️ using modern AI.</p>
                </div>
            </footer>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
