"use client"

import { useSession, signOut } from "next-auth/react";
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
    UserCircle,
} from "lucide-react";

import Link from "next/link";

export default function Profile() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const items = [
        {
            id: 1,
            title: "Account Settings",
            icon: <UserCircle className="w-4 h-4" />,
            link: session?.user?.role === "Matchmaker" ? "/dashboard/profile" : "/dashboard/profile" // Update client profile link later if needed
        },
    ]

    const handleSignOut = async () => {
        try {
            await signOut({
                callbackUrl: "/",
                redirect: true
            });
        } catch (error) {
            console.error("Sign Out error:", error);
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
                <Link
                    href="/login"
                    className="text-sm font-semibold px-5 py-2.5 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-stone-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                    Member Login
                </Link>

            )}
        </>
    )
}