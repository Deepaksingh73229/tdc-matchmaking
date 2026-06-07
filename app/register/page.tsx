"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HeartHandshake, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Account created successfully! Please log in.");
                router.push("/login");
            } else {
                toast.error(data.message || "Registration failed.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] pt-14 flex items-center justify-center relative overflow-hidden animate-fade-in">
            {/* Decorative Blobs */}
            <div className="absolute top-0 left-[-10%] w-96 h-96 bg-rose-200 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70"></div>

            <div className="relative w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-stone-200 dark:border-slate-800 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl mb-4">
                        <HeartHandshake className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                        Join TDC to find your perfect match.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-md disabled:opacity-70 mt-4"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-rose-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}