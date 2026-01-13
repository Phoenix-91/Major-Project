import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../services/api';
import { Mail, Send, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export default function EmailPanel() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const response = await api.get('/emails');
            setEmails(response.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        const variants = {
            draft: 'warning',
            sent: 'success',
            failed: 'destructive'
        };
        return variants[status] || 'secondary';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        <CardTitle>Recent Emails</CardTitle>
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
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <CardTitle>Recent Emails</CardTitle>
                </div>
                <CardDescription>
                    AI-powered email management
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                {emails.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm">No emails yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Try: "Draft an email to john@example.com"
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {emails.map((email, index) => (
                            <motion.div
                                key={email._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group p-3 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="text-sm font-medium truncate flex-1 group-hover:text-blue-600 transition-colors">
                                        {email.subject}
                                    </p>
                                    <Badge variant={getStatusVariant(email.status)} className="shrink-0">
                                        {email.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mb-2">
                                    To: {email.recipient}
                                </p>
                                {email.aiGenerated && (
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-500" />
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                            AI Generated
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
