import { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useClientProfileEdit(client: any) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editingSection, setEditingSection] = useState<string | null>(null);

    const prefs = client.preferences || {};

    const [formData, setFormData] = useState({
        // Identity
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        email: client.email || "",
        gender: client.gender || "Other",
        profilePhoto: client.profilePhoto || "",
        dob: client.dob ? new Date(client.dob).toISOString().split("T")[0] : "",

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

    const handleSaveSection = async () => {
        const savePromise = new Promise(async (resolve, reject) => {
            const splitArray = (s: string) =>
                s.split(",").map((l) => l.trim()).filter((l) => l !== "");

            const processedData: Record<string, any> = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                dob: formData.dob,
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

    return {
        formData,
        setFormData,
        editingSection,
        setEditingSection,
        handleSaveSection,
        fileInputRef,
        handlePhotoUpload,
        onFileChange,
    };
}
