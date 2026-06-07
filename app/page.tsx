import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import HomePageUI from "@/components/layouts/HomePageUI";

export default async function Home() {
    // 1. Check for an active session
    const session = await getServerSession(authOptions);

    // 2. Redirect based on role if logged in
    if (session?.user) {
        if (session.user.role === "Matchmaker") {
            redirect("/dashboard");
        } else {
            redirect("/client-hub");
        }
    }

    // 3. Render the public landing page if not logged in
    return <HomePageUI />;
}