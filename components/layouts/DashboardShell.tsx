"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
    HeartHandshake,
    Heart,
    LayoutDashboard,
    User,
    Bell,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Settings
} from "lucide-react";

import { SidebarFooter } from "./SidebarFooter";

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
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Matches",
            href: "/dashboard/matches",
            icon: HeartHandshake
        },
        {
            name: "My Profile",
            href: "/dashboard/profile",
            icon: Settings
        },
    ];

    const clientLinks = [
        {
            name: "My Portal",
            href: "/client-hub",
            icon: User
        },
        {
            name: "My Matches",
            href: "/client-hub/matches",
            icon: Heart
        },
        {
            name: "Notifications",
            href: "/client-hub/notifications",
            icon: Bell
        },
    ];

    const links = role === "Matchmaker" ? matchmakerLinks : clientLinks;

    // Dynamic widths for smooth CSS transitions
    const sidebarWidth = isCollapsed ? "w-20" : "w-72";
    const contentMargin = isCollapsed ? "md:ml-20" : "md:ml-72";

    return (
        // Utilizing a creamy alabaster light theme and deep neutral obsidian dark theme
        <div className="min-h-screen w-full overflow-x-hidden bg-[#FDFBF7] dark:bg-[#0A0B0E] flex transition-colors duration-500 font-sans selection:bg-rose-200 selection:text-rose-900 dark:selection:bg-rose-900/50 dark:selection:text-rose-100">

            {/* ─── Mobile Overlay ─── */}
            <div
                className={`fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500 ease-out ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* ─── Sidebar ─── */}
            <aside
                className={
                    `fixed top-0 left-0 z-50 h-[100dvh] bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl border-r border-stone-200/60 dark:border-white/5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] dark:shadow-none
                     ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                     ${sidebarWidth}
                    `}
            >
                {/* Desktop Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3.5 top-9 bg-white dark:bg-[#1A1B23] border border-stone-200 dark:border-white/10 rounded-full p-1.5 hidden md:flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50 hover:shadow-md hover:shadow-rose-500/10 z-50 transition-all duration-300 group"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    )}
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute right-4 top-6 z-50 md:hidden text-slate-400 hover:text-rose-500 bg-stone-100 dark:bg-white/5 p-2 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Brand Header with Psychological SVG Backdrop */}
                <div className="relative h-20 flex items-center px-6 border-b border-stone-200/60 dark:border-white/5 shrink-0 overflow-hidden group">
                    {/* Abstract Love Triangle / Union Background */}
                    <div className="absolute -top-12 -left-8 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl transition-all duration-700 group-hover:bg-rose-500/20"></div>

                    <svg className="absolute right-0 bottom-0 w-24 h-24 text-rose-50 dark:text-rose-900/10 -mb-6 -mr-4 transform rotate-12 transition-transform duration-700 group-hover:rotate-45" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 10 L90 80 L10 80 Z" opacity="0.5" />
                        <circle cx="50" cy="55" r="25" opacity="0.5" />
                    </svg>

                    <Link
                        href="/"
                        className="relative flex items-center gap-3 w-full z-10"
                    >
                        <Image src="/logo50.png" alt="TDC Logo" width={28} height={28} className="w-9 h-9" />

                        <span className={`font-black text-xl text-slate-800 dark:text-slate-100 tracking-wide whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}>
                            TDC <span className="font-black text-rose-500 dark:text-rose-400">Matchmaker</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <p className={`px-2 text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-widest mb-6 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 invisible' : 'opacity-100'}`}>
                        Main Menu
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
                                className={`relative group flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-all duration-300 ease-out overflow-hidden ${isActive
                                    ? "text-rose-700 dark:text-rose-300 shadow-[inset_2px_0_0_0_#e11d48]" // Rose-600 equivalent inset
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                    }`}
                            >
                                {/* Active Background Highlight */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-linear-to-r from-rose-50 to-transparent dark:from-rose-500/10 dark:to-transparent -z-10" />
                                )}
                                {/* Hover Background Highlight */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-stone-100/50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10 rounded-2xl" />
                                )}

                                <div className="flex items-center gap-3.5 z-10">
                                    <div className="relative flex items-center justify-center">
                                        <Icon
                                            className={`w-[22px] h-[22px] shrink-0 transition-all duration-300 ${isActive
                                                ? "text-rose-600 dark:text-rose-400 drop-shadow-sm"
                                                : "group-hover:scale-110 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                                }`}
                                            strokeWidth={isActive ? 2 : 1.5}
                                        />

                                        {/* Mobile/Collapsed Badge on icon */}
                                        <AnimatePresence>
                                            {isNotifications && unreadCount > 0 && isCollapsed && (
                                                <motion.span
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                                                    className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
                                                >
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-[#111218]"></span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden translate-x-2' : 'opacity-100 translate-x-0'}`}>
                                        {link.name}
                                    </span>
                                </div>

                                {/* Desktop Full Badge */}
                                <AnimatePresence>
                                    {!isCollapsed && isNotifications && unreadCount > 0 && (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0, x: 10 }}
                                            animate={{ scale: 1, opacity: 1, x: 0 }}
                                            exit={{ scale: 0.5, opacity: 0, x: 10, transition: { duration: 0.2 } }}
                                            className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-rose-500 text-white text-[11px] font-semibold rounded-full shadow-md shadow-rose-500/20 z-10"
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* SidebarFooter component boundary - ensuring it blends seamlessly */}
                <div className="border-t border-stone-200/60 dark:border-white/5 bg-white/50 dark:bg-transparent backdrop-blur-md">
                    <SidebarFooter userName={userName} role={role} isCollapsed={isCollapsed} />
                </div>
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${contentMargin}`}>

                {/* Mobile Header (Hidden on Desktop) */}
                <header className="md:hidden h-18 bg-white/80 dark:bg-[#0A0B0E]/80 backdrop-blur-2xl border-b border-stone-200/60 dark:border-white/5 flex items-center justify-between px-5 sticky top-0 z-30 shadow-sm shadow-stone-200/20 dark:shadow-none">
                    <div className="flex items-center gap-2.5">
                        <Image src="/logo50.png" alt="TDC Logo" width={28} height={28} className="w-7 h-7" />

                        <span className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-wide">TDC <span className="hidden sm:inline">Matchmaker</span></span>
                    </div>

                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-stone-100/50 dark:bg-white/5 rounded-xl transition-colors active:scale-95"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-10 relative">
                    {/* Subtle Top linear for page depth */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-white dark:from-white/[0.02] to-transparent -z-10 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}