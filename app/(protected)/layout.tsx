import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layouts/DashboardShell";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Authenticate at the layout level
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <DashboardShell
            role={session.user.role as string}
            userName={session.user.name as string}
        >
            {children}
        </DashboardShell>
    );
}