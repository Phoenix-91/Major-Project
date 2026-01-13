import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Upload, X, Play, Square, CheckCircle, AlertCircle, Send, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApi } from '../services/api';

const JOB_ROLES = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
    'QA Engineer',
    'Other'
];

export default function InterviewPage() {
    const [sessionState, setSessionState] = useState('setup'); // setup, active, review
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadError, setUploadError] = useState('');
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const api = useApi();
    const [sessionId, setSessionId] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [customJobRole, setCustomJobRole] = useState('');
    const [difficulty, setDifficulty] = useState('medium');

    // Interview conversation state
    const [messages, setMessages] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [userResponse, setUserResponse] = useState('');
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const messagesEndRef = useRef(null);

    // Initialize Camera
    useEffect(() => {
        if (sessionState === 'active' || sessionState === 'setup') {
            startCamera();
        }
        return () => stopCamera();
    }, [sessionState]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setUploadError('Please upload a PDF file');
            setUploadStatus('error');
            return;
        }

        setResumeFile(file);
        setUploadStatus('uploading');
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8000/parse-resume', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to parse resume');

            const data = await response.json();
            setResumeText(data.text || '');
            setUploadStatus('success');

            setTimeout(() => setUploadStatus(''), 3000);
        } catch (err) {
            console.error('Resume upload error:', err);
            setUploadError('Failed to parse resume. Please try again.');
            setUploadStatus('error');
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.includes('Female') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Zira') ||
                voice.name.includes('Google UK English Female')
            ) || voices.find(voice => voice.lang.includes('en'));

            if (femaleVoice) utterance.voice = femaleVoice;
            utterance.rate = 0.9;
            utterance.pitch = 1.1;

            setIsAISpeaking(true);
            utterance.onend = () => setIsAISpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const startInterview = async () => {
        if (!resumeFile) {
            setUploadError('Please upload a resume first');
            setUploadStatus('error');
            return;
        }

        if (!resumeText) {
            setUploadError('Resume is still being processed. Please wait.');
            setUploadStatus('error');
            return;
        }

        const finalJobRole = jobRole === 'Other' ? customJobRole : jobRole;

        try {
            const response = await api.post('/interviews/start', {
                jobRole: finalJobRole,
                difficulty,
                resumeText
            });

            setSessionId(response.data._id);
            setSessionState('active');

            // Start with AI introduction
            const intro = `Hello! I'm your AI interviewer today. I'll be conducting a ${difficulty} level interview for the ${finalJobRole} position. Let's begin with your introduction. Please tell me about yourself.`;
            setCurrentQuestion(intro);
            setMessages([{ role: 'ai', text: intro, timestamp: new Date() }]);
            speakText(intro);

        } catch (err) {
            console.error("Failed to start session", err);
            setUploadError(err.response?.data?.error || 'Failed to start interview session. Please try again.');
            setUploadStatus('error');
        }
    };

    const submitResponse = async () => {
        if (!userResponse.trim()) return;

        const userMsg = { role: 'user', text: userResponse, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);

        try {
            const response = await api.post(`/interviews/${sessionId}/respond`, {
                response: userResponse,
                resumeText,
                jobRole: jobRole === 'Other' ? customJobRole : jobRole
            });

            const aiQuestion = response.data.next_question || response.data.question;
            if (aiQuestion) {
                const aiMsg = { role: 'ai', text: aiQuestion, timestamp: new Date() };
                setMessages(prev => [...prev, aiMsg]);
                setCurrentQuestion(aiQuestion);
                speakText(aiQuestion);
                setQuestionCount(prev => prev + 1);
            }

            setUserResponse('');
        } catch (err) {
            console.error('Failed to submit response', err);
        }
    };

    const endInterview = async () => {
        window.speechSynthesis.cancel();
        setSessionState('review');
        stopCamera();

        if (sessionId) {
            try {
                const response = await api.post(`/interviews/${sessionId}/end`);
                setAnalysis(response.data.analysis);
            } catch (err) {
                console.error("Failed to end session", err);
            }
        }
    };

    if (sessionState === 'setup') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold">AI Interview Simulator</h2>
                    <p className="text-muted-foreground">Upload your resume to get personalized questions.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Resume Upload */}
                    <div className="space-y-4">
                        <div className={cn(
                            "p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all relative",
                            uploadStatus === 'success' ? 'border-green-500 bg-green-500/5' :
                                uploadStatus === 'error' ? 'border-red-500 bg-red-500/5' :
                                    uploadStatus === 'uploading' ? 'border-blue-500 bg-blue-500/5' :
                                        'border-border bg-muted/5 hover:bg-muted/10'
                        )}>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleResumeUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploadStatus === 'uploading'}
                            />
                            <div className={cn(
                                "mb-4 p-4 rounded-full",
                                uploadStatus === 'success' ? 'bg-green-500/10 text-green-500' :
                                    uploadStatus === 'error' ? 'bg-red-500/10 text-red-500' :
                                        uploadStatus === 'uploading' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-primary/10 text-primary'
                            )}>
                                {uploadStatus === 'uploading' ? (
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                ) : uploadStatus === 'success' ? (
                                    <CheckCircle className="w-8 h-8" />
                                ) : uploadStatus === 'error' ? (
                                    <AlertCircle className="w-8 h-8" />
                                ) : (
                                    <Upload className="w-8 h-8" />
                                )}
                            </div>
                            <p className="font-semibold text-lg">
                                {uploadStatus === 'uploading' ? 'Parsing resume...' :
                                    uploadStatus === 'success' ? 'Resume uploaded successfully!' :
                                        uploadStatus === 'error' ? 'Upload failed' :
                                            resumeFile ? resumeFile.name : "Drop your resume PDF"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {uploadStatus === 'uploading' ? 'Please wait...' :
                                    uploadStatus === 'error' ? uploadError :
                                        uploadStatus === 'success' ? 'Ready to start interview' :
                                            'Click to browse'}
                            </p>
                        </div>

                        {/* Job Role & Difficulty Selection */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">Job Role</label>
                                <select
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                                >
                                    {JOB_ROLES.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            {jobRole === 'Other' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Custom Job Role</label>
                                    <input
                                        type="text"
                                        value={customJobRole}
                                        onChange={(e) => setCustomJobRole(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                                        placeholder="Enter your job role"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Camera Preview */}
                    <div className="bg-black rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {!stream && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-white/10">
                                <Camera className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <div className="px-3 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Camera Active
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={startInterview}
                        disabled={!resumeFile || uploadStatus === 'uploading' || !resumeText || (jobRole === 'Other' && !customJobRole)}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-bold hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadStatus === 'uploading' ? 'Processing Resume...' : 'Start Interview'}
                        <Play className="w-5 h-5 fill-current" />
                    </button>
                </div>
            </div>
        );
    }

    if (sessionState === 'active') {
        return (
            <div className="h-[calc(100vh-100px)] flex gap-4">
                {/* Main Interview Area */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                        {/* AI Avatar Area */}
                        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
                            <div className={cn(
                                "w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl z-10",
                                isAISpeaking && "animate-pulse"
                            )}>
                                AI
                            </div>
                            <p className="mt-8 text-lg font-medium text-foreground z-10">
                                {isAISpeaking ? 'Speaking...' : 'Listening...'}
                            </p>

                            {/* Current Question */}
                            <div className="absolute bottom-8 left-8 right-8 text-center">
                                <p className="bg-black/50 text-white px-4 py-2 rounded-lg inline-block text-sm max-w-full">
                                    {currentQuestion || "Waiting for your response..."}
                                </p>
                            </div>
                        </div>

                        {/* User Camera */}
                        <div className="bg-black rounded-xl overflow-hidden relative border border-border">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full" /> REC
                            </div>
                            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                                Question {questionCount + 1}
                            </div>
                        </div>
                    </div>

                    {/* Response Input & Controls */}
                    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={userResponse}
                                onChange={(e) => setUserResponse(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && submitResponse()}
                                placeholder="Type your response here..."
                                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
                            />
                            <button
                                onClick={submitResponse}
                                disabled={!userResponse.trim()}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" /> Send
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={endInterview}
                                className="px-8 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Square className="w-4 h-4 fill-current" /> End Interview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Sidebar */}
                <div className="w-80 bg-card border border-border rounded-xl flex flex-col">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Conversation</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn(
                                "flex",
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}>
                                <div className={cn(
                                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                    msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                )}>
                                    <p className="font-semibold text-xs mb-1">
                                        {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                                    </p>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto text-center space-y-8 pt-10">
            <h2 className="text-3xl font-bold">Interview Complete</h2>

            {!analysis ? (
                <div className="p-12 bg-card border border-border rounded-xl">
                    <p className="text-muted-foreground mb-4">Generating your comprehensive report...</p>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <p>Analyzing speech patterns...</p>
                    <p>Evaluating technical accuracy...</p>
                </div>
            ) : (
                <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 bg-card border border-border rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Performance Report</h3>
                            <div className="text-4xl font-bold text-primary">{analysis.score}/100</div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Feedback</h4>
                                <p className="text-muted-foreground">{analysis.feedback}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <h4 className="font-semibold text-red-600 mb-2">Areas for Improvement</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {analysis.areas_of_improvement?.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <h4 className="font-semibold text-green-600 mb-2">Recommended Resources</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {analysis.recommended_resources?.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => {
                                setSessionState('setup');
                                setAnalysis(null);
                                setResumeFile(null);
                                setSessionId(null);
                                setMessages([]);
                                setQuestionCount(0);
                            }}
                            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80"
                        >
                            Start New Session
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
