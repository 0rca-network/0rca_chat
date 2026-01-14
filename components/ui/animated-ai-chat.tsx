"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    Bot,
    CircleUserRound,
    Cpu,
    Zap,
    Code2,
    Rocket,
    Layers,
    Palette,
    Search,
    X,
    CheckCircle2,
    Circle,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { FluidDropdown, DropdownOption } from "@/components/ui/fluid-dropdown";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { getAgents, executeOrchestration } from "@/app/actions"
import { MainHeader } from "@/components/main-header"
import { useRouter } from "next/navigation";
import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { createChat, saveMessage } from "@/app/actions";

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

const AVAILABLE_AGENTS: Agent[] = [];

const ORCHESTRATOR_OPTIONS: DropdownOption[] = [
    { id: "auto", label: "Auto Orchestrator", icon: Bot, color: "#A06CD5" },
    { id: "manual", label: "Manual Swarm", icon: Cpu, color: "#45B7D1" },
];

export function AnimatedAIChat() {
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { walletAddress } = usePrivyWallet();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [inputFocused, setInputFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Agent Selection State
    const [orchestratorMode, setOrchestratorMode] = useState("auto");
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);

    // Dynamic State
    const [agents, setAgents] = useState<Agent[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        async function loadAgents() {
            try {
                const fetched = await getAgents();
                // Map to UI format with default icon
                const uiAgents = fetched.map(a => ({
                    ...a,
                    icon: Bot // Default icon
                }));
                setAgents(uiAgents);
            } catch (e) {
                console.error("Failed to load agents", e);
            }
        }
        loadAgents();
    }, []);

    const handleSendMessage = async (content: string, files?: File[]) => {
        if (!content.trim() && (!files || files.length === 0)) return;

        // Validation for Manual Mode
        if (orchestratorMode === 'manual' && selectedAgents.length === 0) {
            alert("Please select at least one agent for Manual Swarm mode.");
            setIsAgentDialogOpen(true);
            return;
        }

        if (!walletAddress) {
            alert("Please connect your wallet to start a chat.");
            return;
        }

        startTransition(async () => {
            try {
                setIsTyping(true);
                // 1. Create a new chat for this initial message
                const hash = await createChat(walletAddress, content.substring(0, 30) + (content.length > 30 ? "..." : ""));

                // 2. Redirect with message
                router.push(`/c/${hash}?firstMsg=${encodeURIComponent(content)}`);

            } catch (error) {
                console.error("Failed to start chat:", error);
                alert("Failed to start chat. Please try again.");
            } finally {
                setIsTyping(false);
            }
        });
    };

    const toggleAgent = (agentId: string) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    return (
        <div className="min-h-screen flex flex-col w-full bg-transparent overflow-hidden relative">
            <MainHeader title="Home" />

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                    <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/20 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
                </div>

                <div className="w-full max-w-2xl mx-auto relative">
                    <motion.div
                        className="relative z-10 space-y-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="text-center space-y-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                                    How can I help today?
                                </h1>
                                <motion.div
                                    className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                />
                            </motion.div>
                            <motion.p
                                className="text-sm text-white/40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Type a command or ask a question
                            </motion.p>
                        </div>

                        <div className="w-full max-w-2xl mx-auto relative">
                            <PromptInputBox
                                onSend={handleSendMessage}
                                isLoading={isPending}
                                header={
                                    <div className="flex items-center justify-between py-1">
                                        <FluidDropdown
                                            value={orchestratorMode}
                                            onChange={setOrchestratorMode}
                                            options={ORCHESTRATOR_OPTIONS}
                                            className="w-[200px]"
                                        />

                                        <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="bg-transparent hover:bg-white/5 text-white/70 hover:text-white/90 gap-2 h-8"
                                                >
                                                    <Bot className="w-4 h-4" />
                                                    <span>Agents</span>
                                                    {selectedAgents.length > 0 && (
                                                        <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs bg-violet-500/20 text-violet-300 rounded-full">
                                                            {selectedAgents.length}
                                                        </span>
                                                    )}
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-xl bg-[#0A0A0B]/95 border-white/10 text-white flex flex-col p-0 overflow-hidden shadow-2xl backdrop-blur-xl rounded-3xl">
                                                <div className="p-6 pb-2">
                                                    <div className="flex items-center justify-between mb-6">
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

                                                    <div className="mb-6">
                                                        <div className="flex items-center justify-between mb-3 px-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-white/90">Added ({selectedAgents.length})</span>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 overflow-x-auto py-2 scrollbar-none min-h-[80px]">
                                                            <AnimatePresence mode="popLayout">
                                                                {selectedAgents.length === 0 ? (
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="w-full h-16 flex items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01]"
                                                                    >
                                                                        <span className="text-xs text-white/20">No agents selected yet</span>
                                                                    </motion.div>
                                                                ) : (
                                                                    agents.filter(a => selectedAgents.includes(a.id)).map(agent => (
                                                                        <motion.div
                                                                            key={agent.id}
                                                                            layout
                                                                            initial={{ opacity: 0, scale: 0.8, x: -20 }}
                                                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                                                            className="relative group flex-shrink-0"
                                                                        >
                                                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-2 border-white/10 flex items-center justify-center transition-all group-hover:border-violet-500/50 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                                                                                <agent.icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleAgent(agent.id);
                                                                                }}
                                                                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1A1A1B] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2A2A2B] transition-all hover:scale-110 shadow-lg"
                                                                            >
                                                                                <X size={12} strokeWidth={3} />
                                                                            </button>
                                                                        </motion.div>
                                                                    ))
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mb-4 px-1">
                                                        <span className="text-sm font-semibold text-white/60">Agents ({agents.length})</span>
                                                        <div className="relative w-full max-w-[240px]">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                            <Input
                                                                placeholder="Search Agents"
                                                                className="bg-white/[0.03] border-white/5 rounded-xl pl-9 pr-4 h-9 text-sm focus-visible:ring-violet-500/50 transition-all placeholder:text-white/20"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-thumb-white/10">
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
                                                                            <agent.icon className="w-6 h-6" />
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
                                }
                            />

                            <div className="flex items-center justify-center flex-wrap gap-2 mt-6 pb-2">
                                <QuickAction icon={<Code2 className="w-3.5 h-3.5" />} label="Generate Code" />
                                <QuickAction icon={<Rocket className="w-3.5 h-3.5" />} label="Launch App" />
                                <QuickAction icon={<Layers className="w-3.5 h-3.5" />} label="UI components" />
                                <QuickAction icon={<Palette className="w-3.5 h-3.5" />} label="Theme ideas" />
                                <QuickAction icon={<CircleUserRound className="w-3.5 h-3.5" />} label="User Dashboard" />
                                <QuickAction icon={<MonitorIcon className="w-3.5 h-3.5" />} label="Landing Page" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {isTyping && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <div className="backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05] flex items-center gap-3">
                        <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <span>Thinking...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full border-white/5 bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/10 hover:border-white/10 h-8 px-3"
        >
            {icon}
            <span className="text-[11px] font-medium">{label}</span>
        </Button>
    );
}
