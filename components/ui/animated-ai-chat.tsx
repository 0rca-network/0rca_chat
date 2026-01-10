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
    Zap,
    Code2,
    Rocket,
    Layers,
    Palette,
    CircleUserRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
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

export function AnimatedAIChat() {
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [inputFocused, setInputFocused] = useState(false);

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

        setMessages(prev => [...prev, { role: "user", content }]);
        setIsTyping(true);

        startTransition(async () => {
            try {
                const response = await executeOrchestration(
                    content,
                    orchestratorMode as "auto" | "manual",
                    selectedAgents
                );
                setMessages(prev => [...prev, { role: "assistant", content: response }]);
            } catch (error) {
                setMessages(prev => [...prev, { role: "assistant", content: "Error executing request." }]);
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
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
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
                    {messages.length === 0 ? (
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
                    ) : (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "p-4 rounded-2xl text-sm leading-relaxed",
                                        msg.role === "assistant"
                                            ? "bg-white/[0.05] border border-white/10 text-white/90"
                                            : "bg-violet-500/10 border border-violet-500/20 text-white/90 ml-auto max-w-[80%]"
                                    )}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="flex items-center gap-2 mb-2 text-xs text-white/50 uppercase tracking-wider font-semibold">
                                            <Bot className="w-3 h-3" />
                                            <span>Orchestrator</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap font-mono">{msg.content}</div>
                                </motion.div>
                            ))}
                        </div>
                    )}


                    <motion.div
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Orchestrator Controls */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                            <Select value={orchestratorMode} onValueChange={setOrchestratorMode}>
                                <SelectTrigger className="w-[180px] bg-transparent border-white/10 text-white/90 focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10 text-white">
                                    <SelectItem value="auto">Auto Orchestrator</SelectItem>
                                    <SelectItem value="manual">Manual Swarm</SelectItem>
                                </SelectContent>
                            </Select>

                            <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-white/90 gap-2"
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
                                <DialogContent className="sm:max-w-3xl bg-black/90 border-white/10 text-white aspect-[4/3] flex flex-col p-6 overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <DialogTitle className="text-xl font-medium">Select Agents</DialogTitle>
                                        <div className="flex items-center gap-2">
                                            <DialogClose asChild>
                                                <Button variant="ghost" className="text-white/60 hover:text-white">Cancel</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button className="bg-white text-black hover:bg-white/90">Save</Button>
                                            </DialogClose>
                                        </div>
                                    </div>

                                    {/* Selected Agents View */}
                                    <div className="h-32 mb-6 border border-white/10 rounded-xl bg-white/[0.02] p-4 flex items-center gap-4 overflow-x-auto">
                                        {selectedAgents.length === 0 ? (
                                            <div className="w-full text-center text-white/30 text-sm">
                                                No agents selected
                                            </div>
                                        ) : (
                                            agents.filter(a => selectedAgents.includes(a.id)).map(agent => (
                                                <div key={agent.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                                                        <agent.icon className="w-8 h-8 text-white/80" />
                                                    </div>
                                                    <span className="text-xs text-white/60">{agent.name}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Agent Grid */}
                                    <div className="flex-1 overflow-y-auto pr-2">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {agents.map((agent) => {
                                                const isSelected = selectedAgents.includes(agent.id);
                                                return (
                                                    <div
                                                        key={agent.id}
                                                        onClick={() => toggleAgent(agent.id)}
                                                        className={cn(
                                                            "group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                                                            isSelected
                                                                ? "bg-violet-500/10 border-violet-500/50"
                                                                : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className={cn(
                                                                "p-2 rounded-lg transition-colors",
                                                                isSelected ? "bg-violet-500/20 text-violet-200" : "bg-white/5 text-white/60"
                                                            )}>
                                                                <agent.icon className="w-5 h-5" />
                                                            </div>
                                                            <div className={cn(
                                                                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                                                                isSelected
                                                                    ? "bg-violet-500 border-violet-500"
                                                                    : "border-white/20 group-hover:border-white/40"
                                                            )}>
                                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                            </div>
                                                        </div>
                                                        <div className="font-medium text-sm text-white/90 mb-0.5">{agent.name}</div>
                                                        <div className="text-[10px] text-white/50 leading-tight">{agent.description}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="p-4">
                            <PromptInputBox
                                onSend={handleSendMessage}
                                isLoading={isPending}
                            />

                            {/* Quick Actions */}
                            <div className="flex items-center justify-center flex-wrap gap-2 mt-4 pb-2">
                                <QuickAction icon={<Code2 className="w-3.5 h-3.5" />} label="Generate Code" />
                                <QuickAction icon={<Rocket className="w-3.5 h-3.5" />} label="Launch App" />
                                <QuickAction icon={<Layers className="w-3.5 h-3.5" />} label="UI components" />
                                <QuickAction icon={<Palette className="w-3.5 h-3.5" />} label="Theme ideas" />
                                <QuickAction icon={<CircleUserRound className="w-3.5 h-3.5" />} label="User Dashboard" />
                                <QuickAction icon={<MonitorIcon className="w-3.5 h-3.5" />} label="Landing Page" />
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            <AnimatePresence>
                {isTyping && (
                    <motion.div
                        className="fixed bottom-8 mx-auto transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-center">
                                <span className="text-xs font-medium text-white/90 mb-0.5">zap</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <span>Thinking</span>
                                <TypingDots />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {inputFocused && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}



interface QuickActionProps {
    icon: React.ReactNode;
    label: string;
}

function QuickAction({ icon, label }: QuickActionProps) {
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

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center gap-2">
                {icon}
                <span className="text-xs relative z-10">{label}</span>
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = rippleKeyframes;
    document.head.appendChild(style);
}
