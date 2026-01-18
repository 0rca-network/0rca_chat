"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"

import { useParams, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
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
    History,
    X,
    CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePrivyWallet } from "@/hooks/use-privy-wallet"
import { Button } from "@/components/ui/button"
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { FluidDropdown, DropdownOption } from "@/components/ui/fluid-dropdown"
import { getAgents, executeOrchestration, getChatByHash, getChatMessages, saveMessage, Agent, Message } from "@/app/actions"
import { createFundedTaskFromSigner } from "@/lib/evm/vaultClient"
import Image from "next/image"
import { MainHeader } from "@/components/main-header"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"


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

    useEffect(() => {
        console.log("[DEBUG] ChatPage Mounted - Version: 13:00-F");
    }, []);

    const { walletAddress, activeWallet } = usePrivyWallet()
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [chatId, setChatId] = useState<string | null>(null)
    const [chatTitle, setChatTitle] = useState("Chat")

    const [orchestratorMode, setOrchestratorMode] = useState("auto")
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [agents, setAgents] = useState<Agent[]>([])
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const toggleAgent = (agentId: string) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        )
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    useEffect(() => {
        async function loadData() {
            try {
                const fetchedAgents = await getAgents()
                setAgents(fetchedAgents.map(a => ({ ...a, icon: Bot })))

                const chat = await getChatByHash(hash)
                if (chat) {
                    setChatId(chat.id)
                    setChatTitle(chat.title)

                    const history = await getChatMessages(chat.id)
                    setMessages(history)

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

        saveMessage(activeChatId, "user", content)

        startTransition(async () => {
            try {
                let response = await executeOrchestration(
                    content,
                    orchestratorMode as "auto" | "manual",
                    selectedAgents,
                    walletAddress || undefined
                )

                // --- ROBUST SIGNAL INTERCEPTION ---
                const rawResponse = response || "";

                if (rawResponse.includes("CHALLENGE_REQUIRED")) {
                    console.log("[Flow] Signal detected! Extracting JSON payload...");
                    try {
                        const start = rawResponse.indexOf("{");
                        const end = rawResponse.lastIndexOf("}");
                        if (start !== -1 && end !== -1 && end > start) {
                            const jsonStr = rawResponse.substring(start, end + 1);
                            const signalData = JSON.parse(jsonStr);

                            if (signalData.type === "CHALLENGE_REQUIRED") {
                                const { challenge, taskId, agentName } = signalData;
                                console.log(`[Flow] Payment required for agent ${agentName}. Task ID: ${taskId}`);

                                if (!activeWallet) {
                                    alert("Please connect your wallet first!");
                                    throw new Error("Wallet not connected.");
                                }

                                const ethProvider = await activeWallet.getEthereumProvider();

                                // Ensure correct chain (338 for Cronos zkEVM Testnet)
                                try {
                                    await ethProvider.request({
                                        method: 'wallet_switchEthereumChain',
                                        params: [{ chainId: '0x152' }],
                                    });
                                } catch (switchError) {
                                    console.log("[Flow] Chain switch failed or not supported by provider", switchError);
                                }

                                const browserProvider = new ethers.BrowserProvider(ethProvider);
                                const signer = await browserProvider.getSigner();

                                const proceed = confirm(`Agent ${agentName} requires a 0.1 USDC payment to fulfill this request.\n\nTask ID: ${taskId}\n\nProceed with on-chain funding?`);
                                if (!proceed) return;

                                console.log(`[Flow] funding Task ID ${taskId} on-chain via User Wallet...`);
                                try {
                                    const vault = "0xe7bad567ed213efE7Dd1c31DF554461271356F30";
                                    const usdc = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";

                                    await createFundedTaskFromSigner(vault, "0.1", signer, usdc, taskId);
                                    console.log(`[Flow] Task funding successful.`);
                                } catch (fundErr: any) {
                                    console.error("[Flow] Failed to fund task on-chain:", fundErr);
                                    const msg = fundErr?.reason || fundErr?.message || "Unknown error";
                                    alert(`Failed to fund task on-chain: ${msg}\n\nPlease ensure you have USDC and CRO for gas.`);
                                    throw fundErr;
                                }

                                console.log(`[Flow] Prompting for authorization signature...`);
                                const hexSig = await signer.signMessage(challenge);
                                // CRITICAL: Convert hex signature to base64 of bytes, NOT string
                                const b64Sig = ethers.encodeBase64(ethers.getBytes(hexSig));

                                console.log(`[Flow] Re-submitting to Orca Orchestrator...`);
                                response = await executeOrchestration(
                                    content,
                                    orchestratorMode as "auto" | "manual",
                                    selectedAgents,
                                    walletAddress || undefined,
                                    b64Sig,
                                    taskId
                                );
                                console.log(`[Flow] Re-submission successful.`);
                            }
                        }
                    } catch (err: any) {
                        console.error("[Flow] Error in x402 flow:", err);
                    }
                }

                const assistantMsg: Message = { role: "assistant", content: response };
                setMessages(prev => [...prev, assistantMsg]);
                saveMessage(activeChatId, "assistant", response);

            } catch (error: any) {
                console.error("Chat flow error:", error);
                setMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message || "Something went wrong."}` }]);
            } finally {
                setIsTyping(false);
            }
        });
    }

    const onPromptSend = (content: string) => handleSendMessage(content)

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white">
            <MainHeader title={chatTitle} />

            <div className="flex-1 overflow-hidden relative flex flex-col">
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

                                        <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white/40 hover:text-white/60 gap-2 h-7"
                                                >
                                                    <Bot className="w-3.5 h-3.5" />
                                                    <span className="text-xs">Agents</span>
                                                    {selectedAgents.length > 0 && (
                                                        <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs bg-violet-500/20 text-violet-300 rounded-full">
                                                            {selectedAgents.length}
                                                        </span>
                                                    )}
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-xl max-h-[85vh] bg-[#0A0A0B]/95 border-white/10 text-white flex flex-col p-0 overflow-hidden shadow-2xl backdrop-blur-xl rounded-3xl">
                                                <div className="p-6 pb-2 shrink-0">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <DialogTitle className="text-xl font-semibold tracking-tight">Select Agents</DialogTitle>
                                                        <div className="flex items-center gap-3">
                                                            <DialogClose asChild>
                                                                <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl px-4 py-2 text-sm font-medium transition-colors">Cancel</Button>
                                                            </DialogClose>
                                                            <DialogClose asChild>
                                                                <Button className="bg-white text-black hover:bg-white/90 rounded-xl px-6 py-2 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">Save</Button>
                                                            </DialogClose>
                                                        </div>
                                                    </div>

                                                    {selectedAgents.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="flex items-center justify-between mb-2 px-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-white/90">Added ({selectedAgents.length})</span>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none min-h-[60px]">
                                                                <AnimatePresence mode="popLayout">
                                                                    {agents.filter(a => selectedAgents.includes(a.id)).map(agent => (
                                                                        <motion.div
                                                                            key={agent.id}
                                                                            layout
                                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                                            className="relative group flex-shrink-0"
                                                                        >
                                                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-2 border-white/10 flex items-center justify-center transition-all group-hover:border-violet-500/50">
                                                                                <Bot className="w-6 h-6 text-white/80" />
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleAgent(agent.id);
                                                                                }}
                                                                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1A1A1B] border border-white/10 flex items-center justify-center text-white/60 hover:text-white shadow-lg"
                                                                            >
                                                                                <X size={10} strokeWidth={3} />
                                                                            </button>
                                                                        </motion.div>
                                                                    ))}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mb-2 px-1 gap-4">
                                                        <span className="text-sm font-semibold text-white/60 whitespace-nowrap">Agents ({agents.length})</span>
                                                        <div className="relative w-full">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                            <Input
                                                                placeholder="Search Agents"
                                                                className="bg-white/[0.03] border-white/5 rounded-xl pl-9 pr-4 h-9 text-sm focus-visible:ring-violet-500/50 placeholder:text-white/20"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
                                                    <div className="space-y-1">
                                                        {agents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map((agent) => {
                                                            const isSelected = selectedAgents.includes(agent.id);
                                                            return (
                                                                <motion.div
                                                                    key={agent.id}
                                                                    layout
                                                                    onClick={() => toggleAgent(agent.id)}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 group",
                                                                        isSelected
                                                                            ? "bg-white/[0.04]"
                                                                            : "hover:bg-white/[0.02]"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn(
                                                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                                            isSelected
                                                                                ? "bg-violet-500/20 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                                                                : "bg-white/[0.03] text-white/40 group-hover:bg-white/[0.05] group-hover:text-white/60"
                                                                        )}>
                                                                            <Bot className="w-6 h-6" />
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className={cn(
                                                                                "text-sm font-semibold transition-colors decoration-violet-500/50 underline-offset-4",
                                                                                isSelected ? "text-white underline" : "text-white/70 group-hover:text-white"
                                                                            )}>
                                                                                {agent.name}
                                                                            </span>
                                                                            <span className="text-[11px] text-white/30 font-medium group-hover:text-white/40 transition-colors">{agent.description}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                                        isSelected
                                                                            ? "bg-violet-500 border-violet-500 scale-110 shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                                                                            : "border-white/10 group-hover:border-white/20"
                                                                    )}>
                                                                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

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
