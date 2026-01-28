import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import {
    Brain, Zap, Shield, Clock, Video, CheckCircle,
    ArrowRight, Play, Check, ChevronRight, Star,
    Twitter, Github, Linkedin
} from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GlassCard } from '../components/GlassCard';
import { FeatureCard } from '../components/FeatureCard';
import { PricingCard } from '../components/PricingCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { DarkModeToggle } from '../components/DarkModeToggle';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Brain,
            title: "AI-Powered Interview Analysis",
            description: "Advanced AI that evaluates your responses and provides detailed feedback on communication, technical knowledge, and confidence"
        },
        {
            icon: Zap,
            title: "Real-Time Performance Feedback",
            description: "Get instant analysis of your interview performance with actionable insights and improvement recommendations"
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "Your interview data is encrypted and secure. Practice confidently knowing your information is protected"
        },
        {
            icon: Clock,
            title: "Flexible Practice Sessions",
            description: "Practice anytime, anywhere with our 10-minute interview sessions tailored to your job role and experience level"
        },
        {
            icon: Video,
            title: "Dual Camera Experience",
            description: "Professional interview setup with AI interviewer and your live camera for realistic practice"
        },
        {
            icon: CheckCircle,
            title: "Comprehensive Scoring",
            description: "Detailed performance metrics including communication, technical skills, confidence, problem-solving, and clarity"
        }
    ];

    const pricingTiers = [
        {
            tier: "Free",
            price: "$0",
            period: "month",
            features: [
                "3 mock interviews per month",
                "Basic AI feedback",
                "Standard question bank",
                "Performance scores",
                "Community support"
            ]
        },
        {
            tier: "Pro",
            price: "$19",
            period: "month",
            popular: true,
            features: [
                "Unlimited mock interviews",
                "Advanced AI feedback",
                "Industry-specific questions",
                "Detailed performance analytics",
                "Video recording & playback",
                "Priority support",
                "Custom interview scenarios",
                "Progress tracking"
            ]
        },
        {
            tier: "Enterprise",
            price: "Custom",
            period: null,
            features: [
                "Everything in Pro",
                "Team accounts & analytics",
                "Custom question banks",
                "Dedicated account manager",
                "24/7 priority support",
                "White-label option",
                "API access",
                "Custom integrations"
            ]
        }
    ];

    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Software Engineer",
            company: "Google",
            content: "I practiced 20+ mock interviews before my Google interview. The AI feedback helped me improve my communication and confidence. Got the offer!",
            rating: 5
        },
        {
            name: "David Kim",
            role: "Product Manager",
            company: "Microsoft",
            content: "The real-time feedback is incredible. It helped me identify weak areas in my responses and improve them before the actual interview.",
            rating: 5
        },
        {
            name: "Aisha Patel",
            role: "Data Scientist",
            company: "Amazon",
            content: "Best interview prep tool I've used. The AI asks relevant questions and the scoring system helped me track my progress. Highly recommend!",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-foreground" />
                            </div>
                            <span className="text-xl font-bold">AI Interview Simulator</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <DarkModeToggle />
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <button
                                    onClick={() => navigate('/interview')}
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                    Start Interview
                                </button>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block mb-4 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                            <span className="text-sm text-muted-foreground">✨ AI-Powered Interview Practice</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                            Ace Your Next
                            <br />
                            Job Interview
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Practice with AI-powered mock interviews. Get real-time feedback and improve your interview skills.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 font-semibold">
                                        Get Started Free
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <button
                                    onClick={() => navigate('/interview')}
                                    className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 font-semibold"
                                >
                                    Start Interview
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </SignedIn>

                            <button className="px-8 py-4 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2 font-semibold">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Hero Glass Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <GlassCard className="p-8">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-foreground mb-2">5k+</div>
                                    <div className="text-muted-foreground">Job Seekers Helped</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-foreground mb-2">50k+</div>
                                    <div className="text-muted-foreground">Mock Interviews Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-foreground mb-2">85%</div>
                                    <div className="text-muted-foreground">Success Rate</div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Interview Practice</h2>
                        <p className="text-xl text-muted-foreground">Everything you need to ace your next interview</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Practice Plans for Every Goal</h2>
                        <p className="text-xl text-muted-foreground">Choose the plan that matches your interview preparation needs</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <PricingCard key={index} {...tier} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h2>
                        <p className="text-xl text-muted-foreground">See how we helped job seekers land their dream jobs</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <TestimonialCard key={index} {...testimonial} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <GlassCard className="text-center p-12">
                        <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            Join thousands of job seekers who improved their interview skills with AI-powered practice.
                        </p>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 font-semibold mx-auto">
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <button
                                onClick={() => navigate('/interview')}
                                className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 font-semibold mx-auto"
                            >
                                Start Interview
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </SignedIn>
                    </GlassCard>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-foreground" />
                                </div>
                                <span className="text-lg font-bold">AI Interview Simulator</span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                AI-powered interview practice platform.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Connect</h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-muted-foreground text-sm">
                            © 2026 AI Interview Simulator. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-muted-foreground text-sm">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
