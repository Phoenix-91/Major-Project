import { motion } from 'framer-motion';

export const ScoreChart = ({ score, label, size = 120, color = 'purple' }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score >= 80) return { stroke: '#22c55e', text: 'text-green-400', bg: 'from-green-500/20' };
        if (score >= 60) return { stroke: '#eab308', text: 'text-yellow-400', bg: 'from-yellow-500/20' };
        if (score >= 40) return { stroke: '#f97316', text: 'text-orange-400', bg: 'from-orange-500/20' };
        return { stroke: '#ef4444', text: 'text-red-400', bg: 'from-red-500/20' };
    };

    const colors = getColor();

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="8"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.stroke}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
                </div>
            </div>

            {/* Label */}
            <p className="text-sm text-muted-foreground text-center">{label}</p>
        </div>
    );
};
