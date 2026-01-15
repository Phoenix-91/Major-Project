import { motion } from 'framer-motion';
import { Bot, User, Video } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const DualCameraView = ({ userVideoRef, userStream }) => {
    return (
        <div className="flex flex-col gap-4 h-full">
            {/* AI Camera - Top Half */}
            <GlassCard className="flex-1 p-4 relative overflow-hidden min-h-[250px]">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium">AI Interviewer</span>
                </div>

                {/* Animated gradient background for AI */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-pulse" />

                {/* AI Avatar */}
                <div className="relative h-full flex items-center justify-center">
                    <motion.div
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Bot className="w-16 h-16 text-white" />
                    </motion.div>
                </div>
            </GlassCard>

            {/* User Camera - Bottom Half */}
            <GlassCard className="flex-1 p-4 relative overflow-hidden min-h-[250px]">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-300 font-medium">My Live Cam</span>
                </div>

                {/* Recording indicator */}
                {userStream && (
                    <motion.div
                        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs text-red-400 font-medium">REC</span>
                    </motion.div>
                )}

                {/* Video element */}
                <div className="relative h-full rounded-lg overflow-hidden bg-black/50">
                    <video
                        ref={userVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover rounded-lg"
                    />
                    {!userStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Video className="w-12 h-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Camera not available</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
