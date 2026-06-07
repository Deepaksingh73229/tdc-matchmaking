"use client";

import Link from "next/link";
// Notice the updated import path for the latest version!
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeartHandshake, ShieldCheck, Sparkles, Users, ArrowRight, Heart } from "lucide-react";
import Footer from "./Footer";

export default function HomePageUI() {
    // Animation variants for staggered entrance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
        },
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
    };

    const floatingHeart: any = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-center transition-colors duration-300">

            {/* ─── Decorative Background Elements ─── */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-amber-100 dark:bg-amber-900/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

            {/* ─── Top Navigation (Public) ─── */}
            <header className="absolute top-0 w-full px-6 py-6 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2"
                >
                    <HeartHandshake className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                    <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">TDC</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-5">
                        <ThemeToggle />

                        <Link
                            href="/login"
                            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-stone-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                            Member Login
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* ─── Hero Section ─── */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">

                {/* Floating Heart Decoration */}
                <motion.div
                    variants={floatingHeart}
                    animate="animate"
                    className="absolute top-20 right-[20%] text-rose-300 dark:text-rose-800/40 hidden md:block"
                >
                    <Heart className="w-12 h-12 fill-current" />
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-3xl flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium mb-8 border border-rose-200 dark:border-rose-500/20 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        Exclusive Matrimonial Network
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500">Forever</span> With Confidence
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
                        The Date Crew blends advanced AI compatibility scoring with dedicated human matchmakers to curate highly verified profiles for a lasting relationship.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                            <Link
                                href="/register"
                                className="w-full px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30"
                            >
                                Create Your Profile <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* ─── Feature Highlights ─── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl"
                >
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-stone-200/50 dark:border-slate-800/50 text-left shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">100% Verified</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Every biodata is manually reviewed and approved by our expert matchmakers to ensure a safe, authentic, and premium community.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-stone-200/50 dark:border-slate-800/50 text-left shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Human Touch</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            You are never alone in your search. A dedicated matchmaker works directly with your profile to hand-pick and suggest tailored matches.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-stone-200/50 dark:border-slate-800/50 text-left shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Assisted</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Our advanced backend utilizes Generative AI to deeply analyze compatibility scores and draft personalized, warm introductions.
                        </p>
                    </motion.div>
                </motion.div>
            </main>

            <Footer/>

        </div>
    );
}