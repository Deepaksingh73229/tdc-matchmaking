'use client'

import { motion } from "motion/react";
import Image from "next/image";

export default function LoadingScreen() {
    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#0A0B0E] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Cinematic Background Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="relative z-10 flex flex-col items-center gap-6"
            >
                {/* Logo with pulse animation */}
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-rose-400 dark:bg-rose-500 blur-2xl rounded-full opacity-50"
                    ></motion.div>
                    <Image src="/logo100.png" alt="TDC Logo" width={50} height={50} className="w-15 h-15" priority />
                </div>

                {/* Loading Text */}
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        TDC Matchmaker
                    </h2>

                    <div className="flex items-center gap-1.5">
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        ></motion.div>

                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        ></motion.div>

                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        ></motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
