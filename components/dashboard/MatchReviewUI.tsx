"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
    User, Heart, Briefcase, MapPin, Check, X, 
    ShieldCheck, ShieldAlert, Phone, Mail, 
    MessageCircle, ArrowLeft, Loader2, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { respondToMatch } from "@/lib/services/respondToMatch.service";

interface MatchReviewProps {
    match: any;
    profile: any;
    myStatus: "Pending" | "Accepted" | "Declined";
    isConnected: boolean;
    message?: string;
}

export default function MatchReviewUI({ match, profile, myStatus, isConnected, message }: MatchReviewProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState<"Accepted" | "Declined" | null>(null);

    const dobDate = profile?.dob ? new Date(profile.dob) : null;
    const age = dobDate && !isNaN(dobDate.getTime()) 
        ? Math.abs(new Date(Date.now() - dobDate.getTime()).getUTCFullYear() - 1970)
        : "N/A";

    const handleResponse = async (response: "Accepted" | "Declined") => {
        setSubmitting(response);
        
        const promise = respondToMatch(match._id, response).then((res) => {
            if (!res.success) throw new Error(res.error);
            return res;
        });

        toast.promise(promise, {
            loading: `${response === "Accepted" ? "Accepting" : "Declining"} this match...`,
            success: `You have ${response.toLowerCase()} this match.`,
            error: (err) => err.message || "Failed to update match status."
        });

        promise
            .then(() => {
                router.refresh();
            })
            .catch((err) => {
                console.error("Match response error:", err.message);
            })
            .finally(() => {
                setSubmitting(null);
            });
    };

    const DataPoint = ({ label, value }: { label: string, value: any }) => (
        <div className="min-h-[45px] flex flex-col justify-center">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
            <span className="block font-medium text-slate-900 dark:text-slate-100">{value || "N/A"}</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Notifications
                </button>
                
                {isConnected && (
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Mutual Connection Established</span>
                    </div>
                )}
            </div>

            {/* AI Matchmaker Note */}
            {message && (
                <div className="bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageCircle className="w-24 h-24 text-rose-500 -rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                <Sparkles className="w-4 h-4 text-rose-600" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em]">Note from your Matchmaker</span>
                        </div>
                        <p className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic italic-serif">
                            "{message}"
                        </p>
                    </div>
                </div>
            )}

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-stone-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 border-2 border-rose-100 dark:border-rose-900 shadow-sm shrink-0 overflow-hidden">
                        {profile.profilePhoto ? (
                            <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-16 h-16" />
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> {age} years</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {profile.city}, {profile.country}</span>
                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-rose-500" /> {profile.designation || "Professional"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Background Details */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-stone-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        Background & Lifestyle
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <DataPoint label="Religion" value={profile.religion} />
                        <DataPoint label="Caste" value={profile.caste} />
                        <DataPoint label="Marital Status" value={profile.maritalStatus} />
                        <DataPoint label="Languages" value={profile.languages?.join(", ")} />
                        <DataPoint label="Want Kids?" value={profile.wantKids} />
                        <DataPoint label="Siblings" value={profile.siblings} />
                    </div>
                </div>

                {/* Career Details */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-stone-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-rose-500" />
                        Career & Education
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <DataPoint label="Designation" value={profile.designation} />
                        <DataPoint label="Company" value={profile.company} />
                        <DataPoint label="Education" value={`${profile.degree} from ${profile.college}`} />
                        <DataPoint label="Income" value={`${profile.income_lpa} LPA`} />
                    </div>
                </div>
            </div>

            {/* Contact Details (Conditional) */}
            <div className={`rounded-3xl p-8 border transition-all duration-500 ${
                isConnected 
                ? 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 shadow-sm' 
                : 'bg-stone-50 dark:bg-slate-950/50 border-stone-100 dark:border-slate-800 grayscale'
            }`}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${isConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
                    Contact Information
                </h3>
                
                {isConnected ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</span>
                                <a href={`tel:${profile.phone}`} className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                                    {profile.phone}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</span>
                                <a href={`mailto:${profile.email}`} className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                                    {profile.email}
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Contact information is hidden for privacy. It will be revealed once both parties accept the proposal.
                        </p>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            {!isConnected && myStatus === "Pending" && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sticky bottom-8">
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-slate-900 dark:text-white">Interested in this match?</h4>
                        <p className="text-xs text-slate-500">Your choice is private until both parties express interest.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={() => handleResponse("Declined")}
                            disabled={!!submitting}
                            className="flex-1 md:flex-none px-8 py-3 rounded-2xl border border-stone-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            {submitting === "Declined" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            Decline
                        </button>
                        <button
                            onClick={() => handleResponse("Accepted")}
                            disabled={!!submitting}
                            className="flex-1 md:flex-none px-12 py-3 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {submitting === "Accepted" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            I'm Interested
                        </button>
                    </div>
                </div>
            )}

            {myStatus !== "Pending" && !isConnected && (
                <div className={`p-6 rounded-3xl border text-center ${
                    myStatus === "Accepted" 
                    ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-stone-50 dark:bg-slate-950 border-stone-200 dark:border-slate-800 text-slate-500'
                }`}>
                    <p className="font-bold">
                        {myStatus === "Accepted" 
                            ? "Waiting for the other party to respond..." 
                            : "You have declined this match."}
                    </p>
                </div>
            )}
        </div>
    );
}
