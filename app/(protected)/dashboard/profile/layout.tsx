import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Profile | TDC Matchmaker",
    description: "Manage your personal profile.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
