'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePrivyWallet } from '@/hooks/use-privy-wallet';
import { useTokenBalance } from '@/hooks/use-token-balance';
import {
    Coins,
    ExternalLink,
    Wallet,
    RefreshCw,
    Copy,
    Check,
    Droplets,
    ArrowRight,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
    const { walletAddress, connect } = usePrivyWallet();
    const { formattedBalance, symbol, isLoading, refresh, faucetUrl, tokenAddress } = useTokenBalance();
    const [copied, setCopied] = useState(false);

    const copyTokenAddress = () => {
        navigator.clipboard.writeText(tokenAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-[#0A0A0B] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="relative p-6 pb-4">
                    <div className="absolute top-0 left-0 w-full h-32 overflow-hidden z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/10" />
                    </div>
                    <div className="relative z-10">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <Coins className="w-5 h-5 text-emerald-400" />
                                </div>
                                Your Balance
                            </DialogTitle>
                            <DialogDescription className="text-white/50 mt-2">
                                Credits are powered by {symbol} on Cronos Testnet
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                {/* Balance Display */}
                <div className="px-6 pb-4">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white/40 text-xs uppercase tracking-wider font-bold">Current Balance</p>
                            <button
                                onClick={refresh}
                                disabled={isLoading}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <RefreshCw className={cn("w-4 h-4 text-emerald-400", isLoading && "animate-spin")} />
                            </button>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={cn("text-4xl font-black text-white", isLoading && "animate-pulse")}>
                                {isLoading ? "..." : formattedBalance}
                            </span>
                            <span className="text-lg text-emerald-400 font-bold">{symbol}</span>
                        </div>
                        <p className="text-white/30 text-xs mt-2">≈ ${formattedBalance} USD (1:1 with USDC)</p>
                    </div>
                </div>

                {/* Token Contract Info */}
                <div className="px-6 pb-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-1">Token Contract</p>
                                <p className="text-xs font-mono text-white/60">
                                    {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}
                                </p>
                            </div>
                            <button
                                onClick={copyTokenAddress}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-white/40" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Get devUSDC.e Section */}
                <div className="px-6 pb-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <Droplets className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-white mb-1">Get Test Tokens</h3>
                                <p className="text-white/50 text-sm mb-4">
                                    Use the Cronos Faucet to get free {symbol} tokens for testing.
                                    These tokens are used as credits for premium features.
                                </p>

                                {!walletAddress ? (
                                    <Button
                                        onClick={connect}
                                        className="w-full bg-blue-600 hover:bg-blue-500 h-11"
                                    >
                                        <Wallet className="w-4 h-4 mr-2" />
                                        Connect Wallet First
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => window.open(faucetUrl, '_blank')}
                                        className="w-full bg-blue-600 hover:bg-blue-500 h-11"
                                    >
                                        <Droplets className="w-4 h-4 mr-2" />
                                        Open Cronos Faucet
                                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="px-6 pb-6">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-white/50 leading-relaxed">
                            <span className="text-amber-400 font-semibold">Development Mode:</span> This is using Cronos Testnet.
                            Tokens have no real value and are for testing purposes only.
                        </div>
                    </div>
                </div>

                {/* How Credits Work */}
                <div className="p-6 bg-white/[0.01] border-t border-white/[0.05]">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">How Credits Work</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-white/60">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">1</div>
                            <span>Get {symbol} from the faucet</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">2</div>
                            <span>Your wallet balance = Your credits</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">3</div>
                            <span>Use credits to subscribe to Premium</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
