import Link from "next/link";
import { User, Heart, MapPin, Briefcase, Phone, Mail } from "lucide-react";

interface ConnectedMatchPanelProps {
    matchedClient: any;
    currentClientName: string;
}

export default function ConnectedMatchPanel({ matchedClient, currentClientName }: ConnectedMatchPanelProps) {
    if (!matchedClient) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 text-rose-50 dark:text-rose-950/20 w-32 h-32 rotate-12">
                <Heart className="w-full h-full fill-current" />
            </div>

            <div className="flex items-center gap-2 mb-6 relative z-10">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Matched Profile</h2>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10">
                {currentClientName} is currently connected with {matchedClient.firstName}. Contact details are now unlocked.
            </p>

            <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-slate-950/50 hover:border-rose-200 transition-colors relative z-10">
                {/* ─── Header: Profile Info ─── */}
                <div className="flex justify-between items-start mb-4">
                    <Link href={`/dashboard/client/${matchedClient._id}`} className="flex items-center gap-3 group">
                        {/* Dynamic Profile Photo */}
                        <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-sm group-hover:border-rose-200 transition-all">
                            {matchedClient.profilePhoto ? (
                                <img
                                    src={matchedClient.profilePhoto}
                                    alt={matchedClient.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                        </div>

                        <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                                {matchedClient.firstName} {matchedClient.lastName}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium">
                                {matchedClient.gender}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* ─── Quick Details ─── */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{matchedClient.city || "Location unknown"}</span>
                    </div>
                    {matchedClient.designation && (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{matchedClient.designation} {matchedClient.company ? `at ${matchedClient.company}` : ""}</span>
                        </div>
                    )}
                </div>

                {/* ─── Contact Details ─── */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-stone-100 dark:border-slate-800 text-sm space-y-2 mt-4">
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">Unlocked Contact</h5>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <a href={`tel:${matchedClient.phone}`} className="hover:text-emerald-600 transition-colors">
                            {matchedClient.phone || "Not provided"}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <a href={`mailto:${matchedClient.email}`} className="hover:text-blue-600 transition-colors truncate">
                            {matchedClient.email || "Not provided"}
                        </a>
                    </div>
                </div>

                <Link
                    href={`/dashboard/client/${matchedClient._id}`}
                    className="mt-4 w-full py-2.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-sm"
                >
                    View Full Profile
                </Link>
            </div>
        </div>
    );
}
