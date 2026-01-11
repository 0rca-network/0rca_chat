"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronRight,
    Bell,
    Search,
    Share2,
    Plus,
    Bot,
    Code2,
    Cpu,
    MonitorIcon,
    Rocket,
    Layers,
    Palette,
    CircleUserRound,
    MoreHorizontal,
    History
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { FluidDropdown, DropdownOption } from "@/components/ui/fluid-dropdown"
import { getAgents, executeOrchestration } from "@/app/actions"
import Image from "next/image"

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Agent {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const ORCHESTRATOR_OPTIONS: DropdownOption[] = [
    { id: "auto", label: "Auto Orchestrator", icon: Bot, color: "#A06CD5" },
    { id: "manual", label: "Manual Swarm", icon: Cpu, color: "#45B7D1" },
];

export default function ChatPage() {
    const params = useParams()
    const id = params.id as string

    // UI/UX States
    const [messages, setMessages] = useState<Message[]>([
        { role: "user", content: "hi" }
    ])
    const [isTyping, setIsTyping] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Orchestration States
    const [orchestratorMode, setOrchestratorMode] = useState("auto")
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [agents, setAgents] = useState<Agent[]>([])

    useEffect(() => {
        async function loadAgents() {
            try {
                const fetched = await getAgents()
                const uiAgents = fetched.map(a => ({
                    ...a,
                    icon: Bot
                }))
                setAgents(uiAgents)
            } catch (e) {
                console.error("Failed to load agents", e)
            }
        }
        loadAgents()
    }, [])

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return

        setMessages(prev => [...prev, { role: "user", content }])
        setIsTyping(true)

        startTransition(async () => {
            try {
                const response = await executeOrchestration(
                    content,
                    orchestratorMode as "auto" | "manual",
                    selectedAgents
                )
                setMessages(prev => [...prev, { role: "assistant", content: response }])
            } catch (error) {
                setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to process request." }])
            } finally {
                setIsTyping(false)
            }
        })
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white">
            {/* Top Navigation Bar */}
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#030303]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="text-white/40">user</span>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                        <span className="text-white/90">Chat {id}</span>
                        <Button variant="ghost" size="icon-sm" className="ml-1 text-white/20 hover:text-white/60">
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-1">
                        <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Earnings:</span>
                            <span className="text-xs text-white/90">$0.00</span>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Cash:</span>
                            <span className="text-xs text-white/90">$0.00</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon-sm" className="text-white/40 relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-white/40">
                            <CircleUserRound className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-white/40">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-4xl mx-auto w-full space-y-8 pb-32">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "group flex flex-col gap-2",
                                    msg.role === "user" ? "items-end" : "items-start"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center border",
                                        msg.role === "assistant"
                                            ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                                            : "bg-white/5 border-white/10 text-white/40"
                                    )}>
                                        {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : <CircleUserRound className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
                                        {msg.role === "assistant" ? "Orchestrator" : "You"}
                                    </span>
                                    <span className="text-[10px] text-white/20">2:58 PM</span>
                                </div>
                                <div className={cn(
                                    "max-w-[85%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed",
                                    msg.role === "assistant"
                                        ? "bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-none"
                                        : "bg-violet-600/10 border border-violet-500/20 text-white rounded-tr-none shadow-[0_0_20px_rgba(139,92,246,0.05)]"
                                )}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                                </div>
                                <span className="text-xs text-white/30 italic">Thinking...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent pt-12">
                    <div className="max-w-3xl mx-auto relative">
                        <div className="absolute -top-10 left-0 right-0 flex justify-center gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Floating actions could go here */}
                        </div>

                        <PromptInputBox
                            onSend={handleSendMessage}
                            isLoading={isPending}
                            className="bg-[#0A0A0B] shadow-2xl border-white/10"
                            header={
                                <div className="flex items-center justify-between pb-1">
                                    <FluidDropdown
                                        value={orchestratorMode}
                                        onChange={setOrchestratorMode}
                                        options={ORCHESTRATOR_OPTIONS}
                                        className="w-[180px]"
                                    />
                                    <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/60 gap-2 h-7">
                                        <History className="w-3.5 h-3.5" />
                                        <span className="text-xs">Agents</span>
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Side Action buttons (Absolute) */}
            <div className="fixed right-6 top-20 flex flex-col gap-2">
                <Button variant="outline" size="icon-sm" className="bg-[#030303] border-white/5 text-white/40">
                    <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="bg-[#030303] border-white/5 text-white/40">
                    <History className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="bg-[#030303] border-white/5 text-white/40">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
