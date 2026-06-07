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
        <div className="mt-auto p-4 border-t border-stone-200 dark:border-slate-800 relative z-20 shrink-0">
            <div className="relative group">

                {/* --- Profile Card (Trigger) --- */}
                <div
                    className={`flex items-center gap-3 rounded-2xl p-2 cursor-pointer transition-all duration-300 hover:bg-stone-100 dark:hover:bg-slate-800/50 ${isCollapsed ? "justify-center" : ""
                        }`}
                >
                    {/* Dynamic Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-500 shrink-0 shadow-inner">
                        <User className="w-5 h-5" />
                    </div>

                    {/* User Info (Hidden when collapsed) */}
                    <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {userName}
                        </p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                            {role}
                        </p>
                    </div>
                </div>

                {/* --- Hover Popup Menu --- */}
                <div
                    className={`absolute bottom-16 w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50 ${isCollapsed ? "left-12" : "left-0"
                        }`}
                >
                    <div className="rounded-2xl p-2 bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-xl backdrop-blur-xl flex flex-col gap-1">

                        {/* Theme Toggle Button */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800/80 transition-colors"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-4 h-4 text-amber-500" />
                                ) : (
                                    <Moon className="w-4 h-4 text-indigo-500" />
                                )}
                                {theme === "dark" ? "Light Mode" : "Dark Mode"}
                            </button>
                        )}

                        <div className="h-px w-full bg-stone-200 dark:bg-slate-800 my-1"></div>

                        {/* Logout Button */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}