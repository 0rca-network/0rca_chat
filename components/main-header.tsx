'use client';

import React, { useState } from 'react';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreditsModal } from '@/components/credits-modal';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useTokenBalance } from '@/hooks/use-token-balance';
import { NotificationInboxPopover } from '@/components/ui/notification-inbox-popover';
import { ProfilePopover } from '@/components/ui/profile-popover';

interface MainHeaderProps {
    title?: string;
    breadcrumb?: string;
}

export function MainHeader({ title = "Chat", breadcrumb }: MainHeaderProps) {
    const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
    const { walletAddress } = usePrivyWallet();
    const { formattedBalance, symbol, isLoading, refresh } = useTokenBalance();

    const displayAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : breadcrumb || "User";

    return (
        <>
            <header className="h-16 border-b border-white/[0.05] flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl sticky top-0 z-40 w-full transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-all duration-200">
                        <span className="text-white/30 hover:text-white/50 cursor-default transition-colors uppercase tracking-wider text-[10px]">{displayAddress}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/10" />
                        <span className="text-white/90">{title}</span>
                    </div>

                    <button className="flex items-center justify-center p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-200 group ml-2 antialiased">
                        <Plus className="w-3.5 h-3.5 text-white/40 group-hover:text-white/90 transition-colors" />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => setIsCreditsModalOpen(true)}
                            className="h-9 px-4 rounded-xl bg-violet-500/[0.08] border border-violet-500/20 flex items-center gap-2.5 hover:bg-violet-500/[0.15] hover:border-violet-500/30 transition-all duration-300 group shadow-[0_0_15px_rgba(139,92,246,0.05)]"
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] text-violet-400 font-black">{symbol}</span>
                            <div className="w-px h-3 bg-violet-500/20" />
                            <span className={cn("text-xs font-bold text-white group-hover:scale-105 transition-transform", isLoading && "animate-pulse")}>
                                {isLoading ? "..." : formattedBalance}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); refresh(); }}
                                className="p-0.5 hover:bg-white/10 rounded transition-colors"
                            >
                                <RefreshCw className={cn("w-3 h-3 text-violet-400/50 group-hover:text-violet-400 transition-colors", isLoading && "animate-spin")} />
                            </button>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 h-9 px-1 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <NotificationInboxPopover />
                        <div className="w-px h-4 bg-white/5 mx-1" />
                        <ProfilePopover />
                    </div>

                </div>
            </header>


            <CreditsModal isOpen={isCreditsModalOpen} onClose={() => setIsCreditsModalOpen(false)} />
        </>
    );
}
