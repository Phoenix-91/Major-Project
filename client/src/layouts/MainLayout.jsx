import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Video } from 'lucide-react';

const MainLayout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Simple Header */}
            <header className="h-16 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur flex-shrink-0">
                <div className="flex items-center justify-between w-full">
                    {/* Logo */}
                    <Link to="/interview" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            AI Interview Simulator
                        </h1>
                    </Link>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
