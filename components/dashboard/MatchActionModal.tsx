"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { generateMatchEmail } from "@/lib/services/generateMatchEmail.service";
import { sendMatchSuggestion } from "@/lib/services/sendMatchSuggestion.service";
import { toast } from "sonner";

interface MatchActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    clientName: string;
    matchName: string;
    matchReasons: string[];
}

export default function MatchActionModal({ isOpen, onClose, clientId, clientName, matchName, matchReasons }: MatchActionModalProps) {
    const [emailText, setEmailText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // Generate the email when the modal opens
    useEffect(() => {
        if (isOpen && !emailText && !isSent) {
            setIsGenerating(true);
            generateMatchEmail(clientName, matchName, matchReasons).then((res: any) => {
                if (res.text) setEmailText(res.text);
                setIsGenerating(false);
            });
        }
    }, [isOpen, clientName, matchName, matchReasons, emailText, isSent]);

    // Reset state when closed
    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setIsSent(false);
            setEmailText("");
        }, 300);
    };

    const handleSend = async () => {
        setIsSending(true);
        const result = await sendMatchSuggestion(clientId, matchName, emailText);
        
        if (result.success) {
            setIsSent(true);
            toast.success("Match suggestion sent to client!");
            setTimeout(() => {
                handleClose();
            }, 2000);
        } else {
            toast.error(result.error || "Failed to send match.");
        }
        setIsSending(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-rose-500" />
                        AI Match Introduction
                    </h3>
                    <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {isSent ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Match Sent!</h4>
                            <p className="text-slate-500 dark:text-slate-400">
                                {clientName} has been notified about {matchName}.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Review and edit the AI-generated introduction for <strong>{clientName}</strong>.
                            </p>

                            <div className="relative">
                                {isGenerating ? (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-stone-200 dark:border-slate-700">
                                        <Loader2 className="w-6 h-6 text-rose-500 animate-spin mb-2" />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gemini is drafting...</span>
                                    </div>
                                ) : null}

                                <textarea
                                    value={emailText}
                                    onChange={(e) => setEmailText(e.target.value)}
                                    className="w-full h-40 p-4 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all leading-relaxed"
                                    placeholder="Drafting your personalized email..."
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={isGenerating || isSending || !emailText}
                                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isSending ? "Sending..." : "Send via Email"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}