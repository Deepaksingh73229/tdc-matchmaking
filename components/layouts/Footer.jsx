import { Heart, ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <section className="relative flex flex-col gap-10 bg-white dark:bg-slate-950 border-t border-stone-200 dark:border-slate-800 px-10 py-20 overflow-hidden rounded-t-4xl transition-colors duration-300 mt-20">
            {/* Decorative Background "Aura" */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 dark:bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full pb-10 flex flex-col lg:flex-row gap-10 border-b border-stone-200 dark:border-slate-800/60 items-center z-10">
                
                {/* Left Side: The Emotional Impact */}
                <div className="w-full lg:min-w-[50%] flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <p className="text-rose-600 dark:text-rose-400 font-mono text-sm tracking-[0.2em] font-bold uppercase flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Exclusive Matchmaking
                        </p>

                        <div className="flex flex-col text-7xl lg:text-8xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            <span>One Step</span>
                            <span className="text-stone-300 dark:text-slate-700">Closer To</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500">Forever.</span>
                        </div>
                    </div>

                    <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                        We don't just rely on algorithms; we bridge the gap between AI compatibility and <span className="text-slate-900 dark:text-white font-semibold italic">human intuition</span> to curate lasting relationships. 💍
                    </p>
                </div>

                {/* Right Side: Stats & Action Card */}
                <div className="w-full flex flex-col gap-6">
                    <div className="w-full flex flex-col sm:flex-row gap-5">

                        {/* Stat Card 1 */}
                        <div className="w-full bg-stone-50 dark:bg-slate-900/50 border border-stone-200 dark:border-slate-800 p-6 rounded-3xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                <span className="text-[10px] font-mono text-slate-400 uppercase">Trust & Safety</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">100%</p>
                            <p className="text-xs text-slate-500 mt-1">Manually Verified Profiles</p>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="w-full bg-stone-50 dark:bg-slate-900/50 border border-stone-200 dark:border-slate-800 p-6 rounded-3xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <Heart className="h-5 w-5 text-rose-500" />
                                <span className="text-[10px] font-mono text-slate-400 uppercase">Precision</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">AI-Driven</p>
                            <p className="text-xs text-slate-500 mt-1">Compatibility Scoring</p>
                        </div>
                    </div>

                    {/* Action Card */}
                    <Link href="/register" className="block">
                        <div className="group bg-rose-600 dark:bg-rose-600 p-8 rounded-4xl text-white flex justify-between items-center transition-all hover:scale-[1.02] cursor-pointer shadow-xl shadow-rose-600/20">
                            <div className="flex flex-col">
                                <p className="text-2xl font-bold">Join the Network</p>
                                <p className="text-sm opacity-90 mt-1 font-medium">Create your profile and let our matchmakers do the rest.</p>
                            </div>

                            <div className="bg-white/20 p-4 rounded-full group-hover:bg-white/30 transition-colors shrink-0 ml-4">
                                <ArrowUpRight className="h-6 w-6" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Subtle Copyright Line */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase z-10">
                <p>© {new Date().getFullYear()} The Date Crew (TDC)</p>
                <div className="flex gap-8">
                    <span className="hover:text-rose-500 cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-rose-500 cursor-pointer transition-colors">Terms</span>
                    <span className="hover:text-rose-500 cursor-pointer transition-colors">Developer Profile</span>
                </div>
            </div>
        </section>
    );
}