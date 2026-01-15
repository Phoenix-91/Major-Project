import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export const InterviewTimer = ({ duration = 600, onTimeUp, isActive = true, onTick }) => {
    const [timeRemaining, setTimeRemaining] = useState(duration);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev <= 1 ? 0 : prev - 1;
                onTick?.(newTime); // Notify parent of time change
                if (newTime === 0) {
                    clearInterval(interval);
                    onTimeUp?.();
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeUp, onTick]);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const percentage = (timeRemaining / duration) * 100;

    // Color based on time remaining
    const getColor = () => {
        if (percentage > 50) return 'text-green-400';
        if (percentage > 20) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
            <Clock className={`w-5 h-5 ${getColor()}`} />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Time Remaining</span>
                <span className={`text-lg font-bold ${getColor()}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${percentage > 50 ? 'bg-green-400' : percentage > 20 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
};
