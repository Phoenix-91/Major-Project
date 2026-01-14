import { GlassCard } from './GlassCard';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const PricingCard = ({ tier, price, period, features, popular, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
        >
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold">
                        Most Popular
                    </div>
                </div>
            )}

            <GlassCard className={`h-full ${popular ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : ''}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{tier}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold text-white">{price}</span>
                            {period && <span className="text-gray-400">/{period}</span>}
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <div className="mt-0.5 p-1 rounded-full bg-green-500/20">
                                    <Check className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-gray-300 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <button className={`w-full py-3 rounded-lg font-semibold transition-all ${popular
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        }`}>
                        Get Started
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    );
};
