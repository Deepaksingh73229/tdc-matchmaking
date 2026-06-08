"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Bell, User, Settings, ShieldCheck, ShieldAlert, Save, X, Camera, Loader2, MapPin, Heart, Coins, Baby } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ClientHubUI({ client, initialNotifications }: { client: any, initialNotifications: any[] }) {
    const router = useRouter();
    const { data: session, update } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notifications, setNotifications] = useState(initialNotifications);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        city: client.city || "",
        income_lpa: client.income_lpa || "",
        religion: client.religion || "",
        wantKids: client.wantKids || "Maybe",
        openToRelocate: client.openToRelocate || "Maybe",
        profilePhoto: client.profilePhoto || "",
    });

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        const uploadPromise = fetch("/api/client/upload-photo", {
            method: "POST",
            body: uploadData,
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to upload");

            setFormData((prev) => ({ ...prev, profilePhoto: data.photoUrl }));
            
            // Instantly sync next-auth session to update Sidebar Avatar
            await update({
                ...session,
                user: {
                    ...session?.user,
                    image: data.photoUrl
                }
            });

            router.refresh();
            return data;
        });

        toast.promise(uploadPromise, {
            loading: "Uploading to secure server...",
            success: "Profile picture updated successfully!",
            error: (err: any) => err.message
        });

        setIsUploading(false);
    };

    const saveToDatabase = async (dataToSave: any) => {
        const res = await fetch("/api/client/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSave),
        });

        if (res.ok) {
            router.refresh();
            return true;
        }
        throw new Error("Failed to save");
    };

    const handleSavePreferences = async () => {
        const savePromise = saveToDatabase(formData).then(() => {
            setIsEditing(false);
        });

        toast.promise(savePromise, {
            loading: "Saving your preferences...",
            success: "Preferences updated successfully!",
            error: "Failed to update preferences."
        });
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        toast.info("Notification dismissed");
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-6xl mx-auto"
        >
            {/* ─── Premium Header ─── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-stone-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-stone-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/10 dark:bg-rose-900/20 blur-[60px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Welcome back, <span className="text-rose-600 dark:text-rose-500">{client.firstName}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
                        Manage your matchmaking journey, update your preferences, and view the latest proposals curated by your personal matchmaker.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ─── Profile Settings Column ─── */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none relative overflow-hidden">
                        
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 flex items-center justify-center p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-100 dark:border-slate-700 shadow-sm">
                            {["Searching", "Proposed", "Matched"].includes(client.statusTag) ? (
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <ShieldAlert className="w-5 h-5 text-amber-500" />
                            )}
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center mb-8 mt-2">
                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                className={`relative w-28 h-28 group rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer hover:border-rose-100 dark:hover:border-rose-900 transition-colors'}`}
                            >
                                {formData.profilePhoto ? (
                                    <img
                                        src={formData.profilePhoto}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Hover & Loading Overlay */}
                                <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white" />
                                    )}
                                </div>

                                <input
                                    type="file"
                                    accept="image/jpeg, image/png, image/webp"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    disabled={isUploading}
                                />
                            </div>
                            <h2 className="text-xl font-bold mt-4 text-slate-900 dark:text-white">Your Profile</h2>
                            <p className={`text-xs font-semibold mt-1 px-3 py-1 rounded-full ${["Searching", "Proposed", "Matched"].includes(client.statusTag) ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
                                {["Searching", "Proposed", "Matched"].includes(client.statusTag) ? "Verified & Live" : "Pending Verification"}
                            </p>
                        </div>

                        {/* Smooth Transition for Edit/View State */}
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div 
                                    key="edit"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Religion</label>
                                        <div className="relative">
                                            <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="text" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 focus:bg-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Income (LPA)</label>
                                        <div className="relative">
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="number" value={formData.income_lpa} onChange={e => setFormData({ ...formData, income_lpa: e.target.value })} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 focus:bg-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Want Kids?</label>
                                        <div className="relative">
                                            <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select value={formData.wantKids} onChange={e => setFormData({ ...formData, wantKids: e.target.value })} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 focus:bg-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none cursor-pointer">
                                                <option>Yes</option><option>No</option><option>Maybe</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-stone-200 transition-colors">
                                            <X className="w-4 h-4" /> Cancel
                                        </button>
                                        <button onClick={handleSavePreferences} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20">
                                            <Save className="w-4 h-4" /> Save
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="view"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-slate-950/50 border border-stone-100 dark:border-slate-800/50">
                                            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> City</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{client.city || "Not set"}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-slate-950/50 border border-stone-100 dark:border-slate-800/50">
                                            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Heart className="w-4 h-4" /> Religion</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{client.religion || "Not set"}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-slate-950/50 border border-stone-100 dark:border-slate-800/50">
                                            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Coins className="w-4 h-4" /> Income</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{client.income_lpa ? `${client.income_lpa} LPA` : "Not set"}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 dark:bg-slate-950/50 border border-stone-100 dark:border-slate-800/50">
                                            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Baby className="w-4 h-4" /> Want Kids</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{client.wantKids || "Maybe"}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-slate-900/10"
                                    >
                                        <Settings className="w-4 h-4" /> Edit Preferences
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ─── Right Column: Notifications Feed ─── */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none h-full relative overflow-hidden">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-400/5 dark:bg-amber-900/10 blur-[60px] rounded-full pointer-events-none"></div>
                        
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                <Bell className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                            </div>
                            Recent Activity
                        </h2>

                        {notifications.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center justify-center text-slate-500 bg-stone-50 dark:bg-slate-950/50 border border-dashed border-stone-200 dark:border-slate-800 rounded-3xl">
                                <Bell className="w-12 h-12 text-stone-300 dark:text-slate-700 mb-4" />
                                <p className="font-medium text-slate-600 dark:text-slate-400">All caught up!</p>
                                <p className="text-sm mt-1">We will notify you when your matchmaker finds a proposal.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10">
                                <AnimatePresence>
                                    {notifications.map((notif) => (
                                        <motion.div
                                            key={notif._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                                            className={`p-5 rounded-2xl border transition-all duration-300 ${notif.isRead
                                                    ? 'bg-stone-50 border-stone-100 dark:bg-slate-950 dark:border-slate-800/50'
                                                    : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-lg shadow-rose-100 dark:shadow-none cursor-pointer hover:-translate-y-1'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`text-base font-bold flex items-center gap-2 ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                    {notif.title}
                                                    {!notif.isRead && <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span></span>}
                                                </h4>
                                                <span className="text-xs font-medium text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-stone-100 dark:border-slate-700">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {notif.message}
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}