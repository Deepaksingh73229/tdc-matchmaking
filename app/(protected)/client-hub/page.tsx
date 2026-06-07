import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import ClientPortalUI from "@/components/dashboard/ClientPortalUI";

export const dynamic = "force-dynamic";

export default async function ClientHubPage() {
    // 1. Authenticate and enforce Role-Based Access Control
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // If an Admin tries to navigate here, kick them back to the admin dashboard
    if (session.user.role === "Matchmaker") {
        redirect("/dashboard");
    }

    // 2. Fetch the logged-in client's data
    const clientData = await ClientService.findById(session.user.id);

    if (!clientData) {
        redirect("/login");
    }

    // 3. Serialize data for Next.js Client Components
    // JSON round-trip converts ObjectIds, Dates, and sub-doc _ids into plain values.
    const serializedClient = JSON.parse(JSON.stringify(clientData));

    return (
        <ClientPortalUI client={serializedClient} />
    );
}