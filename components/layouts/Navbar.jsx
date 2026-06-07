"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'
// import { signIn } from "next-auth/react";
// import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeartHandshake, Stethoscope } from "lucide-react";
import Profile from "@/components/layouts/navbar/Profile";
// import { useAppDispatch, useAppSelector } from "@/lib/store/hooks/index";
// import { setSessions, addSession } from "@/lib/store/features/sessionSlice";


// import logo from "@/app/icon0.svg"

export default function Navbar() {
    const [auth, setAuth] = useState(false);
    // const dispatch = useAppDispatch();

    // useEffect(() => {
    //     const fetchSessions = async () => {
    //         const response = await fetch('/api/session', {
    //             method: 'GET'
    //         });

    //         const { sessionsData } = await response.json()
    //         console.log("Session Details: ", sessionsData)

    //         dispatch(setSessions(sessionsData));

    //         // console.log("All Sessions are: ", sessions)
    //     }

    //     fetchSessions()
    // }, [])

    return (
        <nav className="place-self-center w-full max-w-4xl fixed top-5 z-50 border rounded-4xl border-black/20 dark:border-gray-800 bg-white/10 dark:bg-neutral-950/50 backdrop-blur-lg">
            <div className="flex items-center justify-between px-5 py-1.5">
                <Link href="/dashboard" className="flex items-center space-x-3 group">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors duration-300">
                        <HeartHandshake className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                    </div>

                    <span className="font-bold text-xl tracking-wide text-slate-900 dark:text-white">
                        TDC Matchmaker
                    </span>
                </Link>

                <div className=" flex items-center gap-5">
                    <ThemeToggle />

                    <Profile />

                    {/* <Button asChild className="font-mono font-semibold rounded-3xl bg-neutral-100/20 hover:bg-neutral-100/10 border text-neutral-700 dark:text-neutral-100">
                        <Link href="/login">Sign In</Link>
                    </Button> */}
                </div>
            </div>
        </nav>
    );
}