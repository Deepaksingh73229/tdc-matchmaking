"use client";

import * as React from "react";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

interface SidebarFooterProps {
    userName: string;
    role: string;
    isCollapsed: boolean;
}

export function SidebarFooter({ userName, role, isCollapsed }: SidebarFooterProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="mt-auto p-4 relative z-20 shrink-0 w-full">
            <div className="relative group w-full">

                {/* --- Profile Card (Trigger) --- */}
                <div
                    className={`flex items-center gap-3.5 rounded-2xl p-2 cursor-pointer transition-all duration-300 ease-out hover:bg-stone-100/60 dark:hover:bg-white/5 ${
                        isCollapsed ? "justify-center" : ""
                    }`}
                >
                    {/* Dynamic Avatar */}
                    <div className="w-[42px] h-[42px] rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 border border-rose-200/50 dark:border-rose-500/10 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/10 transition-transform duration-300 group-hover:scale-105">
                        <User className="w-[22px] h-[22px] text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
                    </div>

                    {/* User Info (Hidden when collapsed) */}
                    <div className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${isCollapsed ? 'w-0 opacity-0 translate-x-2 hidden' : 'opacity-100 translate-x-0'}`}>
                        <p className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 truncate tracking-tight">
                            {userName}
                        </p>
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                            {role}
                        </p>
                    </div>
                </div>

                {/* --- Hover Popup Menu --- */}
                {/* We use an invisible bridge area so the mouse doesn't lose hover when moving up */}
                <div
                    className={`absolute bottom-[110%] pb-2 w-[240px] opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-50 ${
                        isCollapsed ? "left-4" : "left-0"
                    }`}
                >
                    <div className="relative rounded-2xl p-1.5 bg-white/95 dark:bg-[#1A1B23]/95 backdrop-blur-xl border border-stone-200/60 dark:border-white/10 shadow-2xl shadow-stone-200/20 dark:shadow-black/50 flex flex-col gap-0.5 overflow-hidden">
                        
                        {/* Premium Subtle SVG Background inside popup */}
                        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <svg className="absolute top-0 right-0 w-16 h-16 text-rose-100 dark:text-rose-900/10 -mt-4 -mr-4 transform rotate-45 pointer-events-none" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 20 L80 70 L20 70 Z" opacity="0.3" />
                        </svg>

                        {/* Theme Toggle Button */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-stone-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200 z-10"
                            >
                                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                    {theme === "dark" ? (
                                        <Sun className="w-4 h-4 text-rose-300" strokeWidth={2} />
                                    ) : (
                                        <Moon className="w-4 h-4 text-slate-600" strokeWidth={2} />
                                    )}
                                </div>
                                {theme === "dark" ? "Light Mode" : "Dark Mode"}
                            </button>
                        )}

                        <div className="h-px w-full bg-stone-100 dark:bg-white/5 my-0.5 relative z-10"></div>

                        {/* Logout Button */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 z-10 group/btn"
                        >
                            <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover/btn:bg-rose-100 group-hover/btn:text-rose-600 dark:group-hover/btn:bg-rose-500/20 dark:group-hover/btn:text-rose-400 transition-colors">
                                <LogOut className="w-4 h-4" strokeWidth={2} />
                            </div>
                            Sign Out
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}