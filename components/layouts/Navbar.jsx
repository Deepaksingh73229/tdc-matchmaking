"use client";

import { useState, useEffect } from "react";
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Profile from "@/components/layouts/navbar/Profile";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav 
            className={cn(
                "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
                isScrolled 
                    ? "backdrop-blur-2xl bg-white/70 dark:bg-slate-950/70 border-b border-stone-200 dark:border-slate-800 shadow-sm py-2" 
                    : "bg-transparent border-transparent py-4"
            )}
        >
            <div className="flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image src="/logo100.png" alt="TDC Logo" width={32} height={32} className="w-8 h-8" />

                    <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                        TDC <span className="hidden sm:inline">Matchmaker</span>
                    </span>
                </Link>

                <div className="flex items-center gap-5">
                    <ThemeToggle />
                    <Profile />
                </div>
            </div>
        </nav>
    );
}