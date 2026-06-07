"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SidebarFooter } from "./SidebarFooter";
import {
    HeartHandshake,
    Heart,
    LayoutDashboard,
    Users,
    User,
    Bell,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Settings
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // Adjust path if needed
import { motion, AnimatePresence } from "motion/react";

interface DashboardShellProps {
    children: React.ReactNode;
    role: string;
    userName: string;
}

export default function DashboardShell({ children, role, userName }: DashboardShellProps) {
    const pathname = usePathname();

    // State for mobile drawer and desktop collapse
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Automatically close mobile sidebar when navigating to a new route
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Unread notifications state
    const [unreadCount, setUnreadCount] = useState(0);

    // Optimistically clear the badge if they visit the notifications page
    useEffect(() => {
        if (pathname === "/client-hub/notifications") {
            setUnreadCount(0);
        }
    }, [pathname]);

    // Fetch unread count for Client role
    useEffect(() => {
        if (role !== "Client") return;
        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/client/notifications?page=1&limit=1");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (err) {
                console.error("Failed to fetch unread notifications", err);
            }
        };
        fetchUnread();
        
        // Poll every 15 seconds to keep the badge up-to-date
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [role]);

    // Define navigation based on Role
    const matchmakerLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Matches", href: "/dashboard/matches", icon: HeartHandshake },
        { name: "My Profile", href: "/dashboard/profile", icon: Settings },
    ];

    const clientLinks = [
        { name: "My Portal", href: "/client-hub", icon: User },
        { name: "My Matches", href: "/client-hub/matches", icon: Heart },
        { name: "Notifications", href: "/client-hub/notifications", icon: Bell },
    ];

    const links = role === "Matchmaker" ? matchmakerLinks : clientLinks;

    // Dynamic widths for smooth CSS transitions
    const sidebarWidth = isCollapsed ? "w-20" : "w-64";
    const contentMargin = isCollapsed ? "md:ml-20" : "md:ml-64";

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex transition-colors duration-300">

            {/* ─── Mobile Overlay ─── */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* ─── Sidebar ─── */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-stone-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarWidth}
        `}
            >
                {/* Desktop Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-full p-1 hidden md:flex items-center justify-center text-slate-500 hover:text-rose-600 shadow-sm z-50 transition-transform"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute right-4 top-6 md:hidden text-slate-500 hover:text-rose-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Brand Header */}
                <div className="h-20 flex items-center px-5 border-b border-stone-200 dark:border-slate-800 shrink-0">
                    <Link href={role === "Matchmaker" ? "/dashboard" : "/client-hub"} className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl shrink-0">
                            <HeartHandshake className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                        </div>
                        <span className={`font-bold text-lg text-slate-900 dark:text-white tracking-tight whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            TDC Matchmaker
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 invisible' : 'opacity-100'}`}>
                        Menu
                    </p>
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        const isNotifications = link.name === "Notifications";

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                title={isCollapsed ? link.name : undefined}
                                className={`group flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out transform ${isActive
                                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 translate-x-1 shadow-sm border border-rose-100 dark:border-rose-900/30"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                        <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-rose-600 dark:text-rose-400" : "group-hover:text-rose-500"}`} />
                                        {/* Mobile/Collapsed Badge on icon */}
                                        <AnimatePresence>
                                            {isNotifications && unreadCount > 0 && isCollapsed && (
                                                <motion.span 
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
                                                    className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                                                >
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-slate-950"></span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                                        {link.name}
                                    </span>
                                </div>
                                
                                {/* Desktop Full Badge */}
                                <AnimatePresence>
                                    {!isCollapsed && isNotifications && unreadCount > 0 && (
                                        <motion.div 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
                                            className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-md shadow-rose-200 dark:shadow-none"
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                <SidebarFooter userName={userName} role={role} isCollapsed={isCollapsed} />
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${contentMargin}`}>

                {/* Mobile Header (Hidden on Desktop) */}
                <header className="md:hidden h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-stone-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <HeartHandshake className="w-5 h-5 text-rose-600" />
                        <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">TDC</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-stone-100 dark:bg-slate-900 rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}