"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by rendering a placeholder of the same size
    if (!mounted) {
        return (
            <div className="p-2.5 rounded-xl border border-transparent">
                <div className="h-5 w-5 opacity-0" />
            </div>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-stone-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors outline-none cursor-pointer flex items-center justify-center"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    rotate: theme === "dark" ? 0 : 180,
                    scale: theme === "dark" ? 1 : 1.1
                }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
            >
                {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-indigo-400" />
                ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                )}
            </motion.div>
        </motion.button>
    );
}