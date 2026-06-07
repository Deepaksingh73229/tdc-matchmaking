"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
    User,
    ShieldCheck,
    ShieldAlert,
    Save,
    X,
    Heart,
    Briefcase,
    MapPin,
    Pencil,
    Camera,
    BookOpen,
    Target,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Helper components ────────────────────────────────────────────────────────

const InputField = ({ value, onChange, type = "text", placeholder = "", disabled = false }: any) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200/80 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:opacity-50 shadow-inner"
    />
);

const TextareaField = ({ value, onChange, placeholder = "", rows = 4 }: any) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200/80 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all resize-none leading-relaxed shadow-inner"
    />
);

const SelectField = ({ value, onChange, children }: any) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200/80 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner appearance-none cursor-pointer"
    >
        {children}
    </select>
);

const DataPoint = ({ label, value, editingField }: { label: string; value?: any; editingField?: React.ReactNode }) => (
    <div className="min-h-[50px] flex flex-col justify-center">
        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{label}</span>
        {editingField ? (
            editingField
        ) : (
            <span className="block font-medium text-slate-900 dark:text-slate-100">{value || "N/A"}</span>
        )}
    </div>
);

// ─── Tag pills (for displaying array values in view mode) ─────────────────────

function TagPills({ items }: { items: string[] | undefined | null }) {
    if (!items || items.length === 0)
        return <span className="text-sm text-slate-400 dark:text-slate-500 italic">Any</span>;
    return (
        <div className="flex flex-wrap gap-2 mt-1">
            {items.map((t) => (
                <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20 shadow-sm"
                >
                    {t}
                </span>
            ))}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ClientPortalUI({ client }: { client: any }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editingSection, setEditingSection] = useState<
        "header" | "background" | "career" | "location" | "narrative" | "preferences" | null
    >(null);

    const prefs = client.preferences || {};

    const [formData, setFormData] = useState({
        // Identity
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        email: client.email || "",
        gender: client.gender || "Other",
        profilePhoto: client.profilePhoto || "",

        // Location & Contact
        city: client.city || "",
        country: client.country || "",
        phone: client.phone || "",

        // Physical
        height_cm: client.height_cm || "",

        // Career
        college: client.college || "",
        degree: client.degree || "",
        income_lpa: client.income_lpa || "",
        company: client.company || "",
        designation: client.designation || "",

        // Background
        religion: client.religion || "",
        caste: client.caste || "",
        maritalStatus: client.maritalStatus || "Never Married",
        languages: client.languages?.join(", ") || "",
        siblings: client.siblings ?? 0,
        wantKids: client.wantKids || "Maybe",
        openToRelocate: client.openToRelocate || "Maybe",
        openToPets: client.openToPets || "Maybe",

        // Narrative
        aboutMe: client.aboutMe || "",
        hobbies: client.hobbies || "",
        partnerExpectations: client.partnerExpectations || "",

        // Preferences
        pref_preferredGender: prefs.preferredGender || "Any",
        pref_minAge: prefs.minAge ?? 18,
        pref_maxAge: prefs.maxAge ?? 60,
        pref_minHeight_cm: prefs.minHeight_cm ?? 140,
        pref_maxHeight_cm: prefs.maxHeight_cm ?? 220,
        pref_minIncome_lpa: prefs.minIncome_lpa ?? 0,
        pref_preferredReligions: prefs.preferredReligions?.join(", ") || "",
        pref_preferredCastes: prefs.preferredCastes?.join(", ") || "",
        pref_preferredCities: prefs.preferredCities?.join(", ") || "",
        pref_preferredMaritalStatuses: prefs.preferredMaritalStatuses?.join(", ") || "",
        pref_wantKids: prefs.wantKids || "Any",
        pref_openToRelocate: prefs.openToRelocate || "Any",
    });

    const age = client.dob
        ? Math.abs(new Date(Date.now() - new Date(client.dob).getTime()).getUTCFullYear() - 1970)
        : null;

    // ─── Save handler ─────────────────────────────────────────────────────────

    const handleSaveSection = async () => {
        const savePromise = new Promise(async (resolve, reject) => {
            const splitArray = (s: string) =>
                s.split(",").map((l) => l.trim()).filter((l) => l !== "");

            const processedData: Record<string, any> = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                city: formData.city,
                country: formData.country,
                phone: formData.phone,
                height_cm: Number(formData.height_cm),
                college: formData.college,
                degree: formData.degree,
                income_lpa: Number(formData.income_lpa),
                company: formData.company,
                designation: formData.designation,
                religion: formData.religion,
                caste: formData.caste,
                maritalStatus: formData.maritalStatus,
                languages: splitArray(formData.languages),
                siblings: Number(formData.siblings),
                wantKids: formData.wantKids,
                openToRelocate: formData.openToRelocate,
                openToPets: formData.openToPets,
                aboutMe: formData.aboutMe,
                hobbies: formData.hobbies,
                partnerExpectations: formData.partnerExpectations,
                preferences: {
                    preferredGender: formData.pref_preferredGender,
                    minAge: Number(formData.pref_minAge),
                    maxAge: Number(formData.pref_maxAge),
                    minHeight_cm: Number(formData.pref_minHeight_cm),
                    maxHeight_cm: Number(formData.pref_maxHeight_cm),
                    minIncome_lpa: Number(formData.pref_minIncome_lpa),
                    preferredReligions: splitArray(formData.pref_preferredReligions),
                    preferredCastes: splitArray(formData.pref_preferredCastes),
                    preferredCities: splitArray(formData.pref_preferredCities),
                    preferredMaritalStatuses: splitArray(formData.pref_preferredMaritalStatuses),
                    wantKids: formData.pref_wantKids,
                    openToRelocate: formData.pref_openToRelocate,
                },
            };

            try {
                const res = await fetch("/api/client/update", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(processedData),
                });

                if (res.ok) {
                    setEditingSection(null);
                    router.refresh();
                    resolve(true);
                } else {
                    reject(new Error("Failed to save"));
                }
            } catch (err) {
                reject(err);
            }
        });

        toast.promise(savePromise, {
            loading: "Updating your profile...",
            success: "Profile updated successfully!",
            error: "Failed to update profile.",
        });
    };

    // ─── Photo upload ─────────────────────────────────────────────────────────

    const handlePhotoUpload = () => fileInputRef.current?.click();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const uploadPromise = new Promise(async (resolve, reject) => {
            try {
                const res = await fetch("/api/client/upload-photo", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (res.ok) {
                    router.refresh();
                    resolve(true);
                } else {
                    const errorData = await res.json();
                    reject(new Error(errorData.message || "Failed to upload photo"));
                }
            } catch (err) {
                reject(err);
            }
        });

        toast.promise(uploadPromise, {
            loading: "Uploading profile photo...",
            success: "Photo updated successfully!",
            error: "Failed to upload photo.",
        });
    };

    // ─── Section wrapper ──────────────────────────────────────────────────────

    const Section = ({
        title,
        icon: Icon,
        sectionKey,
        fullWidth = false,
        borderClass,
        children,
    }: any) => (
        <motion.div
            layout
            className={`mb-8 bg-white dark:bg-slate-900 rounded-[2rem] p-8 border ${borderClass || "border-stone-200/60 dark:border-slate-800"
                } shadow-xl shadow-stone-200/40 dark:shadow-none relative group overflow-hidden`}
        >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-slate-800/60 relative z-10">
                <h3 className="flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                        <Icon className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                    </div>
                    {title}
                </h3>
                {editingSection === sectionKey ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditingSection(null)}
                            className="p-2 text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSaveSection}
                            className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditingSection(sectionKey)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-rose-600 rounded-lg transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={editingSection === sectionKey ? "edit" : "view"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`grid ${fullWidth ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-y-6 gap-x-8 text-sm relative z-10`}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {editingSection === sectionKey && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 flex justify-end gap-3 pt-5 border-t border-stone-100 dark:border-slate-800/60 relative z-10"
                    >
                        <button
                            onClick={() => setEditingSection(null)}
                            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveSection}
                            className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-md shadow-rose-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Update {title.split(" ")[0]}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-5xl mx-auto"
        >
            {/* ── Page Header ──────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Portal</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Manage your matchmaking journey and fine-tune your profile.
                    </p>
                </div>

                <div
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 border shadow-sm ${client.statusTag === "Searching"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                        }`}
                >
                    {client.statusTag === "Searching" ? (
                        <ShieldCheck className="w-4 h-4" />
                    ) : (
                        <ShieldAlert className="w-4 h-4" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {client.statusTag === "Searching" ? "Verified & Live" : "Pending Verification"}
                    </span>
                </div>
            </div>

            {/* ── Profile Header (Independent Editing) ─────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-stone-200/60 dark:border-slate-800 shadow-xl shadow-stone-200/40 dark:shadow-none relative group overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/10 dark:bg-rose-900/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    {/* Photo with Upload */}
                    <div className="relative group/photo">
                        <div className="w-32 h-32 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 border-4 border-white dark:border-slate-800 shadow-xl shrink-0 overflow-hidden transition-transform duration-500 group-hover/photo:scale-105">
                            {client.profilePhoto ? (
                                <img src={client.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-14 h-14" />
                            )}
                        </div>

                        <button
                            onClick={handlePhotoUpload}
                            className="absolute bottom-1 right-1 p-2.5 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-all hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900"
                            title="Upload Photo"
                        >
                            <Camera className="w-4 h-4" />
                        </button>

                        <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                    </div>

                    <div className="flex-1 text-center md:text-left w-full">
                        <AnimatePresence mode="wait">
                            {editingSection === "header" ? (
                                <motion.div
                                    key="header-edit"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4 max-w-2xl"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataPoint
                                            label="First Name"
                                            editingField={
                                                <InputField
                                                    value={formData.firstName}
                                                    onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })}
                                                />
                                            }
                                        />
                                        <DataPoint
                                            label="Last Name"
                                            editingField={
                                                <InputField
                                                    value={formData.lastName}
                                                    onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })}
                                                />
                                            }
                                        />
                                    </div>
                                    <DataPoint
                                        label="Email Address"
                                        editingField={<InputField value={formData.email} disabled placeholder="Email cannot be changed" />}
                                    />
                                    <div className="grid grid-cols-3 gap-4">
                                        <DataPoint label="Age (yrs)" value={age ?? "?"} />
                                        <DataPoint
                                            label="Height (cm)"
                                            editingField={
                                                <InputField
                                                    type="number"
                                                    value={formData.height_cm}
                                                    onChange={(e: any) => setFormData({ ...formData, height_cm: e.target.value })}
                                                />
                                            }
                                        />
                                        <DataPoint
                                            label="Gender"
                                            editingField={
                                                <SelectField
                                                    value={formData.gender}
                                                    onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
                                                >
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </SelectField>
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100 dark:border-slate-800/60">
                                        <button
                                            onClick={() => setEditingSection(null)}
                                            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveSection}
                                            className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-md"
                                        >
                                            <Save className="w-4 h-4" /> Save Profile Info
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="header-view"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <div className="flex items-center justify-center md:justify-start gap-3 group/title mb-1">
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {client.firstName} {client.lastName}
                                        </h2>
                                        <button
                                            onClick={() => setEditingSection("header")}
                                            className="opacity-0 group-hover/title:opacity-100 p-1.5 text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-rose-600 rounded-lg transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-5">{client.email}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Age</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-lg">{age ?? "?"}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Height</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-lg">{client.height_cm} <span className="text-sm font-medium text-slate-500">cm</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-lg">{client.gender}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── About & Personality ──────────────────────────────────── */}
            <Section title="About & Personality" icon={BookOpen} sectionKey="narrative" fullWidth>
                {editingSection === "narrative" ? (
                    <>
                        <DataPoint
                            label="About Me"
                            editingField={
                                <TextareaField
                                    value={formData.aboutMe}
                                    onChange={(e: any) => setFormData({ ...formData, aboutMe: e.target.value })}
                                    placeholder="Tell potential matches about yourself..."
                                />
                            }
                        />
                        <DataPoint
                            label="Hobbies & Interests"
                            editingField={
                                <TextareaField
                                    value={formData.hobbies}
                                    onChange={(e: any) => setFormData({ ...formData, hobbies: e.target.value })}
                                    placeholder="What do you enjoy doing?"
                                />
                            }
                        />
                        <DataPoint
                            label="Partner Expectations"
                            editingField={
                                <TextareaField
                                    value={formData.partnerExpectations}
                                    onChange={(e: any) => setFormData({ ...formData, partnerExpectations: e.target.value })}
                                    placeholder="What are you looking for in a partner?"
                                />
                            }
                        />
                    </>
                ) : (
                    <>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                About Me
                            </span>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-stone-50/50 dark:bg-slate-950 p-4 rounded-xl border border-stone-100 dark:border-slate-800/60">
                                {client.aboutMe || "N/A"}
                            </p>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Hobbies & Interests
                            </span>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-stone-50/50 dark:bg-slate-950 p-4 rounded-xl border border-stone-100 dark:border-slate-800/60">
                                {client.hobbies || "N/A"}
                            </p>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Partner Expectations
                            </span>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-stone-50/50 dark:bg-slate-950 p-4 rounded-xl border border-stone-100 dark:border-slate-800/60">
                                {client.partnerExpectations || "N/A"}
                            </p>
                        </div>
                    </>
                )}
            </Section>

            {/* ── Background & Lifestyle ───────────────────────────────── */}
            <Section title="Background & Lifestyle" icon={Heart} sectionKey="background">
                <DataPoint
                    label="Religion"
                    value={client.religion}
                    editingField={
                        editingSection === "background" && (
                            <InputField
                                value={formData.religion}
                                onChange={(e: any) => setFormData({ ...formData, religion: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Caste"
                    value={client.caste}
                    editingField={
                        editingSection === "background" && (
                            <InputField
                                value={formData.caste}
                                onChange={(e: any) => setFormData({ ...formData, caste: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Marital Status"
                    value={client.maritalStatus}
                    editingField={
                        editingSection === "background" && (
                            <SelectField
                                value={formData.maritalStatus}
                                onChange={(e: any) => setFormData({ ...formData, maritalStatus: e.target.value })}
                            >
                                <option>Never Married</option>
                                <option>Divorced</option>
                                <option>Widowed</option>
                                <option>Awaiting Divorce</option>
                            </SelectField>
                        )
                    }
                />
                <DataPoint
                    label="Languages"
                    value={client.languages?.join(", ")}
                    editingField={
                        editingSection === "background" && (
                            <InputField
                                value={formData.languages}
                                onChange={(e: any) => setFormData({ ...formData, languages: e.target.value })}
                                placeholder="Hindi, English, Tamil..."
                            />
                        )
                    }
                />
                <DataPoint
                    label="Siblings"
                    value={client.siblings}
                    editingField={
                        editingSection === "background" && (
                            <InputField
                                type="number"
                                value={formData.siblings}
                                onChange={(e: any) => setFormData({ ...formData, siblings: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Want Kids?"
                    value={client.wantKids}
                    editingField={
                        editingSection === "background" && (
                            <SelectField
                                value={formData.wantKids}
                                onChange={(e: any) => setFormData({ ...formData, wantKids: e.target.value })}
                            >
                                <option>Yes</option>
                                <option>No</option>
                                <option>Maybe</option>
                            </SelectField>
                        )
                    }
                />
                <DataPoint
                    label="Open to Pets?"
                    value={client.openToPets}
                    editingField={
                        editingSection === "background" && (
                            <SelectField
                                value={formData.openToPets}
                                onChange={(e: any) => setFormData({ ...formData, openToPets: e.target.value })}
                            >
                                <option>Yes</option>
                                <option>No</option>
                                <option>Maybe</option>
                            </SelectField>
                        )
                    }
                />
                <DataPoint
                    label="Open to Relocate?"
                    value={client.openToRelocate}
                    editingField={
                        editingSection === "background" && (
                            <SelectField
                                value={formData.openToRelocate}
                                onChange={(e: any) => setFormData({ ...formData, openToRelocate: e.target.value })}
                            >
                                <option>Yes</option>
                                <option>No</option>
                                <option>Maybe</option>
                            </SelectField>
                        )
                    }
                />
            </Section>

            {/* ── Career & Education ───────────────────────────────────── */}
            <Section title="Career & Education" icon={Briefcase} sectionKey="career">
                <DataPoint
                    label="Income"
                    value={client.income_lpa != null ? `₹${client.income_lpa} LPA` : null}
                    editingField={
                        editingSection === "career" && (
                            <InputField
                                type="number"
                                value={formData.income_lpa}
                                onChange={(e: any) => setFormData({ ...formData, income_lpa: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Company"
                    value={client.company}
                    editingField={
                        editingSection === "career" && (
                            <InputField
                                value={formData.company}
                                onChange={(e: any) => setFormData({ ...formData, company: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Designation"
                    value={client.designation}
                    editingField={
                        editingSection === "career" && (
                            <InputField
                                value={formData.designation}
                                onChange={(e: any) => setFormData({ ...formData, designation: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Degree"
                    value={client.degree}
                    editingField={
                        editingSection === "career" && (
                            <InputField
                                value={formData.degree}
                                onChange={(e: any) => setFormData({ ...formData, degree: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="College"
                    value={client.college}
                    editingField={
                        editingSection === "career" && (
                            <InputField
                                value={formData.college}
                                onChange={(e: any) => setFormData({ ...formData, college: e.target.value })}
                            />
                        )
                    }
                />
            </Section>

            {/* ── Location & Contact ───────────────────────────────────── */}
            <Section title="Location & Contact" icon={MapPin} sectionKey="location">
                <DataPoint
                    label="City"
                    value={client.city}
                    editingField={
                        editingSection === "location" && (
                            <InputField
                                value={formData.city}
                                onChange={(e: any) => setFormData({ ...formData, city: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Country"
                    value={client.country}
                    editingField={
                        editingSection === "location" && (
                            <InputField
                                value={formData.country}
                                onChange={(e: any) => setFormData({ ...formData, country: e.target.value })}
                            />
                        )
                    }
                />
                <DataPoint
                    label="Phone"
                    value={client.phone}
                    editingField={
                        editingSection === "location" && (
                            <InputField
                                value={formData.phone}
                                onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        )
                    }
                />
            </Section>

            {/* ── Partner Preferences ──────────────────────────────────── */}
            <Section
                title="Partner Preferences"
                icon={Target}
                sectionKey="preferences"
                borderClass="border-rose-200/60 dark:border-rose-900/40"
            >
                {editingSection === "preferences" ? (
                    <>
                        <DataPoint
                            label="Preferred Gender"
                            editingField={
                                <SelectField
                                    value={formData.pref_preferredGender}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, pref_preferredGender: e.target.value })
                                    }
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                    <option>Any</option>
                                </SelectField>
                            }
                        />

                        <DataPoint
                            label="Min Income (LPA)"
                            editingField={
                                <InputField
                                    type="number"
                                    value={formData.pref_minIncome_lpa}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, pref_minIncome_lpa: e.target.value })
                                    }
                                />
                            }
                        />

                        <div className="md:col-span-2">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Age Range
                            </span>
                            <div className="flex items-center gap-3">
                                <InputField
                                    type="number"
                                    value={formData.pref_minAge}
                                    onChange={(e: any) => setFormData({ ...formData, pref_minAge: e.target.value })}
                                />
                                <span className="text-sm text-slate-400 font-medium shrink-0">to</span>
                                <InputField
                                    type="number"
                                    value={formData.pref_maxAge}
                                    onChange={(e: any) => setFormData({ ...formData, pref_maxAge: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Height Range (cm)
                            </span>
                            <div className="flex items-center gap-3">
                                <InputField
                                    type="number"
                                    value={formData.pref_minHeight_cm}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, pref_minHeight_cm: e.target.value })
                                    }
                                />
                                <span className="text-sm text-slate-400 font-medium shrink-0">to</span>
                                <InputField
                                    type="number"
                                    value={formData.pref_maxHeight_cm}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, pref_maxHeight_cm: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <DataPoint
                            label="Want Kids?"
                            editingField={
                                <SelectField
                                    value={formData.pref_wantKids}
                                    onChange={(e: any) => setFormData({ ...formData, pref_wantKids: e.target.value })}
                                >
                                    <option>Yes</option>
                                    <option>No</option>
                                    <option>Maybe</option>
                                    <option>Any</option>
                                </SelectField>
                            }
                        />

                        <DataPoint
                            label="Open to Relocate?"
                            editingField={
                                <SelectField
                                    value={formData.pref_openToRelocate}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, pref_openToRelocate: e.target.value })
                                    }
                                >
                                    <option>Yes</option>
                                    <option>No</option>
                                    <option>Maybe</option>
                                    <option>Any</option>
                                </SelectField>
                            }
                        />

                        <div className="md:col-span-2">
                            <DataPoint
                                label="Preferred Religions (comma-separated, leave empty for Any)"
                                editingField={
                                    <InputField
                                        value={formData.pref_preferredReligions}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, pref_preferredReligions: e.target.value })
                                        }
                                        placeholder="Hindu, Sikh, Christian..."
                                    />
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <DataPoint
                                label="Preferred Castes (comma-separated, leave empty for Any)"
                                editingField={
                                    <InputField
                                        value={formData.pref_preferredCastes}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, pref_preferredCastes: e.target.value })
                                        }
                                        placeholder="Arora, Khatri..."
                                    />
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <DataPoint
                                label="Preferred Cities (comma-separated, leave empty for Any)"
                                editingField={
                                    <InputField
                                        value={formData.pref_preferredCities}
                                        onChange={(e: any) =>
                                            setFormData({ ...formData, pref_preferredCities: e.target.value })
                                        }
                                        placeholder="Mumbai, Delhi, Bangalore..."
                                    />
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <DataPoint
                                label="Preferred Marital Statuses (comma-separated, leave empty for Any)"
                                editingField={
                                    <InputField
                                        value={formData.pref_preferredMaritalStatuses}
                                        onChange={(e: any) =>
                                            setFormData({
                                                ...formData,
                                                pref_preferredMaritalStatuses: e.target.value,
                                            })
                                        }
                                        placeholder="Never Married, Divorced..."
                                    />
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <DataPoint label="Preferred Gender" value={prefs.preferredGender || "Any"} />
                        <DataPoint
                            label="Age Range"
                            value={
                                prefs.minAge != null && prefs.maxAge != null
                                    ? `${prefs.minAge} – ${prefs.maxAge}`
                                    : "Any"
                            }
                        />
                        <DataPoint
                            label="Height Range"
                            value={
                                prefs.minHeight_cm != null && prefs.maxHeight_cm != null
                                    ? `${prefs.minHeight_cm} – ${prefs.maxHeight_cm} cm`
                                    : "Any"
                            }
                        />
                        <DataPoint
                            label="Min Income"
                            value={prefs.minIncome_lpa != null ? `₹${prefs.minIncome_lpa} LPA` : "Any"}
                        />
                        <DataPoint label="Want Kids?" value={prefs.wantKids || "Any"} />
                        <DataPoint label="Open to Relocate?" value={prefs.openToRelocate || "Any"} />

                        <div className="md:col-span-2 space-y-4 pt-4 mt-2 border-t border-stone-100 dark:border-slate-800/60">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Preferred Religions
                                </span>
                                <TagPills items={prefs.preferredReligions} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Preferred Castes
                                </span>
                                <TagPills items={prefs.preferredCastes} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Preferred Cities
                                </span>
                                <TagPills items={prefs.preferredCities} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Preferred Marital Statuses
                                </span>
                                <TagPills items={prefs.preferredMaritalStatuses} />
                            </div>
                        </div>
                    </>
                )}
            </Section>
        </motion.div>
    );
}