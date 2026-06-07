import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import DraftProposalUI from "@/components/dashboard/DraftProposalUI";

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

    if (!clientA || !clientB) {
        return (
            <div className="p-8 text-center text-rose-600 font-bold">
                One or both clients could not be found.
            </div>
        );
    }

    return (
        <DraftProposalUI 
            clientA={JSON.parse(JSON.stringify(clientA))} 
            clientB={JSON.parse(JSON.stringify(clientB))} 
        />
    );
}
