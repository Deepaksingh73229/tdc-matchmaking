"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Sparkles, HeartHandshake, CheckCircle2, ChevronLeft, Bot, Loader2, MapPin, Target, Zap, Wand2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { draftMatchProposal, proposeMatch, generateSingleAIMessage } from "@/lib/services/proposeMatch.service";

interface DraftProposalUIProps {
    clientA: any;
    clientB: any;
}

// Helper to compute age from dob
function computeAge(dob: string | undefined): number | string {
    if (!dob) return "Unknown";
    const age = Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
    return isNaN(age) ? "Unknown" : age;
}

export default function DraftProposalUI({ clientA, clientB }: DraftProposalUIProps) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draftData, setDraftData] = useState<any>(null);

    const [msgA, setMsgA] = useState("");
    const [msgB, setMsgB] = useState("");

    const [isAILoadingA, setIsAILoadingA] = useState(false);
    const [isAILoadingB, setIsAILoadingB] = useState(false);

    useEffect(() => {
        // Only fetch score and reasons (extremely fast now)
        draftMatchProposal(clientA._id, clientB._id)
            .then((res) => {
                if (res.success) {
                    setDraftData(res);
                } else {
                    toast.error(res.error || "Failed to generate proposal.");
                }
            })
            .catch(() => toast.error("Network error."))
            .finally(() => setIsLoading(false));
    }, [clientA._id, clientB._id]);

    const handleGenerateAI = async (targetClient: "A" | "B") => {
        if (!draftData) return;

        const setLoader = targetClient === "A" ? setIsAILoadingA : setIsAILoadingB;
        const setMsg = targetClient === "A" ? setMsgA : setMsgB;
        
        const targetName = targetClient === "A" ? clientA.firstName : clientB.firstName;
        const aboutName = targetClient === "A" ? clientB.firstName : clientA.firstName;
        const penalties = targetClient === "A" ? draftData.penalties1 : draftData.penalties2;

        setLoader(true);
        toast.info(`Generating AI intro for ${targetName}...`);

        try {
            const res = await generateSingleAIMessage(targetName, aboutName, draftData.reasons, penalties || []);
            if (res.success && res.message) {
                setMsg(res.message);
                toast.success(`Draft created for ${targetName}!`);
            } else {
                toast.error(res.error || "Failed to generate AI message.");
            }
        } catch (e: any) {
            toast.error(e.message || "An error occurred.");
        } finally {
            setLoader(false);
        }
    };

    const handlePropose = async () => {
        if (!msgA.trim() || !msgB.trim()) {
            toast.error("Please provide an introduction message for both clients.");
            return;
        }

        setIsSubmitting(true);
        const promise = proposeMatch(clientA._id, clientB._id, msgA, msgB).then((res) => {
            if (!res.success) throw new Error(res.error);
            return res;
        });

        toast.promise(promise, {
            loading: "Sending proposal to both clients...",
            success: "Match proposed successfully!",
            error: (err) => err.message || "Failed to propose match."
        });

        promise
            .then(() => router.push(`/dashboard/client/${clientA._id}`))
            .catch(() => setIsSubmitting(false));
    };

    // ─── Premium Loading State ───
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 relative">
                {/* Abstract Connection Animation */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-xl animate-pulse"></div>
                    <svg className="w-full h-full text-rose-300 dark:text-rose-500 animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6"/>
                        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.8"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Calculating Synergy...</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI Engine Analyzing Profiles</p>
                </div>
            </div>
        );
    }

    // ─── Error / Null State ───
    if (!draftData) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 text-center bg-white/90 dark:bg-[#111218]/90 backdrop-blur-xl rounded-[2rem] border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/30 dark:shadow-none max-w-2xl mx-auto mt-20 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-full h-full bg-rose-400/5 dark:bg-rose-500/5 blur-[80px] pointer-events-none rounded-[2rem]"></div>
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100 dark:border-rose-500/20">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">Unable to Draft Proposal</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
                    A proposal might already exist for this pair, or one of the clients is no longer in "Searching" status.
                </p>
                <button 
                    onClick={() => router.back()} 
                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-md hover:scale-105 transition-transform"
                >
                    Return to Profile
                </button>
            </motion.div>
        );
    }

    const ageA = computeAge(clientA.dob);
    const ageB = computeAge(clientB.dob);

    // ─── Loaded State ───
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="w-full space-y-8 pb-16"
        >
            {/* Header & Score */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 dark:bg-[#111218]/60 backdrop-blur-xl p-5 md:p-6 rounded-[2rem] border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/10 dark:shadow-none relative z-10">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => router.back()} 
                        className="p-3 bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 rounded-2xl hover:bg-stone-50 dark:hover:bg-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all shadow-sm group"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Propose Match</h1>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-medium">Review synergy insights and craft a personalized introduction.</p>
                    </div>
                </div>

                {/* Overall Score Badge */}
                <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-500/10 dark:to-emerald-900/10 px-6 py-4 rounded-[1.5rem] border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm shrink-0">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl shadow-inner text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700/60 dark:text-emerald-500/80 mb-0.5">Synergy Score</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">{draftData.score}% Match</p>
                    </div>
                </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-white/90 dark:bg-[#1A1B23]/90 backdrop-blur-xl rounded-[2rem] p-7 md:p-10 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/20 dark:shadow-none relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-6 relative z-10 tracking-tight">
                    <Sparkles className="w-5 h-5 text-emerald-500" strokeWidth={2} /> 
                    AI Synergy Engine
                </h3>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 relative z-10">
                    {draftData.reasons.length === 0 && <li className="text-sm text-slate-500 italic">No specific strong reasons identified by the engine.</li>}
                    {draftData.reasons.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50/80 dark:bg-black/20 border border-stone-200/50 dark:border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors hover:border-emerald-200 dark:hover:border-emerald-500/30">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" strokeWidth={2} />
                            <span className="text-[14px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{r}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Clients Comparison & Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                
                {/* ─── Client A Column ─── */}
                <div className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/20 dark:shadow-none flex flex-col overflow-hidden group/col">
                    
                    {/* Dossier Header */}
                    <div className="p-7 md:p-8 border-b border-stone-200/60 dark:border-white/5 bg-stone-50/50 dark:bg-white/[0.02] relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-400/10 dark:bg-rose-500/10 blur-[40px] rounded-full pointer-events-none transition-transform duration-700 group-hover/col:scale-110"></div>
                        
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/20 overflow-hidden border border-rose-200/50 dark:border-rose-500/20 shadow-sm shrink-0 flex items-center justify-center text-rose-500">
                                {clientA.profilePhoto ? (
                                    <img src={clientA.profilePhoto} alt="A" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8" strokeWidth={1.5} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 block mb-1">Dossier A</span>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-2.5 truncate">{clientA.firstName} <span className="font-light">{clientA.lastName}</span></h2>
                                <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-stone-100 dark:border-white/5"><MapPin className="w-3 h-3 text-rose-400" /> {clientA.city || "Unknown"}</span>
                                    <span className="bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-stone-100 dark:border-white/5">{ageA} yrs</span>
                                    <span className="bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-stone-100 dark:border-white/5">{clientA.gender}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Space */}
                    <div className="p-7 md:p-8 flex-1 flex flex-col relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <h3 className="font-semibold text-[14px] text-slate-700 dark:text-slate-300">
                                Message to {clientA.firstName}
                            </h3>
                            <button 
                                onClick={() => handleGenerateAI("A")}
                                disabled={isAILoadingA}
                                className="text-[12px] font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] w-fit"
                            >
                                {isAILoadingA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                Generate via AI
                            </button>
                        </div>
                        
                        <div className="flex-1 relative flex flex-col min-h-[280px]">
                            <textarea
                                value={msgA}
                                onChange={(e) => setMsgA(e.target.value)}
                                placeholder={`Hi ${clientA.firstName},\n\nI have reviewed your profile and found a wonderful connection I'd like you to consider...`}
                                className="w-full h-full flex-1 p-5 rounded-[1.5rem] border border-stone-200/80 dark:border-white/10 bg-stone-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-[#1A1B23] outline-none resize-none font-medium text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 transition-all focus:border-rose-400 focus:ring-[3px] focus:ring-rose-500/10 placeholder:text-slate-400/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none"
                            />
                            
                            {/* Generative Glass Overlay */}
                            <AnimatePresence>
                                {isAILoadingA && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/70 dark:bg-[#111218]/70 backdrop-blur-md rounded-[1.5rem] flex flex-col items-center justify-center z-20 border border-indigo-200/50 dark:border-indigo-500/20"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 animate-bounce shadow-lg shadow-indigo-500/20">
                                            <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-[13px] font-bold text-indigo-800 dark:text-indigo-300 tracking-wide uppercase">Generative Engine Writing...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ─── Client B Column ─── */}
                <div className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/20 dark:shadow-none flex flex-col overflow-hidden group/col">
                    
                    {/* Dossier Header */}
                    <div className="p-7 md:p-8 border-b border-stone-200/60 dark:border-white/5 bg-stone-50/50 dark:bg-white/[0.02] relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-400/10 dark:bg-rose-500/10 blur-[40px] rounded-full pointer-events-none transition-transform duration-700 group-hover/col:scale-110"></div>
                        
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-800/20 overflow-hidden border border-rose-200/50 dark:border-rose-500/20 shadow-sm shrink-0 flex items-center justify-center text-rose-500">
                                {clientB.profilePhoto ? (
                                    <img src={clientB.profilePhoto} alt="B" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8" strokeWidth={1.5} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 block mb-1">Dossier B</span>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-2.5 truncate">{clientB.firstName} <span className="font-light">{clientB.lastName}</span></h2>
                                <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-stone-100 dark:border-white/5"><MapPin className="w-3 h-3 text-rose-400" /> {clientB.city || "Unknown"}</span>
                                    <span className="bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-stone-100 dark:border-white/5">{ageB} yrs</span>
                                    <span className="bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-stone-100 dark:border-white/5">{clientB.gender}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Space */}
                    <div className="p-7 md:p-8 flex-1 flex flex-col relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <h3 className="font-semibold text-[14px] text-slate-700 dark:text-slate-300">
                                Message to {clientB.firstName}
                            </h3>
                            <button 
                                onClick={() => handleGenerateAI("B")}
                                disabled={isAILoadingB}
                                className="text-[12px] font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] w-fit"
                            >
                                {isAILoadingB ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                Generate via AI
                            </button>
                        </div>
                        
                        <div className="flex-1 relative flex flex-col min-h-[280px]">
                            <textarea
                                value={msgB}
                                onChange={(e) => setMsgB(e.target.value)}
                                placeholder={`Hi ${clientB.firstName},\n\nI have reviewed your profile and found a wonderful connection I'd like you to consider...`}
                                className="w-full h-full flex-1 p-5 rounded-[1.5rem] border border-stone-200/80 dark:border-white/10 bg-stone-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-[#1A1B23] outline-none resize-none font-medium text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 transition-all focus:border-rose-400 focus:ring-[3px] focus:ring-rose-500/10 placeholder:text-slate-400/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-none"
                            />
                            
                            {/* Generative Glass Overlay */}
                            <AnimatePresence>
                                {isAILoadingB && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/70 dark:bg-[#111218]/70 backdrop-blur-md rounded-[1.5rem] flex flex-col items-center justify-center z-20 border border-indigo-200/50 dark:border-indigo-500/20"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 animate-bounce shadow-lg shadow-indigo-500/20">
                                            <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-[13px] font-bold text-indigo-800 dark:text-indigo-300 tracking-wide uppercase">Generative Engine Writing...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>

            {/* Submit Action Area */}
            <div className="flex justify-end pt-8 md:pt-10">
                <motion.button
                    whileHover={{ scale: isSubmitting || !msgA.trim() || !msgB.trim() ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting || !msgA.trim() || !msgB.trim() ? 1 : 0.98 }}
                    onClick={handlePropose}
                    disabled={isSubmitting || !msgA.trim() || !msgB.trim()}
                    className="w-full sm:w-auto py-4 px-10 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-[1.5rem] font-bold text-[16px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-500/25 hover:shadow-2xl hover:shadow-rose-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none border border-rose-400/20"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" /> 
                    ) : (
                        <HeartHandshake className="w-5 h-5" /> 
                    )}
                    {isSubmitting ? "Locking in Proposal..." : "Confirm & Send Proposals"}
                </motion.button>
            </div>
        </motion.div>
    );
}