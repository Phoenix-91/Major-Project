import { GlassCard } from './GlassCard';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const CommandInput = ({ value, onChange, onSubmit, placeholder, suggestions = [] }) => {
    return (
        <GlassCard className="p-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-foreground">AI Command</h3>
                </div>

                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Tell me what you want to automate..."}
                    className="min-h-[120px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground resize-none"
                />

                {suggestions.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => onChange(suggestion)}
                                    className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {suggestion}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    onClick={onSubmit}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Execute Command
                </Button>
            </div>
        </GlassCard>
    );
};
