import { useState, useRef, useEffect } from 'react';
import {
    Camera, Mic, Upload, X, Play, Square, CheckCircle, AlertCircle,
    Send, MessageSquare, MicOff, Video, VideoOff, Download, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GlassCard } from '../components/GlassCard';
import { VideoPreview } from '../components/VideoPreview';
import { ChatMessage } from '../components/ChatMessage';
import { Button } from '../components/ui/button';
import { useApi } from '../services/api';

const JOB_ROLES = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
    'Product Manager', 'UI/UX Designer', 'Mobile Developer',
    'QA Engineer', 'Other'
];

export default function InterviewPage() {
    const [sessionState, setSessionState] = useState('setup'); // setup, active, review
    const [resumeFile, setResumeFile] = useState(null);
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [customJobRole, setCustomJobRole] = useState('');
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userResponse, setUserResponse] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const messagesEndRef = useRef(null);
    const api = useApi();

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Camera setup
    useEffect(() => {
        if (sessionState === 'active' || sessionState === 'setup') {
            startCamera();
        }
        return () => stopCamera();
    }, [sessionState]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleResumeUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
        }
    };

    const startInterview = () => {
        setSessionState('active');
        setMessages([
            { text: `Hello! I'm your AI interviewer. I'll be asking you questions for the ${jobRole} position. Let's begin!`, isAI: true }
        ]);
    };

    const submitResponse = () => {
        if (!userResponse.trim()) return;

        setMessages(prev => [...prev, { text: userResponse, isAI: false }]);
        setUserResponse('');

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: "That's a great answer! Let me ask you another question...",
                isAI: true
            }]);
        }, 1000);
    };

    const endInterview = () => {
        setSessionState('review');
        setAnalysis({
            overallScore: 85,
            communication: 90,
            technical: 80,
            confidence: 85,
            feedback: "Great performance! Your communication skills are excellent."
        });
        stopCamera();
    };

    // SETUP PHASE
    if (sessionState === 'setup') {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <AnimatedBackground />

                <div className="relative z-10 container mx-auto px-6 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">AI Interview Simulator</h1>
                            <p className="text-muted-foreground">Practice your interview skills with AI-powered feedback</p>
                        </div>

                        {/* Main Setup Card */}
                        <GlassCard className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left: Camera Preview */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Camera Preview</h3>
                                    <VideoPreview videoRef={videoRef} stream={stream} />
                                </div>

                                {/* Right: Configuration */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Job Role</label>
                                        <select
                                            value={jobRole}
                                            onChange={(e) => setJobRole(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground"
                                        >
                                            {JOB_ROLES.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {jobRole === 'Other' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Custom Role</label>
                                            <input
                                                type="text"
                                                value={customJobRole}
                                                onChange={(e) => setCustomJobRole(e.target.value)}
                                                placeholder="Enter job role..."
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Upload Resume (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleResumeUpload}
                                                className="hidden"
                                                id="resume-upload"
                                            />
                                            <label
                                                htmlFor="resume-upload"
                                                className="flex items-center justify-center gap-2 w-full px-4 py-8 rounded-lg border-2 border-dashed border-white/20 hover:border-purple-500/50 cursor-pointer transition-colors"
                                            >
                                                {resumeFile ? (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                        <span className="text-sm">{resumeFile.name}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={startInterview}
                                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-6 text-lg"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Interview
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ACTIVE INTERVIEW PHASE
    if (sessionState === 'active') {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <AnimatedBackground />

                <div className="relative z-10 container mx-auto px-6 py-8">
                    <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
                        {/* Left: Video Preview */}
                        <div className="space-y-4">
                            <VideoPreview videoRef={videoRef} stream={stream} className="h-full" />

                            <div className="flex gap-4">
                                <Button
                                    onClick={endInterview}
                                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    End Interview
                                </Button>
                            </div>
                        </div>

                        {/* Right: Chat Interface */}
                        <GlassCard className="p-6 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                <h3 className="font-semibold">Interview Chat</h3>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                {messages.map((msg, index) => (
                                    <ChatMessage
                                        key={index}
                                        message={msg.text}
                                        isAI={msg.isAI}
                                        index={index}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="space-y-2">
                                {transcript && (
                                    <div className="text-xs text-muted-foreground italic">
                                        Listening: {transcript}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <textarea
                                        value={userResponse}
                                        onChange={(e) => setUserResponse(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && submitResponse()}
                                        placeholder="Type your response..."
                                        className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground resize-none"
                                        rows={3}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            onClick={() => setIsListening(!isListening)}
                                            className={`p-3 ${isListening ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'}`}
                                        >
                                            <Mic className="w-5 h-5" />
                                        </Button>

                                        <Button
                                            onClick={submitResponse}
                                            className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30"
                                        >
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        );
    }

    // REVIEW PHASE
    return (
        <div className="min-h-screen bg-background text-foreground">
            <AnimatedBackground />

            <div className="relative z-10 container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
                        <p className="text-muted-foreground">Here's your performance analysis</p>
                    </div>

                    {/* Overall Score */}
                    <GlassCard className="p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                        <p className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {analysis?.overallScore}%
                        </p>
                    </GlassCard>

                    {/* Detailed Scores */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { label: 'Communication', score: analysis?.communication, color: 'purple' },
                            { label: 'Technical Skills', score: analysis?.technical, color: 'blue' },
                            { label: 'Confidence', score: analysis?.confidence, color: 'pink' }
                        ].map((item, index) => (
                            <GlassCard key={index} className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
                                <p className="text-3xl font-bold text-foreground">{item.score}%</p>
                                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ duration: 1, delay: index * 0.2 }}
                                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400`}
                                    />
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Feedback */}
                    <GlassCard className="p-6">
                        <h3 className="font-semibold mb-4">Feedback</h3>
                        <p className="text-muted-foreground">{analysis?.feedback}</p>
                    </GlassCard>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setSessionState('setup')}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10">
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
