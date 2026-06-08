import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | TDC Matchmaker",
    description: "Create a new account at The Date Crew.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
