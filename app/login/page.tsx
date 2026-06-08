"use client";

import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";


function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [username, setUsername] = useState("admin"); // Pre-filled for the assignment reviewers
    const [password, setPassword] = useState("password123"); // Pre-filled
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                username,
                password,
                callbackUrl,
            });

            if (res?.error) {
                toast.error("Invalid username or password.");
                setIsLoading(false);
            }
            else {
                toast.success("Welcome back!");
                router.push(callbackUrl);
            }
        }
        catch (err) {
            toast.error("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] pt-14 flex items-center justify-center relative overflow-hidden transition-colors duration-300">

            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            {/* Glassmorphism Login Card */}
            <div className="relative w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-stone-200 dark:border-slate-800 rounded-3xl shadow-xl animate-slide-up">

                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col items-center group">
                        <Image
                            src="/logo100.png"
                            alt="TDC Logo"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />

                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            TDC Matchmaker
                        </h1>
                    </Link>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                        Sign in to manage your account or curate perfect matches.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            {/* Updated label to reflect dual-login */}
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email or Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder="client@mail.com or admin"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                {/* Added Registration Link for Clients */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Don't have a client account?{" "}
                        <Link href="/register" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline transition-all">
                            Sign up here
                        </Link>
                    </p>

                    <p className="mt-4 text-xs text-slate-400 dark:text-slate-600">
                        For reviewers: Admin credentials are pre-filled.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[85vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}