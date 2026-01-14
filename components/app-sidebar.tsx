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
    Plus,
    Settings2,

} from "lucide-react"
import Image from "next/image"
import { WalletConnectButton } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { usePrivyWallet } from "@/hooks/use-privy-wallet"
import { getChatsByWallet, createChat, Chat } from "@/app/actions"
import { useRouter } from "next/navigation"


export function AppSidebar() {
    const [open, setOpen] = useState(false)
    const [chats, setChats] = useState<Chat[]>([])
    const { walletAddress } = usePrivyWallet()
    const router = useRouter()

    React.useEffect(() => {
        if (walletAddress) {
            getChatsByWallet(walletAddress).then(setChats)
        } else {
            setChats([])
        }
    }, [walletAddress])

    const handleNewChat = async () => {
        if (!walletAddress) {
            alert("Please connect your wallet first.")
            return
        }
        try {
            const hash = await createChat(walletAddress)
            router.push(`/c/${hash}`)
        } catch (e) {
            console.error("Failed to create chat", e)
        }
    }

    return (
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between bg-black/95 border-r border-white/10 !px-0">
                <div className="flex flex-col flex-1 h-full overflow-hidden">
                    {/* Fixed Header */}
                    <div className="px-4 py-4">
                        {open ? <Logo /> : <LogoIcon />}
                    </div>

                    {/* Scrollable Section */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-2">
                        <div className="flex flex-col gap-2">
                            <SidebarLink
                                link={{
                                    label: "Discover",
                                    href: "#",
                                    icon: <Compass className="text-white/70 h-5 w-5 flex-shrink-0" />,
                                }}
                            />
                        </div>

                        <div className="mt-8 flex flex-col gap-4">
                            {chats.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <h3 className={cn(
                                        "text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-2 transition-opacity duration-300",
                                        !open && "opacity-0"
                                    )}>
                                        Recent Chats
                                    </h3>
                                    {chats.slice(0, 10).map((chat) => (
                                        <SidebarLink
                                            key={chat.id}
                                            link={{
                                                label: chat.title,
                                                href: `/c/${chat.hash}`,
                                                icon: <div className="size-5 flex items-center justify-center text-[10px] font-bold bg-white/5 rounded text-white/40">{chat.title[0]}</div>,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-4 bg-black/40 border-t border-white/5 space-y-4">
                        <button
                            onClick={handleNewChat}
                            className={cn(
                                "flex items-center gap-2 group/sidebar py-2.5 transition-all w-full text-left bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-600/20 active:scale-95",
                                open ? "px-4 justify-start" : "px-0 justify-center"
                            )}
                        >
                            <Plus className="text-white h-5 w-5 flex-shrink-0" />
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-white text-sm font-bold tracking-tight"
                                >
                                    New Chat
                                </motion.span>
                            )}
                        </button>

                        <div className="flex flex-col gap-2">
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
                    </div>
                </div>
            </SidebarBody>

        </Sidebar>
    )
}


const Logo = () => {
    return (
        <Link
            href="/"
            className="flex items-center gap-3 py-2 px-1 relative z-20"
        >
            <Image
                src="/0rca-Photoroom.svg"
                alt="0rca Logo"
                width={32}
                height={32}
                className="size-8"
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
            className="flex items-center justify-center py-2 relative z-20"
        >
            <Image
                src="/0rca-Photoroom.svg"
                alt="0rca Logo"
                width={24}
                height={24}
                className="size-6"
            />
        </Link>
    );
};

