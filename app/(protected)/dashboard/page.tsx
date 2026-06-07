import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import ClientTable from "@/components/dashboard/ClientTable";


// Always re-fetch on every request (filters live in searchParams)
export const dynamic = "force-dynamic";

const PAGE_SIZE = 18;

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

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "Matchmaker"}
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400">
                        Here is your current roster of clients looking for a match.
                    </p>
                </div>

                {/* KPI Stats */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm text-center">
                        <span className="block text-2xl font-bold text-rose-600 dark:text-rose-500">
                            {totalCount}
                        </span>

                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                            {
                                query || gender !== "All" || statusTag !== "All" || maritalStatus !== "All" || religion !== "All" || city !== "All"
                                    ? "Filtered"
                                    : "Total Clients"
                            }
                        </span>
                    </div>

                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm text-center">
                        <span className="block text-2xl font-bold text-amber-500">
                            {proposedCount}
                        </span>

                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                            Proposed
                        </span>
                    </div>

                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl shadow-sm text-center border-b-2 border-b-emerald-500">
                        <span className="block text-2xl font-bold text-emerald-600">
                            {connectedCount}
                        </span>
                        
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                            Connected
                        </span>
                    </div>
                </div>
            </div>

            {/* The Data Grid */}
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
    );
}