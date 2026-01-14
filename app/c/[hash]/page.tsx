"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"

import { useParams, useSearchParams } from "next/navigation"
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
import { getAgents, executeOrchestration, getChatByHash, getChatMessages, saveMessage, Agent, Message } from "@/app/actions"
import Image from "next/image"
import { MainHeader } from "@/components/main-header"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


// interfaces are now imported from "@/app/actions"


const ORCHESTRATOR_OPTIONS: DropdownOption[] = [
    { id: "auto", label: "Auto Orchestrator", icon: Bot, color: "#A06CD5" },
    { id: "manual", label: "Manual Swarm", icon: Cpu, color: "#45B7D1" },
];

export default function ChatPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const hash = params.hash as string
    const firstMsg = searchParams.get("firstMsg")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // UI/UX States
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [chatId, setChatId] = useState<string | null>(null)
    const [chatTitle, setChatTitle] = useState("Chat")

    // Orchestration States
    const [orchestratorMode, setOrchestratorMode] = useState("auto")
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [agents, setAgents] = useState<Agent[]>([])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Load Agents
                const fetchedAgents = await getAgents()
                setAgents(fetchedAgents.map(a => ({ ...a, icon: Bot })))

                // 2. Load Chat Metadata
                const chat = await getChatByHash(hash)
                if (chat) {
                    setChatId(chat.id)
                    setChatTitle(chat.title)

                    // 3. Load Messages
                    const history = await getChatMessages(chat.id)
                    setMessages(history)

                    // 4. Handle first message if chat is new
                    if (history.length === 0 && firstMsg) {
                        handleSendMessage(firstMsg, chat.id)
                    }
                }
            } catch (e) {
                console.error("Failed to load chat data", e)
            }
        }
        loadData()
    }, [hash, firstMsg])

    const handleSendMessage = async (content: string, forceChatId?: string) => {
        const activeChatId = forceChatId || chatId
        if (!content.trim() || !activeChatId) return

        const userMsg: Message = { role: "user", content }
        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        // Optimistically save user message
        saveMessage(activeChatId, "user", content)

        startTransition(async () => {
            try {
                const response = await executeOrchestration(
                    content,
                    orchestratorMode as "auto" | "manual",
                    selectedAgents
                )
                const assistantMsg: Message = { role: "assistant", content: response }
                setMessages(prev => [...prev, assistantMsg])

                // Save assistant message
                saveMessage(activeChatId, "assistant", response)
            } catch (error) {
                setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to process request." }])
            } finally {
                setIsTyping(false)
            }
        })
    }

    // Wrapper for PromptInputBox compatibility
    const onPromptSend = (content: string) => handleSendMessage(content)


    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white">
            <MainHeader title={chatTitle} />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
                    <div className="max-w-4xl mx-auto px-6 space-y-8 pb-48">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-4 group w-full",
                                        msg.role === "assistant" ? "justify-start" : "flex-row-reverse justify-start"
                                    )}

                                >

                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        msg.role === "assistant" ? "bg-violet-500/10 text-violet-400" : "bg-white/5 text-white/40"
                                    )}>
                                        {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <CircleUserRound className="w-5 h-5" />}
                                    </div>

                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed relative",
                                        msg.role === "assistant"
                                            ? "bg-white/[0.03] border border-white/[0.05] text-white/90 shadow-2xl"
                                            : "bg-violet-600 text-white shadow-lg shadow-violet-500/10"
                                    )}>
                                        <div className={cn(
                                            "whitespace-pre-wrap",
                                            msg.role === "assistant" ? "prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10" : "font-medium"
                                        )}>
                                            {msg.role === "assistant" ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] mt-2 opacity-30 font-medium",
                                            msg.role === "assistant" ? "text-left" : "text-right"
                                        )}>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                                        <Bot className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-3 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                {/* Fixed Input Area */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent">
                    <div className="max-w-4xl mx-auto">
                        <PromptInputBox
                            onSend={onPromptSend}
                            isLoading={isPending}
                            className="bg-[#0A0A0B] shadow-2xl border-white/10"
                            header={
                                <div className="flex items-center justify-between py-1">
                                    <FluidDropdown
                                        value={orchestratorMode}
                                        onChange={setOrchestratorMode}
                                        options={ORCHESTRATOR_OPTIONS}
                                        className="w-[180px]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/60 gap-2 h-7 group">
                                            <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">Share</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/60 gap-2 h-7">
                                            <History className="w-3.5 h-3.5" />
                                            <span className="text-xs">Agents</span>
                                        </Button>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Side Action buttons (Absolute) */}
            <div className="fixed right-6 top-24 flex flex-col gap-2 z-30">
                <Button variant="outline" size="icon-sm" className="bg-[#030303] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="bg-[#030303] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <History className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="bg-[#030303] border-white/[0.05] text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
