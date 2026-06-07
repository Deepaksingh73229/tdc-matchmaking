import { withAuth } from "next-auth/middleware";

// This exports the default middleware that checks for a valid NextAuth session
export default withAuth({
    pages: {
        signIn: "/login", // Redirect unauthorized users here
    },
});

// Define which routes to protect
export const config = {
    // Protect all routes starting with /dashboard
    matcher: ["/dashboard/:path*"],
};