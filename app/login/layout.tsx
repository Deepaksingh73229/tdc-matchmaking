import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Log In | TDC Matchmaker",
    description: "Sign in to The Date Crew matchmaker portal.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
