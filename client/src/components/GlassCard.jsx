import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className, hover = true, ...props }) => {
    return (
        <motion.div
            className={cn(
                "relative rounded-2xl p-6",
                "bg-white/5 backdrop-blur-md",
                "border border-white/10",
                "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
                hover && "hover:bg-white/10 transition-all duration-300",
                className
            )}
            whileHover={hover ? { y: -5, scale: 1.02 } : {}}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
