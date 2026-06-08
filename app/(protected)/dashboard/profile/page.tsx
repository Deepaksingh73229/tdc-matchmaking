"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import { User, Lock, Mail, Save, Loader2, ShieldCheck, Fingerprint } from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/admin/profile");
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        name: data.name || "",
                        username: data.username || ""
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSaving(true);
        
        const savePromise = async () => {
            const res = await fetch("/api/admin/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    password: formData.password || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
            
            // Update next-auth session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: formData.name
                }
            });

            return data;
        };

        toast.promise(savePromise(), {
            loading: "Updating security credentials...",
            success: "Profile securely updated!",
            error: (err) => err.message
        });

        setSaving(false);
    };

    // ─── Premium Loading State ───
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 relative">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-xl animate-pulse"></div>
                    <svg className="w-full h-full text-rose-300 dark:text-rose-500 animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Accessing Vault...</h2>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="max-w-3xl mx-auto space-y-8 relative pb-16"
        >
            {/* ── Cinematic Ambient Background ── */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

            {/* ── Header ── */}
            <div className="flex items-center gap-4 relative z-10 px-2">
                <div className="p-3 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 rounded-2xl border border-rose-200/50 dark:border-rose-500/10 shadow-sm shadow-rose-500/5">
                    <Fingerprint className="w-7 h-7 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Account & Security</h1>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">
                        Manage your master identity and secure your matchmaking credentials.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                
                {/* ── Primary Identity Vault ── */}
                <div className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-2xl rounded-[2rem] shadow-xl shadow-stone-200/20 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/60 dark:border-white/5 p-8 md:p-10 relative overflow-hidden group">
                    {/* Background Graphic */}
                    <svg className="absolute -bottom-16 -right-16 w-64 h-64 text-stone-100 dark:text-white/[0.02] transform transition-transform duration-1000 group-hover:rotate-12 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="40" opacity="0.4" />
                        <circle cx="50" cy="50" r="20" opacity="0.8" />
                    </svg>

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <User className="w-5 h-5 text-rose-500" strokeWidth={2} />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Primary Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                Full Name
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-rose-500 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 transition-all text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                Username / Email
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-rose-500 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 transition-all text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Security Credentials Vault ── */}
                <div className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-2xl rounded-[2rem] shadow-xl shadow-stone-200/20 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/60 dark:border-white/5 p-8 md:p-10 relative overflow-hidden group">
                    {/* Background Graphic */}
                    <svg className="absolute -top-16 -right-16 w-64 h-64 text-rose-50 dark:text-rose-900/10 transform transition-transform duration-1000 group-hover:-rotate-12 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" opacity="0.8" />
                    </svg>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-rose-500" strokeWidth={2} />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Access Credentials</h3>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-rose-100 dark:border-rose-500/20">
                            Leave blank to keep current
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                New Password
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-rose-500 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 transition-all text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                                Confirm New Password
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-rose-500 transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 dark:bg-[#0A0B0E]/50 border border-stone-200/80 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-[3px] focus:ring-rose-500/10 focus:border-rose-400 transition-all text-[15px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Mobile helper text */}
                    <p className="sm:hidden mt-4 text-[12px] text-slate-500 dark:text-slate-400 italic text-center">
                        Leave blank to keep your current password.
                    </p>
                </div>

                {/* ── Action Area ── */}
                <div className="flex justify-end pt-4">
                    <motion.button
                        type="submit"
                        disabled={saving}
                        whileHover={{ scale: saving ? 1 : 1.02 }}
                        whileTap={{ scale: saving ? 1 : 0.98 }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 bg-rose-600/80 dark:bg-rose-800/80 text-white text-[15px] font-bold rounded-[1.25rem] shadow-xl shadow-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/30 transition-all disabled:opacity-70 disabled:pointer-events-none border border-rose-400/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Encrypting Data..." : "Secure & Save Changes"}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}