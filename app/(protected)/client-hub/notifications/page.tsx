import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { NotificationService } from "@/lib/services/notification.service";
import ClientNotificationsUI from "@/components/dashboard/client-hub/ClientNotificationsUI";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Notifications | TDC Matchmaker",
    description: "Your notifications and updates.",
};

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
        <div className="relative min-h-full w-full max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] pb-16">
            
            {/* ── Cinematic Ambient Background ── */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-rose-400/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4"></div>
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-stone-200/50 dark:bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

            {/* ── Page Header ── */}
            <div className="mb-8 md:mb-10 relative z-10 px-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 rounded-xl border border-rose-200/50 dark:border-rose-500/10 shadow-sm shadow-rose-500/5">
                        <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        Notifications
                    </h1>
                </div>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed pl-1">
                    Stay updated on new match proposals, profile approvals, and important messages from your matchmaker.
                </p>
            </div>

            {/* ── Main Interactive Board ── */}
            <div className="relative z-20">
                <ClientNotificationsUI initialNotifications={serializedNotifications} />
            </div>
            
        </div>
    );
}