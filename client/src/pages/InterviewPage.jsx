import { useState, useRef, useEffect } from 'react';
import {
    Upload, X, Play, Square, CheckCircle, Download, RotateCcw,
    Send, Mic, PhoneOff, TrendingUp, TrendingDown, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { GlassCard } from '../components/GlassCard';
import { ChatMessage } from '../components/ChatMessage';
import { Button } from '../components/ui/button';
import { InterviewTimer } from '../components/InterviewTimer';
import { DualCameraView } from '../components/DualCameraView';
import { ScoreChart } from '../components/ScoreChart';

const JOB_ROLES = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
    'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'QA Engineer'
];

const EXPERIENCE_LEVELS = ['Fresher', '1-3 years', '3-5 years', '5+ years'];

export default function InterviewPage() {
    // Phase management
    const [phase, setPhase] = useState('setup'); // setup, interview, analysis

    // Setup state
    const [resumeFile, setResumeFile] = useState(null);
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [jobDescription, setJobDescription] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Fresher');

    // Interview state
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userResponse, setUserResponse] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [interviewActive, setInterviewActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(600); // Track remaining time
    const messagesEndRef = useRef(null);

    // Analysis state
    const [analysis, setAnalysis] = useState(null);
    const [interviewDuration, setInterviewDuration] = useState(0);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Camera setup
    useEffect(() => {
        if (phase === 'interview' || phase === 'setup') {
            startCamera();
        }
        return () => stopCamera();
    }, [phase]);

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
        setPhase('interview');
        setInterviewActive(true);
        setMessages([
            {
                text: `Hello! I'm your AI interviewer for the ${jobRole} position. I'll be conducting a 10-minute interview. Let's begin! Can you tell me about yourself?`,
                isAI: true
            }
        ]);
    };

    const submitResponse = () => {
        if (!userResponse.trim()) return;

        setMessages(prev => [...prev, { text: userResponse, isAI: false }]);
        const currentResponse = userResponse;
        setUserResponse('');

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                "That's interesting! Can you elaborate on your experience with that technology?",
                "Great answer! Now, tell me about a challenging project you've worked on.",
                "I see. How do you handle working under pressure?",
                "Excellent! What are your thoughts on team collaboration?",
                "Thank you for sharing. Can you describe your problem-solving approach?"
            ];
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            setMessages(prev => [...prev, { text: randomResponse, isAI: true }]);
        }, 1500);
    };

    const endInterview = () => {
        setInterviewActive(false);
        setPhase('analysis');
        stopCamera();

        // Calculate actual duration
        const duration = 600 - timeRemaining; // Actual time spent
        setInterviewDuration(duration);

        // Generate DYNAMIC analysis based on actual interview
        const questionsAnswered = Math.floor(messages.filter(m => !m.isAI).length);
        const avgResponseLength = messages
            .filter(m => !m.isAI)
            .reduce((sum, m) => sum + m.text.length, 0) / (questionsAnswered || 1);

        // Calculate scores based on actual performance
        const communicationScore = Math.min(100, Math.floor(
            (avgResponseLength / 100) * 50 + // Response detail
            (questionsAnswered * 10) + // Number of responses
            Math.random() * 20 // Variation
        ));

        const technicalScore = Math.min(100, Math.floor(
            (questionsAnswered * 15) + // Engagement
            (duration / 10) + // Time spent
            Math.random() * 20
        ));

        const confidenceScore = Math.min(100, Math.floor(
            (avgResponseLength / 80) * 40 +
            (questionsAnswered * 12) +
            Math.random() * 20
        ));

        const problemSolvingScore = Math.min(100, Math.floor(
            (questionsAnswered * 18) +
            Math.random() * 30
        ));

        const clarityScore = Math.min(100, Math.floor(
            (avgResponseLength / 120) * 50 +
            (questionsAnswered * 10) +
            Math.random() * 20
        ));

        const overallScore = Math.floor(
            (communicationScore + technicalScore + confidenceScore + problemSolvingScore + clarityScore) / 5
        );

        // Generate dynamic strengths and weaknesses
        const strengths = [];
        const weaknesses = [];

        if (communicationScore >= 75) {
            strengths.push("Excellent communication skills and clear articulation");
        } else if (communicationScore < 50) {
            weaknesses.push("Need to improve communication clarity and detail");
        }

        if (technicalScore >= 75) {
            strengths.push("Strong technical knowledge demonstrated");
        } else if (technicalScore < 50) {
            weaknesses.push("Technical knowledge needs improvement");
        }

        if (confidenceScore >= 75) {
            strengths.push("Confident and professional demeanor");
        } else if (confidenceScore < 50) {
            weaknesses.push("Work on building confidence in responses");
        }

        if (questionsAnswered >= 5) {
            strengths.push("Good engagement throughout the interview");
        } else {
            weaknesses.push("Could be more engaged and responsive");
        }

        if (avgResponseLength > 100) {
            strengths.push("Detailed and thoughtful responses");
        } else if (avgResponseLength < 50) {
            weaknesses.push("Responses could be more detailed and elaborate");
        }

        // If no responses, show appropriate message
        if (questionsAnswered === 0) {
            weaknesses.push("No responses provided during the interview");
            weaknesses.push("Practice answering questions to improve");
        }

        // Generate question analysis from actual conversation
        const questionAnalysis = messages
            .filter(m => m.isAI)
            .slice(0, 5) // First 5 questions
            .map((q, index) => {
                const userAnswer = messages[messages.indexOf(q) + 1];
                const answerLength = userAnswer?.text?.length || 0;
                const score = Math.min(100, Math.floor(
                    (answerLength / 100) * 60 + Math.random() * 40
                ));

                return {
                    question: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : ''),
                    score: userAnswer ? score : 0,
                    feedback: userAnswer
                        ? (score >= 80
                            ? "Excellent response with good detail and clarity."
                            : score >= 60
                                ? "Good answer, but could provide more specific examples."
                                : "Response needs more detail and structure.")
                        : "No response provided to this question."
                };
            });

        // Generate dynamic recommendations
        const recommendations = [];

        if (overallScore < 60) {
            recommendations.push("Practice mock interviews regularly to build confidence");
            recommendations.push("Prepare answers using the STAR method (Situation, Task, Action, Result)");
        }

        if (avgResponseLength < 80) {
            recommendations.push("Work on providing more detailed responses with specific examples");
        }

        if (questionsAnswered < 4) {
            recommendations.push("Engage more actively in the interview process");
            recommendations.push("Prepare answers to common interview questions beforehand");
        }

        recommendations.push("Research the company and role thoroughly before interviews");
        recommendations.push("Practice explaining technical concepts in simple terms");

        if (technicalScore < 70) {
            recommendations.push("Strengthen your technical knowledge in core areas");
        }

        setAnalysis({
            overallScore,
            scores: {
                communication: communicationScore,
                technical: technicalScore,
                confidence: confidenceScore,
                problemSolving: problemSolvingScore,
                clarity: clarityScore
            },
            strengths: strengths.length > 0 ? strengths : ["Keep practicing to improve your interview skills"],
            weaknesses: weaknesses.length > 0 ? weaknesses : ["Continue building on your current performance"],
            questionAnalysis,
            recommendations
        });
    };

    const handleTimeUp = () => {
        if (interviewActive) {
            endInterview();
        }
    };

    // SETUP PHASE
    if (phase === 'setup') {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <AnimatedBackground />

                <div className="relative z-10 container mx-auto px-6 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-8"
                    >
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">AI Interview Simulator</h1>
                            <p className="text-muted-foreground">Prepare for your interview with AI-powered practice</p>
                        </div>

                        {/* Main Setup Card */}
                        <GlassCard className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left: Camera Preview */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Camera Preview</h3>
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                        {!stream && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <p className="text-muted-foreground">Camera not available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Configuration */}
                                <div className="space-y-6">
                                    {/* Resume Upload */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Upload Resume *</label>
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
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setResumeFile(null);
                                                        }}
                                                        className="ml-2 p-1 hover:bg-white/10 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    {/* Job Role */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Job Role *</label>
                                        <select
                                            value={jobRole}
                                            onChange={(e) => setJobRole(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        >
                                            {JOB_ROLES.map(role => (
                                                <option key={role} value={role} className="bg-gray-900 text-white">
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Experience Level */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Experience Level *</label>
                                        <select
                                            value={experienceLevel}
                                            onChange={(e) => setExperienceLevel(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        >
                                            {EXPERIENCE_LEVELS.map(level => (
                                                <option key={level} value={level} className="bg-gray-900 text-white">
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Job Description */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Job Description (Optional)</label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the job description here to get more relevant questions..."
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        onClick={startInterview}
                                        disabled={!resumeFile}
                                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Interview
                                    </Button>
                                    {!resumeFile && (
                                        <p className="text-xs text-center text-muted-foreground">
                                            Please upload your resume to continue
                                        </p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        );
    }

    // INTERVIEW PHASE
    if (phase === 'interview') {
        return (
            <div className="h-screen bg-background text-foreground overflow-hidden">
                <AnimatedBackground />

                <div className="relative z-10 h-screen flex flex-col">
                    {/* Top Bar */}
                    <div className="px-6 py-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
                        <div className="container mx-auto flex items-center justify-between">
                            <InterviewTimer
                                duration={600}
                                onTimeUp={handleTimeUp}
                                isActive={interviewActive}
                                onTick={(remaining) => setTimeRemaining(remaining)}
                            />

                            <Button
                                onClick={endInterview}
                                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                            >
                                <PhoneOff className="w-4 h-4 mr-2" />
                                End Interview
                            </Button>
                        </div>
                    </div>

                    {/* Main Interview Area */}
                    <div className="flex-1 container mx-auto px-6 py-4 overflow-hidden">
                        <div className="grid lg:grid-cols-5 gap-4 h-full">
                            {/* Left: Dual Camera View (3 columns = 60%) */}
                            <div className="lg:col-span-3 h-full overflow-hidden">
                                <DualCameraView userVideoRef={videoRef} userStream={stream} />
                            </div>

                            {/* Right: Chat Interface (2 columns = 40%) */}
                            <div className="lg:col-span-2 h-full overflow-hidden">
                                <GlassCard className="p-4 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            Interview Chat (real time)
                                        </h3>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
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
                                    <div className="space-y-2 mt-auto border-t border-white/10 pt-4">
                                        <textarea
                                            value={userResponse}
                                            onChange={(e) => setUserResponse(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitResponse())}
                                            placeholder="Type your response..."
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                            rows={2}
                                        />

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setIsListening(!isListening)}
                                                className={`flex-1 ${isListening ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'}`}
                                                title="Voice input"
                                            >
                                                <Mic className="w-5 h-5 mr-2" />
                                                {isListening ? 'Listening...' : 'Voice Input'}
                                            </Button>

                                            <Button
                                                onClick={submitResponse}
                                                disabled={!userResponse.trim()}
                                                className="flex-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 disabled:opacity-50"
                                                title="Send message"
                                            >
                                                <Send className="w-5 h-5 mr-2" />
                                                Send
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ANALYSIS PHASE
    return (
        <div className="min-h-screen bg-background text-foreground">
            <AnimatedBackground />

            <div className="relative z-10 container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-6xl mx-auto space-y-8"
                >
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
                        <p className="text-muted-foreground">
                            Duration: {Math.floor(interviewDuration / 60)}:{String(interviewDuration % 60).padStart(2, '0')} minutes
                        </p>
                    </div>

                    {/* Overall Score */}
                    <GlassCard className="p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Overall Performance</p>
                        <p className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                            {analysis?.overallScore}%
                        </p>
                        <p className="text-lg text-muted-foreground">
                            {analysis?.overallScore >= 80 ? 'Excellent Performance!' :
                                analysis?.overallScore >= 60 ? 'Good Job!' :
                                    'Keep Practicing!'}
                        </p>
                    </GlassCard>

                    {/* Detailed Scores */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Detailed Analysis</h2>
                        <div className="grid md:grid-cols-5 gap-6">
                            {Object.entries(analysis?.scores || {}).map(([key, value]) => (
                                <GlassCard key={key} className="p-6 flex items-center justify-center">
                                    <ScoreChart
                                        score={value}
                                        label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                    />
                                </GlassCard>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                <h3 className="font-semibold text-green-400">Strengths</h3>
                            </div>
                            <ul className="space-y-3">
                                {analysis?.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>

                        {/* Weaknesses */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown className="w-5 h-5 text-orange-400" />
                                <h3 className="font-semibold text-orange-400">Areas for Improvement</h3>
                            </div>
                            <ul className="space-y-3">
                                {analysis?.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>

                    {/* Question Analysis */}
                    <GlassCard className="p-6">
                        <h3 className="font-semibold mb-4">Question-by-Question Analysis</h3>
                        <div className="space-y-4">
                            {analysis?.questionAnalysis.map((qa, index) => (
                                <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium">Q{index + 1}: {qa.question}</p>
                                        <span className={`text-sm font-bold ${qa.score >= 80 ? 'text-green-400' :
                                            qa.score >= 60 ? 'text-yellow-400' : 'text-orange-400'
                                            }`}>
                                            {qa.score}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{qa.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Recommendations */}
                    <GlassCard className="p-6">
                        <h3 className="font-semibold mb-4">Recommendations for Improvement</h3>
                        <ul className="space-y-3">
                            {analysis?.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => {
                                setPhase('setup');
                                setResumeFile(null);
                                setMessages([]);
                                setAnalysis(null);
                            }}
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
