"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Sparkles, HeartHandshake, CheckCircle2, ChevronLeft, Bot, Loader2, MapPin, Target } from "lucide-react";
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Calculating Compatibility...</h2>
            </div>
        );
    }

    if (!draftData) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-stone-200/60 dark:border-slate-800 shadow-xl max-w-2xl mx-auto mt-10">
                <h2 className="text-xl font-bold text-rose-600 mb-2">Notice</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Could not draft proposal. A proposal might already exist or the clients are not in Searching status.</p>
                <button onClick={() => router.back()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium">Go Back</button>
            </div>
        );
    }

    const ageA = computeAge(clientA.dob);
    const ageB = computeAge(clientB.dob);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-16"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-full hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Propose Match</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-xl">Review the compatibility insights and write a personalized introduction for both clients.</p>
                    </div>
                </div>

                {/* Overall Score Badge */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-stone-200/60 dark:border-slate-800 shadow-sm">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Compatibility Score</p>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{draftData.score}% Match</p>
                    </div>
                </div>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-900/20 blur-[60px] rounded-full pointer-events-none"></div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 relative z-10">
                    <Sparkles className="w-5 h-5 text-emerald-500" /> System Reasoning
                </h3>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                    {draftData.reasons.length === 0 && <li className="text-sm text-slate-500 italic">No specific strong reasons identified.</li>}
                    {draftData.reasons.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-slate-950/50 border border-stone-100 dark:border-slate-800/50">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">{r}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Clients Comparison & Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* ─── Client A Column ─── */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-stone-100 dark:border-slate-800/60 bg-stone-50/50 dark:bg-slate-950/50 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/10 dark:bg-rose-900/20 blur-[40px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                                {clientA.profilePhoto ? (
                                    <img src={clientA.profilePhoto} alt="A" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-3 text-rose-500" />
                                )}
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">Client 1</span>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{clientA.firstName} {clientA.lastName}</h2>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {clientA.city || "Unknown Location"}</span>
                                    <span>•</span>
                                    <span>{ageA} yrs</span>
                                    <span>•</span>
                                    <span>{clientA.gender}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                Write message for {clientA.firstName}
                            </h3>
                            <button 
                                onClick={() => handleGenerateAI("A")}
                                disabled={isAILoadingA}
                                className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isAILoadingA ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                                Draft with AI
                            </button>
                        </div>
                        
                        <div className="flex-1 relative">
                            <textarea
                                value={msgA}
                                onChange={(e) => setMsgA(e.target.value)}
                                placeholder={`Hi ${clientA.firstName},\n\nI have a wonderful profile I'd like you to review...`}
                                className="w-full h-full min-h-[250px] p-4 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-900 outline-none resize-none font-medium text-sm leading-relaxed text-slate-900 dark:text-slate-100 transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-400"
                            />
                            {isAILoadingA && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center animate-pulse">
                                    <Sparkles className="w-6 h-6 text-indigo-500 mb-2 animate-bounce" />
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Generative AI writing...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Client B Column ─── */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-stone-100 dark:border-slate-800/60 bg-stone-50/50 dark:bg-slate-950/50 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/10 dark:bg-rose-900/20 blur-[40px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                                {clientB.profilePhoto ? (
                                    <img src={clientB.profilePhoto} alt="B" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-full h-full p-3 text-rose-500" />
                                )}
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">Client 2</span>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{clientB.firstName} {clientB.lastName}</h2>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {clientB.city || "Unknown Location"}</span>
                                    <span>•</span>
                                    <span>{ageB} yrs</span>
                                    <span>•</span>
                                    <span>{clientB.gender}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                Write message for {clientB.firstName}
                            </h3>
                            <button 
                                onClick={() => handleGenerateAI("B")}
                                disabled={isAILoadingB}
                                className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isAILoadingB ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                                Draft with AI
                            </button>
                        </div>
                        
                        <div className="flex-1 relative">
                            <textarea
                                value={msgB}
                                onChange={(e) => setMsgB(e.target.value)}
                                placeholder={`Hi ${clientB.firstName},\n\nI have a wonderful profile I'd like you to review...`}
                                className="w-full h-full min-h-[250px] p-4 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-900 outline-none resize-none font-medium text-sm leading-relaxed text-slate-900 dark:text-slate-100 transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-400"
                            />
                            {isAILoadingB && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center animate-pulse">
                                    <Sparkles className="w-6 h-6 text-indigo-500 mb-2 animate-bounce" />
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Generative AI writing...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex justify-end pt-6">
                <button
                    onClick={handlePropose}
                    disabled={isSubmitting || !msgA.trim() || !msgB.trim()}
                    className="py-4 px-10 bg-rose-600 hover:bg-rose-700 text-white rounded-[1.25rem] font-bold text-lg flex items-center gap-2 transition-all shadow-xl shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Proposing Match...</>
                    ) : (
                        <><HeartHandshake className="w-5 h-5" /> Confirm & Send Proposals</>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
