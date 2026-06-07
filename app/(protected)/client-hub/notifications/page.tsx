import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { NotificationService } from "@/lib/services/notification.service";
import ClientNotificationsUI from "@/components/dashboard/ClientNotificationsUI";

export const dynamic = "force-dynamic";

export default async function ClientNotificationsPage() {
    // 1. Authenticate and enforce Role-Based Access Control
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if (session.user.role === "Matchmaker") {
        redirect("/dashboard");
    }

    // 2. Fetch notifications specifically for this client
    const notifications = await NotificationService.findByClient(session.user.id, 20);

    // 3. Serialize data for Next.js Client Components
    const serializedNotifications = (notifications as any).map((notif: any) => ({
        ...notif,
        _id: notif._id.toString(),
        clientId: notif.clientId.toString(),
        createdAt: notif.createdAt.toISOString(),
        updatedAt: notif.updatedAt.toISOString(),
        // Pre-format the date on the server to avoid locale/timezone differences
        displayDate: new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    return (
        <ClientNotificationsUI initialNotifications={serializedNotifications} />
    );
}