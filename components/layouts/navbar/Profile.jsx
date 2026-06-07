"use client"

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup
} from "@/components/ui/dropdown-menu";

import {
    LogOut,
    Settings,
    UserCircle,
} from "lucide-react";

import { useState } from "react";
import Link from "next/link";

export default function Profile({ type }) {
    const router = useRouter();
    const [errors, setErrors] = useState({});
    const { data: session, status } = useSession();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const items = [
        {
            id: 1,
            title: "Account Settings",
            icon: <UserCircle className="w-4 h-4" />,
            link: session?.user?.role === "Matchmaker" ? "/dashboard/profile" : "/dashboard/profile" // Update client profile link later if needed
        },
    ]

    const handleSignOut = async () => {
        setIsGoogleLoading(true);
        setErrors({});

        try {
            await signOut({
                callbackUrl: "/",
                redirect: true
            });

        } catch (error) {
            console.error("Sign Out error:", error);
            setErrors({
                form: "Failed to sign out. Please try again.",
            });
            setIsGoogleLoading(false);
        }
    };

    return (
        <>
            {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ) : session ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
                                <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
                                <AvatarFallback className="rounded-lg">U</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        // side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
                                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{session?.user?.name}</span>
                                    <span className="truncate text-xs">{session?.user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            {items.map((item) => (
                                <DropdownMenuItem
                                    key={item.id}
                                    onClick={() => router.push(item.link)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    {item.icon}
                                    <span>{item.title}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button
                    className="px-3 py-4 font-mono font-semibold rounded-3xl bg-neutral-100/20 hover:bg-neutral-100/10 border text-neutral-700 dark:text-neutral-100"
                >
                    <Link href="/login">
                        Sign In
                    </Link>
                </Button>

            )}
        </>
    )
}