import Link from "next/link";
import { HeartCrack } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">

            {/* Decorative Icon Background */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-rose-200 dark:bg-rose-900/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative p-6 bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-800 rounded-full shadow-sm">
                    <HeartCrack className="w-16 h-16 text-rose-500 dark:text-rose-400" />
                </div>
            </div>

            {/* Typography */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Page Not Found
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-10">
                We couldn't find the profile or page you're looking for. It might have been moved or doesn't exist.
            </p>

            {/* Call to Action */}
            <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
                Return to Dashboard
            </Link>

        </div>
    );
}