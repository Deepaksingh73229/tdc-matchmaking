import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import MatchReviewUI from "@/components/dashboard/matches/MatchReviewUI";
import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ matchId: string }> }): Promise<Metadata> {
    return {
        title: "Review Match Proposal | TDC Matchmaker",
        description: "Review a new match proposal curated by your matchmaker.",
    };
}

export default async function MatchReviewPage({ params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Client") {
        redirect("/login");
    }

    const match = await MatchService.findById(matchId);

    // ─── Premium Error State (Missing Match) ───
    if (!match) {
        return (
            <div className="relative min-h-[80vh] flex items-center justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] p-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/10 dark:bg-rose-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                <div className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/30 dark:shadow-none text-center max-w-lg w-full relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-500/20">
                            <UserX className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                            Proposal Unavailable
                        </h2>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed mb-8 px-4">
                            This match proposal could not be found. It may have been withdrawn by your matchmaker or is no longer active.
                        </p>

                        <Link
                            href="/client-hub"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold rounded-xl transition-all duration-300 shadow-sm border border-stone-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Portal
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const clientId = session.user.id;
    const clientAID = match.clientA.toString();
    const clientBID = match.clientB.toString();

    const isClientA = clientAID === clientId;
    const isClientB = clientBID === clientId;

    if (!isClientA && !isClientB) {
        redirect("/client-hub");
    }

    const otherClientId = isClientA ? match.clientB : match.clientA;
    const otherClient = await ClientService.findById(otherClientId.toString());

    // ─── Premium Error State (Missing Target Profile) ───
    if (!otherClient) {
        return (
            <div className="relative min-h-[80vh] flex items-center justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] p-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/10 dark:bg-rose-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                <div className="bg-white/90 dark:bg-[#111218]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-stone-200/60 dark:border-white/5 shadow-2xl shadow-stone-200/30 dark:shadow-none text-center max-w-lg w-full relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-500/20">
                            <UserX className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                            Profile Unavailable
                        </h2>
                        <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed mb-8 px-4">
                            The profile associated with this proposal is currently inactive or has been hidden by the matchmaker.
                        </p>

                        <Link
                            href="/client-hub/matches"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold rounded-xl transition-all duration-300 shadow-sm border border-stone-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Matches
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Determine if confidential info should be revealed
    const isConnected = match.overallStatus === "Connected";
    const myStatus = isClientA ? match.statusA : match.statusB;
    const myMessage = isClientA ? match.messageA : match.messageB;

    // Serialize data with fallbacks
    const serializedMatch = {
        ...match,
        _id: match._id.toString(),
        clientA: clientAID,
        clientB: clientBID,
        proposedBy: match.proposedBy?.toString() || "",
        createdAt: match.createdAt ? new Date(match.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: match.updatedAt ? new Date(match.updatedAt).toISOString() : new Date().toISOString(),
    };

    const serializedOtherClient = {
        ...otherClient,
        _id: otherClient._id.toString(),
        dob: otherClient.dob ? new Date(otherClient.dob).toISOString() : null,
        createdAt: otherClient.createdAt ? new Date(otherClient.createdAt).toISOString() : null,
        updatedAt: otherClient.updatedAt ? new Date(otherClient.updatedAt).toISOString() : null,
        // Redact info if not connected
        email: isConnected ? otherClient.email : "HIDDEN",
        phone: isConnected ? otherClient.phone : "HIDDEN",
    };

    return (
        <div className="relative min-h-full w-full max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
            {/* ── Cinematic Ambient Background ── */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"></div>
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-stone-200/50 dark:bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

            <MatchReviewUI
                match={serializedMatch}
                profile={serializedOtherClient}
                myStatus={myStatus}
                isConnected={isConnected}
                message={myMessage}
            />
        </div>
    );
}