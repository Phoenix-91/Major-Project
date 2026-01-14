import { GlassCard } from './GlassCard';
import { Star, Quote } from 'lucide-react';

export const TestimonialCard = ({ name, role, company, content, rating, avatar }) => {
    return (
        <GlassCard hover={false} className="h-full">
            <div className="flex flex-col h-full">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-white/20 mb-4" />

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    "{content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                }`}
                        />
                    ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {avatar || name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-foreground font-semibold">{name}</p>
                        <p className="text-muted-foreground text-sm">{role} at {company}</p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
