import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Settings, FileText, MessageSquare, X, Menu } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Chat from './Chat';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { path: '/dashboard/overview', icon: LayoutDashboard, label: 'Overview' },
        { path: '/dashboard/resumes', icon: FileText, label: 'My Resumes' },
        { path: '/dashboard/upload', icon: MessageSquare, label: 'New Upload' },
        { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    const isPanelOpen = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/';

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden">
            
            {/* Overlay for mobile/sidebar open */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Drawer) */}
            <AnimatePresence>
                {(isSidebarOpen) && (
                    <motion.aside 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-y-0 left-0 w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 flex flex-col z-50 shadow-2xl"
                    >
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                ResumeAgent
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        location.pathname === item.path 
                                        ? 'bg-blue-600/10 text-blue-400 font-medium' 
                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-zinc-800">
                            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Center: Persistent Chat Workspace */}
            <main className="flex-1 min-w-[400px] border-r border-zinc-800 bg-zinc-950 relative flex flex-col overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[50%] h-[30%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
                
                {/* Header for Chat Area */}
                <div className="h-16 border-b border-zinc-800/50 flex items-center px-6 gap-4 flex-shrink-0 z-10 bg-zinc-950/80 backdrop-blur-md">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex items-center gap-2 hover:bg-zinc-800/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <Menu className="w-5 h-5 text-zinc-400" />
                        <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ResumeAgent
                        </span>
                    </button>
                </div>

                <Chat />
            </main>

            {/* Right: Dynamic Side Panel (Only opens when a page is selected) */}
            <AnimatePresence>
                {isPanelOpen && (
                    <motion.aside 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "50%", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="bg-zinc-950/50 relative z-10 flex flex-col border-l border-zinc-800 overflow-hidden"
                    >
                        {/* Panel Header */}
                        <div className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 flex-shrink-0 bg-zinc-950/80 backdrop-blur-md">
                            <h3 className="font-semibold text-zinc-200">Workspace</h3>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-6 min-w-[350px]">
                            <Outlet />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
