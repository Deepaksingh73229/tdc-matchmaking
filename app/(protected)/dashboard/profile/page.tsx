"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, Mail, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
            loading: "Updating your account...",
            success: "Profile updated successfully!",
            error: (err) => err.message
        });

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your profile information and security settings.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-800 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-800 p-6 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-rose-500" />
                        Change Password
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">
                        Leave blank if you don't want to change your password.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
