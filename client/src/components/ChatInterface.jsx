import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Bot, User, AlertTriangle, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApi } from '../services/api';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';

export default function ChatInterface({ initialInput = '' }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Agent. How can I help you automate your tasks today?' }
    ]);
    const [input, setInput] = useState(initialInput);
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const scrollRef = useRef(null);
    const api = useApi();

    const { isListening, transcript, toggleListening, isSupported } = useVoiceInput((text) => {
        setInput(text);
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (transcript && isListening) {
            setInput(transcript);
        }
    }, [transcript, isListening]);

    useEffect(() => {
        if (initialInput) {
            setInput(initialInput);
        }
    }, [initialInput]);

    const handleSend = async (commandOverride = null) => {
        const command = commandOverride || input;
        if (!command.trim()) return;

        const userMessage = { role: 'user', content: command };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setPendingAction(null);

        try {
            const response = await api.post('/agents/command', { command });
            const { plan, result, status, requires_confirmation, risk_level } = response.data;

            if (requires_confirmation && status === 'awaiting_confirmation') {
                setPendingAction({
                    command,
                    plan,
                    risk_level,
                    result
                });
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'This action requires your confirmation.',
                    plan,
                    risk_level,
                    awaiting_confirmation: true
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: result?.message || 'Task completed successfully!',
                    plan,
                    result,
                    status
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: error.response?.data?.error || 'Sorry, something went wrong. Please try again.',
                error: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (confirmed) => {
        if (!pendingAction) return;

        setPendingAction(null);
        setLoading(true);

        try {
            const response = await api.post('/agents/command', {
                command: pendingAction.command,
                confirmed
            });

            const { result, status } = response.data;
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: confirmed
                    ? (result?.message || 'Action executed successfully!')
                    : 'Action cancelled.',
                result,
                status,
                confirmed
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: error.response?.data?.error || 'Failed to execute action.',
                error: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[600px] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            AI Assistant
                            <Badge variant="success" className="text-xs">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1"></div>
                                Online
                            </Badge>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "flex gap-3",
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {message.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[80%] rounded-lg p-3",
                                message.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : message.error
                                        ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                                        : 'bg-muted'
                            )}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                {message.plan && (
                                    <div className="mt-3 p-3 rounded bg-white/50 dark:bg-black/20 border border-border">
                                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            AI Plan:
                                        </p>
                                        <ul className="text-xs space-y-1">
                                            {message.plan.steps?.map((step, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-purple-600 font-bold">{i + 1}.</span>
                                                    <span>{step.action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {message.plan.confidence && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span>Confidence</span>
                                                    <span className="font-semibold">{Math.round(message.plan.confidence * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                        style={{ width: `${message.plan.confidence * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {message.result && (
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        {message.status === 'success' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className="font-medium">
                                            {message.status === 'success' ? 'Completed' : 'Failed'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">AI is thinking...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={scrollRef} />
            </CardContent>

            <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                        placeholder="Type a command or ask me anything..."
                        disabled={loading}
                        className="flex-1"
                    />
                    {isSupported && (
                        <Button
                            variant={isListening ? "destructive" : "outline"}
                            size="icon"
                            onClick={toggleListening}
                            disabled={loading}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                    )}
                    <Button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                {isListening && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Listening...
                    </p>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Confirm Action
                        </DialogTitle>
                        <DialogDescription>
                            This action has been flagged as {pendingAction?.risk_level || 'medium'} risk.
                            Please review and confirm.
                        </DialogDescription>
                    </DialogHeader>

                    {pendingAction?.plan && (
                        <div className="my-4 p-3 rounded-lg bg-muted">
                            <p className="text-sm font-semibold mb-2">Planned Actions:</p>
                            <ul className="text-sm space-y-1">
                                {pendingAction.plan.steps?.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-purple-600 font-bold">{i + 1}.</span>
                                        <span>{step.action}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleConfirm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => handleConfirm(true)} className="bg-purple-600 hover:bg-purple-700">
                            Confirm & Execute
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
