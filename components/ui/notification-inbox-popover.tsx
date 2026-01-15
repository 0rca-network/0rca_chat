"use client";

import { useState, useEffect, useTransition } from "react";
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
    Bot,
    Sparkles,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    LucideIcon,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    Notification as NotificationType
} from "@/app/actions";

// Icon mapping for notification icons
const ICON_MAP: Record<string, LucideIcon> = {
    bell: Bell,
    bot: Bot,
    sparkles: Sparkles,
    info: Info,
    "check-circle": CheckCircle,
    "alert-circle": AlertCircle,
    "alert-triangle": AlertTriangle,
    "x-circle": XCircle,
    "git-merge": GitMerge,
    "file-text": FileText,
    "clipboard-check": ClipboardCheck,
    mail: Mail,
    "message-square-quote": MessageSquareQuote,
};

function getIconForNotification(iconName: string, type: string): LucideIcon {
    if (ICON_MAP[iconName]) return ICON_MAP[iconName];

    // Default icons based on type
    switch (type) {
        case 'success': return CheckCircle;
        case 'warning': return AlertTriangle;
        case 'error': return XCircle;
        case 'update': return Sparkles;
        default: return Bell;
    }
}

function NotificationInboxPopover() {
    const { walletAddress } = usePrivyWallet();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [tab, setTab] = useState("all");

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const filtered = tab === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

    useEffect(() => {
        async function loadNotifications() {
            setIsLoading(true);
            try {
                const data = await getNotifications(walletAddress || undefined);
                setNotifications(data);
            } catch (error) {
                console.error("Failed to load notifications:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadNotifications();
    }, [walletAddress]);

    const handleMarkAsRead = (id: string) => {
        if (!walletAddress) return;

        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );

        startTransition(async () => {
            await markNotificationAsRead(id, walletAddress);
        });
    };

    const handleMarkAllAsRead = () => {
        if (!walletAddress) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        startTransition(async () => {
            await markAllNotificationsAsRead(walletAddress);
        });
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
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
                                onClick={handleMarkAllAsRead}
                                disabled={isPending}
                                className="text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors disabled:opacity-50"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="px-3 py-12 text-center">
                                <Loader2 className="w-6 h-6 text-white/20 animate-spin mx-auto" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-3 py-12 text-center text-sm text-white/20 font-mono">
                                No notifications
                            </div>
                        ) : (
                            filtered.map((n) => {
                                const Icon = getIconForNotification(n.icon, n.type);
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className="flex w-full items-start gap-3 border-b border-white/[0.03] px-4 py-4 text-left hover:bg-white/[0.02] transition-colors relative group"
                                    >
                                        <div className={cn(
                                            "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            !n.is_read ? "bg-violet-500/10 text-violet-400" : "bg-white/5 text-white/20"
                                        )}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                !n.is_read ? "font-semibold text-white" : "text-white/60"
                                            )}>
                                                <span className="text-white/80">{n.title}</span>
                                            </p>
                                            <p className="text-[11px] text-white/40 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-white/30 font-medium">{formatTimestamp(n.created_at)}</p>
                                        </div>
                                        {!n.is_read && (
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
