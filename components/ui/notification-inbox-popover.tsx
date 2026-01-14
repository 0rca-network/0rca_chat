"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Bell,
    GitMerge,
    FileText,
    ClipboardCheck,
    Mail,
    MessageSquareQuote,
    AlertCircle,
    LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
    id: number;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    unread: boolean;
    icon: LucideIcon;
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        user: "Alicia Keys",
        action: "merged",
        target: "PR #105: Dark mode support",
        timestamp: "10 minutes ago",
        unread: true,
        icon: GitMerge,
    },
    {
        id: 2,
        user: "Daniel Green",
        action: "shared file",
        target: "Quarterly Report.pdf",
        timestamp: "30 minutes ago",
        unread: true,
        icon: FileText,
    },
    {
        id: 3,
        user: "Sophia Turner",
        action: "assigned you a task",
        target: "Marketing campaign brief",
        timestamp: "2 hours ago",
        unread: false,
        icon: ClipboardCheck,
    },
    {
        id: 4,
        user: "Michael Ross",
        action: "sent you a message",
        target: "Project feedback discussion",
        timestamp: "5 hours ago",
        unread: false,
        icon: Mail,
    },
    {
        id: 5,
        user: "Priya Sharma",
        action: "added a comment",
        target: "UX Review Notes",
        timestamp: "1 day ago",
        unread: false,
        icon: MessageSquareQuote,
    },
    {
        id: 6,
        user: "System",
        action: "alert",
        target: "Server downtime scheduled",
        timestamp: "3 days ago",
        unread: false,
        icon: AlertCircle,
    },
];

function NotificationInboxPopover() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const unreadCount = notifications.filter((n) => n.unread).length;
    const [tab, setTab] = useState("all");

    const filtered = tab === "unread" ? notifications.filter((n) => n.unread) : notifications;

    const markAsRead = (id: number) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="icon" variant="outline" className="relative group bg-transparent border-white/[0.05] hover:bg-white/[0.05] h-7 w-7 rounded-lg" aria-label="Open notifications">
                    <Bell size={16} strokeWidth={2} className="text-white/40 group-hover:text-white" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 min-w-4 h-4 p-0 flex items-center justify-center bg-violet-500 text-white border-black text-[10px]">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 bg-[#0A0A0B] border-white/10 shadow-2xl rounded-2xl overflow-hidden" align="end">
                {/* Header with Tabs + Mark All */}
                <Tabs value={tab} onValueChange={setTab}>
                    <div className="flex items-center justify-between border-b border-white/5 px-3 py-2 bg-white/[0.02]">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">All</TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">
                                Unread {unreadCount > 0 && <Badge className="ml-1 bg-violet-500/20 text-violet-300 border-none h-4 px-1">{unreadCount}</Badge>}
                            </TabsTrigger>
                        </TabsList>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-12 text-center text-sm text-white/20 font-mono">
                                No notifications
                            </div>
                        ) : (
                            filtered.map((n) => {
                                const Icon = n.icon;
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className="flex w-full items-start gap-3 border-b border-white/[0.03] px-4 py-4 text-left hover:bg-white/[0.02] transition-colors relative group"
                                    >
                                        <div className={cn(
                                            "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            n.unread ? "bg-violet-500/10 text-violet-400" : "bg-white/5 text-white/20"
                                        )}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p
                                                className={cn(
                                                    "text-xs leading-relaxed",
                                                    n.unread ? "font-semibold text-white" : "text-white/60"
                                                )}
                                            >
                                                <span className="text-white/40">{n.user}</span> {n.action}{" "}
                                                <span className="font-mono text-violet-400/90">{n.target}</span>
                                            </p>
                                            <p className="text-[10px] text-white/30 font-medium">{n.timestamp}</p>
                                        </div>
                                        {n.unread && (
                                            <span className="mt-1.5 inline-block size-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </Tabs>

                {/* Footer */}
                <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase font-black tracking-[0.1em] text-white/30 hover:text-white/60 hover:bg-white/[0.03] h-8">
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export { NotificationInboxPopover };
