import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { LayoutDashboard, Video, LogOut, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
    <Link
        to={href}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </Link>
);

const MainLayout = ({ children }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-card border-r border-border flex flex-col w-64 transition-all duration-300",
                    !sidebarOpen && "w-0 opacity-0 overflow-hidden"
                )}
            >
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        NEXUS.AI
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem
                        icon={Video}
                        label="Interview Sim"
                        href="/interview"
                        active={location.pathname === '/interview'}
                    />
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        href="/dashboard"
                        active={location.pathname === '/dashboard'}
                    />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <span className="text-sm font-medium">My Profile</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 md:hidden">
                        <Menu />
                    </button>
                    <div className="ml-auto">
                        {/* Header Actions if needed */}
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
