import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import ClientTable from "@/components/dashboard/clients/ClientTable";

// Always re-fetch on every request (filters live in searchParams)
export const dynamic = "force-dynamic";

const PAGE_SIZE = 18;

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | TDC Matchmaker",
    description: "Manage your clients and their profiles.",
};

/**
 * Projection that fetches ONLY the fields the roster table needs.
 * Skipping narrative text, preferences, and the embedding vector keeps
 * each document ~10× smaller and dramatically improves transfer speed.
 */
const TABLE_PROJECTION = {
    firstName: 1,
    lastName: 1,
    gender: 1,
    dob: 1,
    profilePhoto: 1,
    city: 1,
    religion: 1,
    maritalStatus: 1,
    statusTag: 1,
    email: 1,
    designation: 1,
    company: 1,
    income_lpa: 1,
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;

    // 1. Auth guard
    const session = await getServerSession(authOptions);
    if (session?.user?.role === "Client") {
        redirect("/client-hub");
    }

    // 2. Parse pagination & filter params
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const query = params.q || "";
    const gender = params.gender || "All";
    const statusTag = params.status || "All";
    const maritalStatus = params.marital || "All";
    const religion = params.religion || "All";
    const city = params.city || "All";

    // 3. Build the MongoDB filter object server-side
    const dbFilter: Record<string, any> = {};

    if (gender !== "All") dbFilter.gender = gender;
    if (statusTag !== "All") dbFilter.statusTag = statusTag;
    if (maritalStatus !== "All") dbFilter.maritalStatus = maritalStatus;
    if (religion !== "All") dbFilter.religion = religion;
    if (city !== "All") dbFilter.city = city;

    if (query) {
        const regex = { $regex: query, $options: "i" };
        dbFilter.$or = [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { city: regex },
        ];
    }

    // 4. Paginated query + total count in parallel
    const skip = (page - 1) * PAGE_SIZE;

    const [clients, totalCount, proposedCount, connectedCount, allReligions, allCities] =
        await Promise.all([
            ClientService.list(dbFilter, { createdAt: -1 }, PAGE_SIZE, skip, TABLE_PROJECTION),
            ClientService.count(dbFilter),
            MatchService.count({ overallStatus: "Proposed" }),
            MatchService.count({ overallStatus: "Connected" }),
            ClientService.distinct("religion"),
            ClientService.distinct("city"),
        ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // 5. Serialize for Client Components
    const serializedClients = JSON.parse(JSON.stringify(clients));

    const matchmakerName = session?.user?.name?.split(" ")[0] || "Matchmaker";
    const isFiltered = query || gender !== "All" || statusTag !== "All" || maritalStatus !== "All" || religion !== "All" || city !== "All";

    return (
        // Utilizing tailwindcss-animate for server-side load animations
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

            {/* Dashboard Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="space-y-2 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                        Welcome back, <span className="text-rose-600 dark:text-rose-400 font-bold">{matchmakerName}</span>
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
                        Here is your current roster of clients. Review profiles, manage statuses, and curate the perfect connections.
                    </p>
                </div>

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-3 gap-3 md:gap-5 w-full xl:w-auto relative z-10">

                    {/* Card 1: Total/Filtered Clients */}
                    <div className="relative overflow-hidden flex flex-col justify-center px-5 py-4 md:py-5 bg-gradient-to-br from-white to-stone-50/80 dark:from-[#111218] dark:to-[#0A0B0E] border border-stone-200/60 dark:border-white/5 rounded-2xl shadow-sm shadow-stone-200/20 dark:shadow-none group transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-rose-500/10">
                        {/* Abstract Background Curve */}
                        <svg className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-100 dark:text-rose-900/30 transform transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
                            <circle cx="80" cy="80" r="40" opacity="0.7" />
                            <circle cx="80" cy="80" r="20" opacity="0.7" />
                        </svg>

                        <div className="relative z-10">
                            <span className="block text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                                {totalCount}
                            </span>

                            <span className="mt-1 block text-[10px] md:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-semibold">
                                {isFiltered ? "Filtered" : "Total Clients"}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Proposed Matches */}
                    <div className="relative overflow-hidden flex flex-col justify-center px-5 py-4 md:py-5 bg-gradient-to-br from-white to-stone-50/80 dark:from-[#111218] dark:to-[#0A0B0E] border border-stone-200/60 dark:border-white/5 rounded-2xl shadow-sm shadow-stone-200/20 dark:shadow-none group transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-amber-500/10">
                        {/* Spark/Pulse Geometry */}
                        <svg className="absolute -right-2 -top-4 w-24 h-24 text-amber-100 dark:text-amber-900/30 transform transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" opacity="0.7" />
                        </svg>

                        <div className="relative z-10">
                            <span className="block text-2xl md:text-3xl font-bold text-amber-500 dark:text-amber-400 tracking-tight">
                                {proposedCount}
                            </span>

                            <span className="mt-1 block text-[10px] md:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-semibold">
                                Proposed
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Connected Matches */}
                    <div className="relative overflow-hidden flex flex-col justify-center px-5 py-4 md:py-5 bg-gradient-to-br from-white to-stone-50/80 dark:from-[#111218] dark:to-[#0A0B0E] border border-stone-200/60 dark:border-white/5 rounded-2xl shadow-sm shadow-stone-200/20 dark:shadow-none group transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-emerald-500/10">
                        {/* Active Bottom Glow Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

                        {/* Interlocking Rings Geometry */}
                        <svg className="absolute -right-4 -bottom-2 w-20 h-20 text-emerald-100 dark:text-emerald-900/30 transform transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8">
                            <circle cx="40" cy="50" r="25" opacity="0.7" />
                            <circle cx="70" cy="50" r="25" opacity="0.7" />
                        </svg>

                        <div className="relative z-10">
                            <span className="block text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                {connectedCount}
                            </span>
                            
                            <span className="mt-1 block text-[10px] md:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] font-semibold">
                                Connected
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* The Data Grid */}
            <div className="relative z-20 rounded-2xl bg-white/50 dark:bg-transparent backdrop-blur-sm">
                <ClientTable
                    clients={serializedClients}
                    currentPage={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    filters={{ query, gender, statusTag, maritalStatus, religion, city }}
                    filterOptions={{ religions: (allReligions as string[]).sort(), cities: (allCities as string[]).sort() }}
                />
            </div>
        </div>
    );
}