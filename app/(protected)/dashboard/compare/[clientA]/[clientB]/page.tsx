import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import DraftProposalUI from "@/components/dashboard/matches/DraftProposalUI";
import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ clientA: string, clientB: string }> }): Promise<Metadata> {
    const { clientA, clientB } = await params;
    const [a, b] = await Promise.all([
        ClientService.findById(clientA),
        ClientService.findById(clientB)
    ]);
    return {
        title: a && b ? `Match Proposal: ${a.firstName} & ${b.firstName} | TDC Matchmaker` : "Compare Profiles | TDC Matchmaker",
        description: "Draft and review a new match proposal.",
    };
}

export default async function ComparePage({ params }: { params: Promise<{ clientA: string, clientB: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Matchmaker") {
        redirect("/login");
    }

    const { clientA: idA, clientB: idB } = await params;

    const [clientA, clientB] = await Promise.all([
        ClientService.findById(idA),
        ClientService.findById(idB),
    ]);

    // ─── Premium Error State (Missing Client) ───
    if (!clientA || !clientB) {
        return (
            <div className="relative min-h-[80vh] flex items-center justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] p-4">
                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/10 dark:bg-rose-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
                
                <div className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/30 dark:shadow-none text-center max-w-lg w-full relative overflow-hidden group">
                    {/* Broken Connection SVG */}
                    <svg className="absolute -top-10 -right-10 w-48 h-48 text-rose-50 dark:text-rose-900/10 transform rotate-12 transition-transform duration-700 group-hover:rotate-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M 20 50 L 45 50" strokeDasharray="4 2" />
                        <path d="M 55 50 L 80 50" strokeDasharray="4 2" />
                        <circle cx="20" cy="50" r="5" fill="currentColor" />
                        <circle cx="80" cy="50" r="5" fill="currentColor" />
                        <path d="M 45 40 L 55 60" strokeWidth="1.5" />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <UserX className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                            Connection Broken
                        </h2>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed mb-8 px-4">
                            One or both of the profiles you are trying to compare could not be found. They may have been removed or deactivated from the roster.
                        </p>
                        
                        <Link 
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold rounded-xl transition-all duration-300 shadow-sm border border-stone-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Roster
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Premium Success Wrapper ───
    return (
        <div className="relative min-h-full w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
            {/* ── Cinematic Ambient Background ── */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/4 -translate-y-1/4"></div>
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-stone-200/50 dark:bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 translate-y-1/3"></div>

            <DraftProposalUI 
                clientA={JSON.parse(JSON.stringify(clientA))} 
                clientB={JSON.parse(JSON.stringify(clientB))} 
            />
        </div>
    );
}