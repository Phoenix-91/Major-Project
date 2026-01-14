import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';

export const FeatureCard = ({ icon: Icon, title, description, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <GlassCard className="h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <Icon className="w-8 h-8 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
            </GlassCard>
        </motion.div>
    );
};
