import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';

export const StatCard = ({ icon: Icon, label, value, trend, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">{label}</p>
                        <p className="text-3xl font-bold text-foreground">{value}</p>
                        {trend && (
                            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
                            </p>
                        )}
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <Icon className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};
