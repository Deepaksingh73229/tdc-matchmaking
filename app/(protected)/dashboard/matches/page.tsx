import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { MatchService } from "@/lib/services/match.service";
import MatchTrackingUI from "@/components/dashboard/MatchTrackingUI";

export default async function MatchesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Matchmaker") {
        redirect("/login");
    }

    // Fetch all matches with client data populated
    const matches = await MatchService.list(
        {}, 
        { createdAt: -1 },
        200, // Limit 200 matches for the dashboard
        0,
        ["clientA", "clientB"]
    );

    return (
        <div className="animate-fade-in pb-16">
            <MatchTrackingUI initialMatches={JSON.parse(JSON.stringify(matches))} />
        </div>
    );
}
