"use client";

import { MainHeader } from "@/components/main-header";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    Bot,
    Search,
    Filter,
    Star,
    Users,
    Zap,
    MessageSquare,
    Plus,
    ArrowRight,
    Code,
    FileText,
    Image as ImageIcon,
    Music,
    Brain,
    Sparkles,
    Grid3X3,
    List,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
    { id: "all", name: "All Agents", icon: Grid3X3 },
    { id: "coding", name: "Coding", icon: Code },
    { id: "writing", name: "Writing", icon: FileText },
    { id: "image", name: "Image Gen", icon: ImageIcon },
    { id: "music", name: "Music", icon: Music },
    { id: "chat", name: "Chat", icon: MessageSquare },
    { id: "analysis", name: "Analysis", icon: Brain },
];

const AGENTS = [
    {
        id: "1",
        name: "Code Assistant Pro",
        description: "Expert in multiple programming languages. Helps with code review, debugging, and architecture decisions.",
        category: "coding",
        uses: "12.5K",
        rating: 4.9,
        gradient: "from-violet-500 to-indigo-600",
        tags: ["Python", "JavaScript", "TypeScript"],
        featured: true,
    },
    {
        id: "2",
        name: "Creative Writer",
        description: "Generate stories, articles, and creative content with unique style and voice.",
        category: "writing",
        uses: "8.2K",
        rating: 4.8,
        gradient: "from-emerald-500 to-teal-600",
        tags: ["Stories", "Articles", "Copywriting"],
        featured: true,
    },
    {
        id: "3",
        name: "Data Analyst",
        description: "Analyze data, create visualizations, and generate actionable insights from your datasets.",
        category: "analysis",
        uses: "6.7K",
        rating: 4.7,
        gradient: "from-blue-500 to-cyan-600",
        tags: ["Charts", "Statistics", "Reports"],
        featured: false,
    },
    {
        id: "4",
        name: "Image Creator",
        description: "Generate stunning images from text descriptions using advanced AI models.",
        category: "image",
        uses: "15.3K",
        rating: 4.9,
        gradient: "from-pink-500 to-rose-600",
        tags: ["Art", "Illustrations", "Design"],
        featured: true,
    },
    {
        id: "5",
        name: "Music Composer",
        description: "Create original music compositions, melodies, and audio content.",
        category: "music",
        uses: "3.1K",
        rating: 4.6,
        gradient: "from-purple-500 to-fuchsia-600",
        tags: ["Melodies", "Beats", "Lyrics"],
        featured: false,
    },
    {
        id: "6",
        name: "Chat Companion",
        description: "Engaging conversational AI for casual chat, advice, and companionship.",
        category: "chat",
        uses: "22.8K",
        rating: 4.8,
        gradient: "from-amber-500 to-orange-600",
        tags: ["Casual", "Support", "Fun"],
        featured: true,
    },
    {
        id: "7",
        name: "SQL Expert",
        description: "Master of database queries, optimization, and data modeling.",
        category: "coding",
        uses: "5.4K",
        rating: 4.7,
        gradient: "from-cyan-500 to-blue-600",
        tags: ["SQL", "Database", "Optimization"],
        featured: false,
    },
    {
        id: "8",
        name: "Research Assistant",
        description: "Help with academic research, citations, and paper summarization.",
        category: "analysis",
        uses: "4.2K",
        rating: 4.6,
        gradient: "from-indigo-500 to-purple-600",
        tags: ["Research", "Academic", "Papers"],
        featured: false,
    },
];

export default function AgentsPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filteredAgents = AGENTS.filter(agent => {
        const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white overflow-hidden">
            <MainHeader title="AI Agents" />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="px-8 py-8 border-b border-white/[0.05]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-1">AI Agents</h1>
                            <p className="text-white/40 text-sm">Deploy and interact with specialized AI agents</p>
                        </div>
                        <Button className="bg-violet-600 hover:bg-violet-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Agent
                        </Button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                                placeholder="Search agents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/[0.03] border-white/10 focus:border-violet-500/50"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-1 border border-white/[0.05]">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-2 rounded-md transition-colors",
                                    viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                )}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-2 rounded-md transition-colors",
                                    viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex">
                    {/* Sidebar Categories */}
                    <div className="w-56 border-r border-white/[0.05] p-4 flex-shrink-0">
                        <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3 px-2">Categories</h3>
                        <div className="space-y-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                                        selectedCategory === cat.id
                                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                            : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    <span className="font-medium">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agents Grid */}
                    <div className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-white/40">
                                Showing <span className="text-white font-medium">{filteredAgents.length}</span> agents
                            </p>
                        </div>

                        <div className={cn(
                            "grid gap-4",
                            viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                        )}>
                            <AnimatePresence mode="popLayout">
                                {filteredAgents.map((agent, index) => (
                                    <motion.div
                                        key={agent.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "group relative rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer overflow-hidden",
                                            viewMode === "list" ? "p-4" : "p-5"
                                        )}
                                    >
                                        {agent.featured && (
                                            <div className="absolute top-3 right-3">
                                                <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                                                    <Sparkles className="w-3 h-3" />
                                                    Featured
                                                </span>
                                            </div>
                                        )}

                                        <div className={cn(
                                            "flex gap-4",
                                            viewMode === "list" ? "items-center" : "flex-col"
                                        )}>
                                            <div className={cn(
                                                "rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                                agent.gradient,
                                                viewMode === "list" ? "w-12 h-12" : "w-14 h-14"
                                            )}>
                                                <Bot className={cn(
                                                    "text-white",
                                                    viewMode === "list" ? "w-6 h-6" : "w-7 h-7"
                                                )} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white truncate">{agent.name}</h3>
                                                    <span className="flex items-center gap-1 text-xs text-amber-400">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        {agent.rating}
                                                    </span>
                                                </div>

                                                <p className={cn(
                                                    "text-sm text-white/40 mb-3",
                                                    viewMode === "list" ? "line-clamp-1" : "line-clamp-2"
                                                )}>
                                                    {agent.description}
                                                </p>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {agent.tags.slice(0, viewMode === "list" ? 2 : 3).map((tag) => (
                                                        <span key={tag} className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    <span className="text-xs text-white/30 flex items-center gap-1 ml-auto">
                                                        <Users className="w-3 h-3" />
                                                        {agent.uses}
                                                    </span>
                                                </div>
                                            </div>

                                            {viewMode === "list" && (
                                                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                                                    Deploy <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            )}
                                        </div>

                                        {viewMode === "grid" && (
                                            <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                                                <span className="text-xs text-white/30 flex items-center gap-1">
                                                    <Zap className="w-3 h-3" />
                                                    Ready to deploy
                                                </span>
                                                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 h-8 px-3">
                                                    Use <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredAgents.length === 0 && (
                            <div className="text-center py-16">
                                <Bot className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white/60 mb-2">No agents found</h3>
                                <p className="text-sm text-white/30">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
