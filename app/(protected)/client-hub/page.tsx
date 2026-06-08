import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ClientService } from "@/lib/services/client.service";
import ClientProfile from "@/components/dashboard/clients/ClientProfile";

export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Portal | TDC Matchmaker",
    description: "Your personal client portal for The Date Crew.",
};

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
        <ClientProfile client={serializedClient} editable={true} />
    );
}