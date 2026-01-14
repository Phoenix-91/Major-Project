import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export const DarkModeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-1 transition-colors"
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                animate={{
                    x: theme === 'dark' ? 0 : 24,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-3 h-3 text-gray-900" />
                ) : (
                    <Sun className="w-3 h-3 text-gray-900" />
                )}
            </motion.div>
        </motion.button>
    );
};
