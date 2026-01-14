import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const QuickActionCard = ({ icon: Icon, title, description, onClick, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={onClick}
            className="cursor-pointer"
        >
            <GlassCard className="p-4 group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                            <Icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{title}</h3>
                            <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                </div>
            </GlassCard>
        </motion.div>
    );
};
