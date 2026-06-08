"use client";

import {
    User,
    Heart,
    Briefcase,
    MapPin,
    BookOpen,
    Target,
    Info,
    Calendar,
    Camera,
    Pencil,
    X,
    Save
} from "lucide-react";
import StatusToggle from "../shared/StatusToggle";
import { motion, AnimatePresence } from "motion/react";
import { DataPoint } from "./client-profile/DataPoint";
import { Section } from "./client-profile/Section";
import { Prose } from "./client-profile/Prose";
import { TagPills } from "./client-profile/TagPills";
import { useClientProfileEdit } from "./client-profile/useClientProfileEdit";
import { InputField, TextareaField, SelectField } from "./client-profile/FormFields";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAge(dob: string | undefined): number | null {
    if (!dob) return null;

    return Math.abs(
        new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970
    );
}

function fmtDate(iso: string | undefined | null): string {
    if (!iso) return "N/A";

    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ClientProfile({ client, editable = false }: { client: any, editable?: boolean }) {
    const age = computeAge(client.dob);
    const prefs = client.preferences ?? {};

    const {
        formData,
        setFormData,
        editingSection,
        setEditingSection,
        handleSaveSection,
        fileInputRef,
        handlePhotoUpload,
        onFileChange,
    } = useClientProfileEdit(client);

    return (
        <div className={`space-y-6 md:space-y-8 mx-auto w-full ${editable ? "max-w-5xl" : "max-w-180"}`}>
            {editable && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Portal</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Manage your matchmaking journey and fine-tune your profile.
                        </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-1.5">
                        <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em]">Network Status</span>
                        <StatusToggle clientId={client._id} currentStatus={client.statusTag} disabled={true} />
                    </div>
                </div>
            )}

            {/* ── Header Card ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="bg-white/90 dark:bg-[#111218]/50 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-5 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/30 dark:shadow-none flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none rounded-[2.5rem] z-0">
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-400/10 dark:bg-rose-600/10 blur-[80px] rounded-full transition-transform duration-1000 group-hover:scale-110"></div>

                    <svg className="absolute -top-15 left-45 w-[120%] h-[120%] text-rose-200 dark:text-rose-900/50 animate-[spin_120s_linear_infinite]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    </svg>
                </div>

                <div className="relative w-36 h-36 md:w-40 md:h-40 shrink-0 z-10">
                    {client.profilePhoto ? (
                        <img
                            src={client.profilePhoto}
                            alt={`${client.firstName} ${client.lastName}`}
                            className="relative w-full h-full rounded-full object-cover border-4 border-white dark:border-[#111218] shadow-xl transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="relative w-full h-full bg-linear-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/10 rounded-full flex items-center justify-center text-rose-500 border-4 border-white dark:border-zinc-800 shadow-xl transition-transform duration-700 group-hover:scale-[1.03]">
                            <User className="w-14 h-14" strokeWidth={1.5} />
                        </div>
                    )}
                    {editable && (
                        <>
                            <button
                                onClick={handlePhotoUpload}
                                className="absolute bottom-1 right-1 p-2.5 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-all hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900"
                                title="Upload Photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                        </>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left z-10 w-full">
                    <AnimatePresence mode="wait">
                        {editingSection === "header" ? (
                            <motion.div
                                key="header-edit"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4 w-full"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <DataPoint
                                        label="First Name"
                                        editingField={<InputField value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} />}
                                    />
                                    <DataPoint
                                        label="Last Name"
                                        editingField={<InputField value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} />}
                                    />
                                </div>
                                <DataPoint
                                    label="Email Address"
                                    editingField={<InputField value={formData.email} disabled placeholder="Email cannot be changed" />}
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <DataPoint 
                                        label="Date of Birth" 
                                        editingField={<InputField type="date" value={formData.dob} onChange={(e: any) => setFormData({ ...formData, dob: e.target.value })} />}
                                    />
                                    <DataPoint
                                        label="Height (cm)"
                                        editingField={<InputField type="number" value={formData.height_cm} onChange={(e: any) => setFormData({ ...formData, height_cm: e.target.value })} />}
                                    />
                                    <DataPoint
                                        label="Gender"
                                        editingField={
                                            <SelectField value={formData.gender} onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </SelectField>
                                        }
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100 dark:border-slate-800/60">
                                    <button onClick={() => setEditingSection(null)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                    <button onClick={handleSaveSection} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 flex items-center gap-2 shadow-md"><Save className="w-4 h-4" /> Save</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="header-view"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex flex-col justify-center h-full relative group/title"
                            >
                                <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-3 justify-center md:justify-start">
                                    {client.firstName} <span className="font-light">{client.lastName}</span>
                                    {editable && (
                                        <button onClick={() => setEditingSection("header")} className="opacity-0 group-hover/title:opacity-100 p-1.5 text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-rose-600 rounded-lg transition-all">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    )}
                                </h2>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl border border-stone-200/80 dark:border-white/10 shadow-sm"><Calendar className="w-3.5 h-3.5 text-slate-400" />{age ?? "?"} yrs</span>
                                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl border border-stone-200/80 dark:border-white/10 shadow-sm"><User className="w-3.5 h-3.5 text-slate-400" />{client.height_cm ?? "?"} cm</span>
                                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl border border-stone-200/80 dark:border-white/10 shadow-sm"><Heart className="w-3.5 h-3.5 text-slate-400" />{client.gender ?? "N/A"}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!editable && (
                    <div className="z-10 flex flex-col items-center gap-1.5">
                        <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em]">Network Status</span>
                        <StatusToggle clientId={client._id} currentStatus={client.statusTag} />
                    </div>
                )}
            </motion.div>

            {/* ── About & Personality ────────────────────────────────── */}
            <Section title="About & Personality" icon={BookOpen} editable={editable} isEditing={editingSection === "narrative"} onEdit={() => setEditingSection("narrative")} onCancel={() => setEditingSection(null)} onSave={handleSaveSection}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5">
                    <Prose label="The Biodata" value={client.aboutMe} editingField={editingSection === "narrative" ? <TextareaField value={formData.aboutMe} onChange={(e: any) => setFormData({ ...formData, aboutMe: e.target.value })} /> : undefined} />
                    <Prose label="Hobbies & Passions" value={client.hobbies} editingField={editingSection === "narrative" ? <TextareaField value={formData.hobbies} onChange={(e: any) => setFormData({ ...formData, hobbies: e.target.value })} /> : undefined} />
                    <Prose label="What I'm Looking For" value={client.partnerExpectations} editingField={editingSection === "narrative" ? <TextareaField value={formData.partnerExpectations} onChange={(e: any) => setFormData({ ...formData, partnerExpectations: e.target.value })} /> : undefined} />
                </div>
            </Section>

            {/* ── Background & Lifestyle ─────────────────────────────── */}
            <Section title="Roots & Lifestyle" icon={Heart} editable={editable} isEditing={editingSection === "background"} onEdit={() => setEditingSection("background")} onCancel={() => setEditingSection(null)} onSave={handleSaveSection}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                    <DataPoint label="Religion" value={client.religion} editingField={editingSection === "background" ? <InputField value={formData.religion} onChange={(e: any) => setFormData({ ...formData, religion: e.target.value })} /> : undefined} />
                    <DataPoint label="Caste / Sect" value={client.caste} editingField={editingSection === "background" ? <InputField value={formData.caste} onChange={(e: any) => setFormData({ ...formData, caste: e.target.value })} /> : undefined} />
                    <DataPoint label="Marital Status" value={client.maritalStatus} editingField={editingSection === "background" ? <SelectField value={formData.maritalStatus} onChange={(e: any) => setFormData({ ...formData, maritalStatus: e.target.value })}><option>Never Married</option><option>Divorced</option><option>Widowed</option><option>Awaiting Divorce</option></SelectField> : undefined} />
                    <DataPoint label="Languages Spoken" value={client.languages?.join(", ")} editingField={editingSection === "background" ? <InputField value={formData.languages} onChange={(e: any) => setFormData({ ...formData, languages: e.target.value })} /> : undefined} />
                    <DataPoint label="Siblings" value={client.siblings} editingField={editingSection === "background" ? <InputField type="number" value={formData.siblings} onChange={(e: any) => setFormData({ ...formData, siblings: e.target.value })} /> : undefined} />
                    <DataPoint label="Desires Children?" value={client.wantKids} editingField={editingSection === "background" ? <SelectField value={formData.wantKids} onChange={(e: any) => setFormData({ ...formData, wantKids: e.target.value })}><option>Yes</option><option>No</option><option>Maybe</option></SelectField> : undefined} />
                    <DataPoint label="Pet Friendly?" value={client.openToPets} editingField={editingSection === "background" ? <SelectField value={formData.openToPets} onChange={(e: any) => setFormData({ ...formData, openToPets: e.target.value })}><option>Yes</option><option>No</option><option>Maybe</option></SelectField> : undefined} />
                    <DataPoint label="Open to Relocate?" value={client.openToRelocate} editingField={editingSection === "background" ? <SelectField value={formData.openToRelocate} onChange={(e: any) => setFormData({ ...formData, openToRelocate: e.target.value })}><option>Yes</option><option>No</option><option>Maybe</option></SelectField> : undefined} />
                </div>
            </Section>

            {/* ── Career & Education ─────────────────────────────────── */}
            <Section title="Career & Education" icon={Briefcase} editable={editable} isEditing={editingSection === "career"} onEdit={() => setEditingSection("career")} onCancel={() => setEditingSection(null)} onSave={handleSaveSection}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                    <DataPoint label="Annual Income" value={client.income_lpa != null ? `₹${client.income_lpa} LPA` : undefined} editingField={editingSection === "career" ? <InputField type="number" value={formData.income_lpa} onChange={(e: any) => setFormData({ ...formData, income_lpa: e.target.value })} /> : undefined} />
                    <DataPoint label="Organization" value={client.company} editingField={editingSection === "career" ? <InputField value={formData.company} onChange={(e: any) => setFormData({ ...formData, company: e.target.value })} /> : undefined} />
                    <DataPoint label="Designation" value={client.designation} editingField={editingSection === "career" ? <InputField value={formData.designation} onChange={(e: any) => setFormData({ ...formData, designation: e.target.value })} /> : undefined} />
                    <DataPoint label="Highest Degree" value={client.degree} editingField={editingSection === "career" ? <InputField value={formData.degree} onChange={(e: any) => setFormData({ ...formData, degree: e.target.value })} /> : undefined} />
                    <DataPoint label="University / College" value={client.college} editingField={editingSection === "career" ? <InputField value={formData.college} onChange={(e: any) => setFormData({ ...formData, college: e.target.value })} /> : undefined} />
                </div>
            </Section>

            {/* ── Location & Contact ─────────────────────────────────── */}
            <Section title="Location & Contact" icon={MapPin} editable={editable} isEditing={editingSection === "location"} onEdit={() => setEditingSection("location")} onCancel={() => setEditingSection(null)} onSave={handleSaveSection}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                    <DataPoint label="City of Residence" value={client.city} editingField={editingSection === "location" ? <InputField value={formData.city} onChange={(e: any) => setFormData({ ...formData, city: e.target.value })} /> : undefined} />
                    <DataPoint label="Country" value={client.country} editingField={editingSection === "location" ? <InputField value={formData.country} onChange={(e: any) => setFormData({ ...formData, country: e.target.value })} /> : undefined} />
                    <DataPoint label="Email Address" value={client.email} editingField={editingSection === "location" ? <InputField value={formData.email} disabled /> : undefined} />
                    <DataPoint label="Contact Number" value={client.phone} editingField={editingSection === "location" ? <InputField value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} /> : undefined} />
                </div>
            </Section>

            {/* ── Partner Preferences ────────────────────────────────── */}
            <Section title="The Ideal Match" icon={Target} editable={editable} isEditing={editingSection === "preferences"} onEdit={() => setEditingSection("preferences")} onCancel={() => setEditingSection(null)} onSave={handleSaveSection}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                    <DataPoint label="Gender" value={prefs.preferredGender} editingField={editingSection === "preferences" ? <SelectField value={formData.pref_preferredGender} onChange={(e: any) => setFormData({ ...formData, pref_preferredGender: e.target.value })}><option>Any</option><option>Male</option><option>Female</option></SelectField> : undefined} />
                    <DataPoint label="Age Bracket" value={prefs.minAge != null && prefs.maxAge != null ? `${prefs.minAge} – ${prefs.maxAge} yrs` : undefined} editingField={editingSection === "preferences" ? <div className="flex items-center gap-2"><InputField type="number" value={formData.pref_minAge} onChange={(e: any) => setFormData({ ...formData, pref_minAge: e.target.value })} /><span className="text-slate-400">-</span><InputField type="number" value={formData.pref_maxAge} onChange={(e: any) => setFormData({ ...formData, pref_maxAge: e.target.value })} /></div> : undefined} />
                    <DataPoint label="Height Bracket" value={prefs.minHeight_cm != null && prefs.maxHeight_cm != null ? `${prefs.minHeight_cm} – ${prefs.maxHeight_cm} cm` : undefined} editingField={editingSection === "preferences" ? <div className="flex items-center gap-2"><InputField type="number" value={formData.pref_minHeight_cm} onChange={(e: any) => setFormData({ ...formData, pref_minHeight_cm: e.target.value })} /><span className="text-slate-400">-</span><InputField type="number" value={formData.pref_maxHeight_cm} onChange={(e: any) => setFormData({ ...formData, pref_maxHeight_cm: e.target.value })} /></div> : undefined} />
                    <DataPoint label="Minimum Income" value={prefs.minIncome_lpa != null ? `₹${prefs.minIncome_lpa} LPA` : undefined} editingField={editingSection === "preferences" ? <InputField type="number" value={formData.pref_minIncome_lpa} onChange={(e: any) => setFormData({ ...formData, pref_minIncome_lpa: e.target.value })} /> : undefined} />
                    <DataPoint label="Desires Children?" value={prefs.wantKids} editingField={editingSection === "preferences" ? <SelectField value={formData.pref_wantKids} onChange={(e: any) => setFormData({ ...formData, pref_wantKids: e.target.value })}><option>Any</option><option>Yes</option><option>No</option><option>Maybe</option></SelectField> : undefined} />
                    <DataPoint label="Willing to Relocate?" value={prefs.openToRelocate} editingField={editingSection === "preferences" ? <SelectField value={formData.pref_openToRelocate} onChange={(e: any) => setFormData({ ...formData, pref_openToRelocate: e.target.value })}><option>Any</option><option>Yes</option><option>No</option><option>Maybe</option></SelectField> : undefined} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 pt-8 mt-4 border-t border-stone-200/60 dark:border-white/5">
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">Preferred Religions</span>
                        {editingSection === "preferences" ? <InputField value={formData.pref_preferredReligions} onChange={(e: any) => setFormData({ ...formData, pref_preferredReligions: e.target.value })} /> : <TagPills items={prefs.preferredReligions} />}
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">Preferred Castes</span>
                        {editingSection === "preferences" ? <InputField value={formData.pref_preferredCastes} onChange={(e: any) => setFormData({ ...formData, pref_preferredCastes: e.target.value })} /> : <TagPills items={prefs.preferredCastes} />}
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">Preferred Cities</span>
                        {editingSection === "preferences" ? <InputField value={formData.pref_preferredCities} onChange={(e: any) => setFormData({ ...formData, pref_preferredCities: e.target.value })} /> : <TagPills items={prefs.preferredCities} />}
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">Preferred Marital Status</span>
                        {editingSection === "preferences" ? <InputField value={formData.pref_preferredMaritalStatuses} onChange={(e: any) => setFormData({ ...formData, pref_preferredMaritalStatuses: e.target.value })} /> : <TagPills items={prefs.preferredMaritalStatuses} />}
                    </div>
                </div>
            </Section>

            {/* ── System Info ────────────────────────────────────────── */}
            <Section title="System Information" icon={Info}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8 opacity-80 hover:opacity-100 transition-opacity">
                    <DataPoint label="AI Embedding Date" value={fmtDate(client.embeddedAt)} />
                    <DataPoint label="Profile Created" value={fmtDate(client.createdAt)} />
                    <DataPoint label="Last Updated" value={fmtDate(client.updatedAt)} />
                </div>
            </Section>
        </div>
    );
}