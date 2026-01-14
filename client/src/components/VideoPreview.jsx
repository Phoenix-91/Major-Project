import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';

export const VideoPreview = ({ videoRef, stream, className }) => {
    return (
        <GlassCard className={`p-4 ${className}`}>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
                {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground">Camera not available</p>
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                {/* Recording indicator */}
                {stream && (
                    <motion.div
                        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs text-red-400 font-medium">REC</span>
                    </motion.div>
                )}
            </div>
        </GlassCard>
    );
};
