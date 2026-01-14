import { cn } from '../lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const GlassCard = ({ children, className, hover = true, parallax = false, ...props }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e) => {
        if (!parallax || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={cn(
                "relative rounded-2xl p-6",
                "bg-white/5 backdrop-blur-md",
                "border border-white/10",
                "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
                hover && "hover:bg-white/10 transition-all duration-300",
                className
            )}
            style={parallax ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
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
