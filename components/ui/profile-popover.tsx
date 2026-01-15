"use client";

import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    UserCircle,
    LogOut,
    ExternalLink,
    Wallet,
    Copy,
    Check,
    Settings,
    Shield,
    CreditCard
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ProfilePopover() {
    const { walletAddress } = usePrivyWallet();
    const { logout } = usePrivy();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const copyToClipboard = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const navigateTo = (path: string) => {
        setIsOpen(false);
        router.push(path);
    };

    const truncatedAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : "Not Connected";

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all group">
                    <UserCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#0A0A0B] border-white/10 shadow-2xl rounded-2xl overflow-hidden" align="end">
                {/* Profile Header */}
                <div className="p-5 border-b border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                            <UserCircle className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-none mb-1">My Account</span>
                            <div className="flex items-center gap-1.5 p-1 px-2 rounded-full bg-white/[0.03] border border-white/[0.05] w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="group relative">
                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.05] hover:border-white/10 transition-all text-left"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Wallet Address</span>
                                <span className="text-xs font-mono text-white/90">{truncatedAddress}</span>
                            </div>
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />}
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="p-2 space-y-1">
                    <ProfileMenuItem
                        icon={CreditCard}
                        label="Billing & Credits"
                        onClick={() => navigateTo('/settings/billing')}
                    />
                    <ProfileMenuItem
                        icon={Shield}
                        label="Security & Privacy"
                        onClick={() => navigateTo('/settings/security')}
                    />
                    <ProfileMenuItem
                        icon={Settings}
                        label="User Settings"
                        onClick={() => navigateTo('/settings/profile')}
                    />
                </div>

                {/* Footer Actions */}
                <div className="p-2 mt-2 bg-white/[0.01] border-t border-white/5 flex flex-col gap-1">
                    <button
                        onClick={() => {
                            if (walletAddress) {
                                window.open(`https://cronoscan.com/address/${walletAddress}`, '_blank');
                            }
                        }}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold group"
                    >
                        <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                        <span>View on Explorer</span>
                    </button>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-semibold group"
                    >
                        <LogOut className="w-4 h-4 text-red-400/40 group-hover:text-red-400/60" />
                        <span>Disconnect Wallet</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function ProfileMenuItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm group"
        >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-all">
                <Icon className="w-4 h-4" />
            </div>
            <span className="font-medium">{label}</span>
        </button>
    );
}
