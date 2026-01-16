"use client";

import { MainHeader } from "@/components/main-header";
import { motion } from "framer-motion";
import {
    Compass,
    TrendingUp,
    Sparkles,
    Zap,
    MessageSquare,
    Users,
    Star,
    ArrowRight,
    Bot,
    Code,
    Image as ImageIcon,
    FileText,
    Music,
    Brain
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FEATURED_CATEGORIES = [
    {
        id: "trending",
        name: "Trending",
        icon: TrendingUp,
        color: "from-rose-500 to-pink-600",
        description: "Most popular agents this week",
    },
    {
        id: "new",
        name: "New Arrivals",
        icon: Sparkles,
        color: "from-violet-500 to-indigo-600",
        description: "Recently added AI agents",
    },
    {
        id: "featured",
        name: "Editor's Pick",
        icon: Star,
        color: "from-amber-500 to-orange-600",
        description: "Hand-picked by our team",
    },
];

const AGENT_CATEGORIES = [
    { id: "coding", name: "Coding", icon: Code, count: 24 },
    { id: "writing", name: "Writing", icon: FileText, count: 18 },
    { id: "image", name: "Image Gen", icon: ImageIcon, count: 12 },
    { id: "music", name: "Music", icon: Music, count: 8 },
    { id: "chat", name: "Chat", icon: MessageSquare, count: 32 },
    { id: "analysis", name: "Analysis", icon: Brain, count: 15 },
];

const FEATURED_AGENTS = [
    {
        id: "1",
        name: "Code Assistant Pro",
        description: "Expert in multiple programming languages with code review capabilities",
        category: "Coding",
        uses: "12.5K",
        rating: 4.9,
        gradient: "from-violet-500 to-indigo-600",
    },
    {
        id: "2",
        name: "Creative Writer",
        description: "Generate stories, articles, and creative content with unique style",
        category: "Writing",
        uses: "8.2K",
        rating: 4.8,
        gradient: "from-emerald-500 to-teal-600",
    },
    {
        id: "3",
        name: "Data Analyst",
        description: "Analyze data, create visualizations, and generate insights",
        category: "Analysis",
        uses: "6.7K",
        rating: 4.7,
        gradient: "from-blue-500 to-cyan-600",
    },
    {
        id: "4",
        name: "Image Creator",
        description: "Generate stunning images from text descriptions",
        category: "Image Gen",
        uses: "15.3K",
        rating: 4.9,
        gradient: "from-pink-500 to-rose-600",
    },
];

export default function DiscoverPage() {
    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white overflow-hidden">
            <MainHeader title="Discover" />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Hero Section */}
                <div className="relative px-8 py-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Compass className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white">Discover AI Agents</h1>
                                <p className="text-white/50 text-sm">Explore and deploy powerful AI agents</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Featured Categories */}
                <div className="px-8 pb-8">
                    <div className="grid grid-cols-3 gap-4">
                        {FEATURED_CATEGORIES.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className={cn(
                                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br",
                                    category.color
                                )} style={{ opacity: 0.05 }} />

                                <div className={cn(
                                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                                    category.color
                                )}>
                                    <category.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                                <p className="text-sm text-white/40">{category.description}</p>

                                <ArrowRight className="absolute right-6 top-6 w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="px-8 pb-8">
                    <h2 className="text-lg font-bold text-white mb-4">Browse by Category</h2>
                    <div className="flex gap-2 flex-wrap">
                        {AGENT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                            >
                                <cat.icon className="w-4 h-4 text-white/40 group-hover:text-violet-400 transition-colors" />
                                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{cat.name}</span>
                                <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Agents */}
                <div className="px-8 pb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Featured Agents</h2>
                        <Link href="/agents" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {FEATURED_AGENTS.map((agent, index) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                        agent.gradient
                                    )}>
                                        <Bot className="w-7 h-7 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate">{agent.name}</h3>
                                            <span className="flex items-center gap-1 text-xs text-amber-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                {agent.rating}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/40 line-clamp-2 mb-3">{agent.description}</p>

                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-md">{agent.category}</span>
                                            <span className="text-xs text-white/30 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {agent.uses} uses
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
