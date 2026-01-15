"use client"

import React, { useState } from "react"
import { Sidebar, SidebarBody, SidebarLink, SidebarSection, useSidebar } from "@/components/ui/sidebar"
import {
    Compass,
    Plus,
    Settings,
    Sparkles,
    MessageSquare,
    Zap,
    Crown,
} from "lucide-react"
import Image from "next/image"
import { WalletConnectButton } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { usePrivyWallet } from "@/hooks/use-privy-wallet"
import { getChatsByWallet, createChat, Chat } from "@/app/actions"
import { useRouter, usePathname } from "next/navigation"

export function AppSidebar() {
    const [open, setOpen] = useState(true)
    const [chats, setChats] = useState<Chat[]>([])
    const { walletAddress } = usePrivyWallet()
    const router = useRouter()
    const pathname = usePathname()

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
            <SidebarBody className="bg-[#0a0a0b] border-r border-white/[0.06]">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4">
                        <SidebarLogo />
                    </div>

                    {/* New Chat Button */}
                    <div className="px-3 mb-4">
                        <NewChatButton onClick={handleNewChat} />
                    </div>

                    {/* Navigation */}
                    <div className="px-3 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <SidebarSection>
                            <SidebarLink
                                link={{
                                    label: "Discover",
                                    href: "/discover",
                                    icon: <Compass className="w-5 h-5" />,
                                }}
                                active={pathname === "/discover"}
                            />
                            <SidebarLink
                                link={{
                                    label: "AI Agents",
                                    href: "/agents",
                                    icon: <Sparkles className="w-5 h-5" />,
                                }}
                                active={pathname === "/agents"}
                            />
                        </SidebarSection>

                        {chats.length > 0 && (
                            <SidebarSection title="Recent Chats" className="mt-6">
                                {chats.slice(0, 8).map((chat) => (
                                    <SidebarLink
                                        key={chat.id}
                                        link={{
                                            label: chat.title,
                                            href: `/c/${chat.hash}`,
                                            icon: (
                                                <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                                                    {chat.title[0]?.toUpperCase() || "C"}
                                                </div>
                                            ),
                                        }}
                                        active={pathname === `/c/${chat.hash}`}
                                    />
                                ))}
                            </SidebarSection>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/[0.06] space-y-2">
                        <WalletSection />
                        <SidebarLink
                            link={{
                                label: "Settings",
                                href: "/settings/profile",
                                icon: <Settings className="w-5 h-5" />,
                            }}
                            active={pathname?.startsWith("/settings")}
                        />
                    </div>
                </div>
            </SidebarBody>
        </Sidebar>
    )
}

function SidebarLogo() {
    const { open } = useSidebar()

    return (
        <Link href="/" className="flex items-center py-3">
            <Image
                src="/0rca-Photoroom.svg"
                alt="0RCA"
                width={open ? 140 : 36}
                height={open ? 48 : 36}
                className={cn(
                    "brightness-0 invert", // Makes SVG white
                    open ? "h-12 w-auto" : "h-9 w-9"
                )}
            />
        </Link>
    )
}

function NewChatButton({ onClick }: { onClick: () => void }) {
    const { open } = useSidebar()

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2 py-2.5 rounded-xl",
                "bg-gradient-to-r from-violet-600 to-indigo-600",
                "hover:from-violet-500 hover:to-indigo-500",
                "text-white font-semibold text-sm",
                "shadow-lg shadow-violet-600/20",
                "transition-all duration-200 active:scale-[0.98]",
                open ? "px-4 justify-start" : "px-0 justify-center"
            )}
        >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
                {open && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        New Chat
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    )
}

function WalletSection() {
    const { open } = useSidebar()

    if (!open) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <WalletConnectButton />
        </motion.div>
    )
}

export const LogoIcon = () => {
    return (
        <Link href="/" className="flex items-center justify-center">
            <Image
                src="/0rca-Photoroom.svg"
                alt="0RCA"
                width={36}
                height={36}
                className="h-9 w-9 brightness-0 invert"
            />
        </Link>
    )
}
