import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

export const ChatMessage = ({ message, isAI, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
        >
            {isAI && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            )}

            <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${isAI
                        ? 'bg-white/5 backdrop-blur-md border border-white/10'
                        : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-500/30'
                    }`}
            >
                <p className="text-sm text-foreground leading-relaxed">{message}</p>
            </div>

            {!isAI && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                </div>
            )}
        </motion.div>
    );
};
