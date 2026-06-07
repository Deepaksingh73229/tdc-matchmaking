import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect, notFound } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import { MatchService } from "@/lib/services/match.service";
import MatchReviewUI from "@/components/dashboard/MatchReviewUI";

export const dynamic = "force-dynamic";

export default async function MatchReviewPage({ params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Client") {
        redirect("/login");
    }

    const match = await MatchService.findById(matchId);

    if (!match) {
        notFound();
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

    if (!otherClient) {
        notFound();
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
        <MatchReviewUI 
            match={serializedMatch} 
            profile={serializedOtherClient} 
            myStatus={myStatus} 
            isConnected={isConnected} 
            message={myMessage}
        />
    );
}
