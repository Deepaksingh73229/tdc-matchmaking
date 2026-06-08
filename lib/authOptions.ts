import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { MatchmakerService } from "@/lib/services/matchmaker.service";
import { ClientService } from "@/lib/services/client.service";

const requiredEnvVars = ["NEXTAUTH_SECRET"];

for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        throw new Error(`[Auth] Missing required environment variable: ${key}`);
    }
}

import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username / Email", type: "text", placeholder: "admin or client@mail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                // 1. First, check if the user is a Matchmaker (Admin)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let user: any = await MatchmakerService.findOne({ username: credentials.username });
                let role = "Matchmaker";

                // 2. If not found in Admins, check if they are a Client
                if (!user) {
                    user = await ClientService.findOne({ email: credentials.username });
                    role = "Client";
                }

                // 3. If still not found, reject
                if (!user) {
                    throw new Error("Invalid username or password");
                }

                // 4. Verify Password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isPasswordValid) {
                    throw new Error("Invalid username or password");
                }

                // 5. Return user object with their specific role
                return {
                    id: user._id.toString(),
                    name: user.firstName || user.name, // Handle both Client and Matchmaker schemas
                    email: user.email || user.username,
                    role: role,
                    image: user.profilePhoto || "",
                };
            }
        }),
    ],

    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60,
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
            }
            if (trigger === "update" && session?.user) {
                if (session.user.name) token.name = session.user.name;
                if (session.user.email) token.email = session.user.email;
                if (session.user.image) token.picture = session.user.image;
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                // @ts-expect-error
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.name = token.name;
                session.user.email = token.email as string;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};