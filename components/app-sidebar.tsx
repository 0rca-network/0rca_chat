"use client"

import React, { useState } from "react"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import {
    BookOpen,
    Bot,
    Compass,
    Frame,
    MessageSquarePlus,
    MoreHorizontal,
    PieChart,
    Settings2,
} from "lucide-react"
import Image from "next/image"
import { WalletConnectButton } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

// Sample data to popuplate the sidebar
const data = {
    pinned: [
        {
            title: "Project Architecture",
            url: "#",
            icon: <Frame className="size-5 flex-shrink-0" />,
        },
        {
            title: "Marketing Campaign",
            url: "#",
            icon: <PieChart className="size-5 flex-shrink-0" />,
        },
        {
            title: "Personal Notes",
            url: "#",
            icon: <BookOpen className="size-5 flex-shrink-0" />,
        },
    ],
    recent: [
        {
            title: "React Components",
            url: "/c/react-components",
            date: "Just now",
        },
        {
            title: "Bug Fixes Q1",
            url: "/c/bug-fixes",
            date: "2h ago",
        },
        {
            title: "Team Meeting",
            url: "/c/team-meeting",
            date: "5h ago",
        },
    ],
}

export function AppSidebar() {
    const [open, setOpen] = useState(false)

    return (
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10 bg-black/95 border-r border-white/10 !px-4">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}

                    <div className="mt-8 flex flex-col gap-2">
                        <SidebarLink
                            link={{
                                label: "New Chat",
                                href: "#",
                                icon: <MessageSquarePlus className="text-violet-400 h-5 w-5 flex-shrink-0" />,
                            }}
                            className="bg-violet-500/10 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 transition-colors"
                        />
                        <SidebarLink
                            link={{
                                label: "Discover",
                                href: "#",
                                icon: <Compass className="text-white/70 h-5 w-5 flex-shrink-0" />,
                            }}
                        />
                        <SidebarLink
                            link={{
                                label: "Library",
                                href: "#",
                                icon: <BookOpen className="text-white/70 h-5 w-5 flex-shrink-0" />,
                            }}
                        />
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h3 className={cn(
                                "text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-2 transition-opacity duration-300",
                                !open && "opacity-0"
                            )}>
                                Pinned
                            </h3>
                            {data.pinned.map((item, idx) => (
                                <SidebarLink
                                    key={idx}
                                    link={{
                                        label: item.title,
                                        href: item.url,
                                        icon: <div className="text-white/60">{item.icon}</div>,
                                    }}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className={cn(
                                "text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-2 transition-opacity duration-300",
                                !open && "opacity-0"
                            )}>
                                Recent
                            </h3>
                            {data.recent.map((item, idx) => (
                                <SidebarLink
                                    key={idx}
                                    link={{
                                        label: item.title,
                                        href: item.url,
                                        icon: <div className="size-5 flex items-center justify-center text-[10px] font-bold bg-white/5 rounded text-white/40">{item.title[0]}</div>,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pb-4">
                    <div className={cn("transition-all duration-300", !open && "opacity-0 pointer-events-none")}>
                        <WalletConnectButton />
                    </div>
                    <SidebarLink
                        link={{
                            label: "Settings",
                            href: "#",
                            icon: <Settings2 className="text-white/60 h-5 w-5 flex-shrink-0" />,
                        }}
                    />
                </div>
            </SidebarBody>
        </Sidebar>
    )
}

const Logo = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
        >
            <Image
                src="/0rca-Photoroom.svg"
                alt="0rca Logo"
                width={48}
                height={48}
                className="size-12"
            />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tighter text-white whitespace-pre"
            >
                0RCA
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
        >
            <Image
                src="/0rca-Photoroom.svg"
                alt="0rca Logo"
                width={48}
                height={48}
                className="size-12"
            />
        </Link>
    );
};
