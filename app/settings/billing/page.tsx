"use client";

import { MainHeader } from "@/components/main-header";
import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, History, ExternalLink, Wallet } from "lucide-react";
import { useState } from "react";
import { CreditsModal } from "@/components/credits-modal";

export default function BillingPage() {
    const { walletAddress } = usePrivyWallet();
    const { formattedBalance, symbol, isLoading } = useTokenBalance();
    const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);

    const transactions = [
        { id: 1, type: "Purchase", amount: "+1,000", date: "Jan 15, 2026", status: "Completed" },
        { id: 2, type: "Usage", amount: "-50", date: "Jan 14, 2026", status: "Completed" },
        { id: 3, type: "Subscription", amount: "-299", date: "Jan 01, 2026", status: "Active" },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#030303] text-white">
            <MainHeader title="Billing & Credits" />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Billing & Credits</h1>
                        <p className="text-white/40 text-sm">Manage your credits and view transaction history.</p>
                    </div>

                    {/* Balance Card */}
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-violet-400 font-bold mb-1">Current Balance</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white">
                                        {isLoading ? "..." : formattedBalance}
                                    </span>
                                    <span className="text-lg text-violet-400 font-bold">{symbol}</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                                <Wallet className="w-8 h-8 text-violet-400" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setIsCreditsModalOpen(true)}
                                className="bg-violet-600 hover:bg-violet-500 text-white flex-1"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Buy Credits
                            </Button>
                            <Button
                                variant="outline"
                                className="border-violet-500/30 bg-transparent hover:bg-violet-500/10"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-violet-400" />
                            Payment Methods
                        </h2>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold">
                                        ETH
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Connected Wallet</p>
                                        <p className="text-xs text-white/40 font-mono">
                                            {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : "Not connected"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">Primary</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div>
                        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-violet-400" />
                            Recent Transactions
                        </h2>
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between hover:bg-white/[0.04] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.amount.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'
                                            }`}>
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{tx.type}</p>
                                            <p className="text-xs text-white/40">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-white/60'
                                            }`}>
                                            {tx.amount} {symbol}
                                        </p>
                                        <p className="text-[10px] text-white/30 uppercase">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <CreditsModal isOpen={isCreditsModalOpen} onClose={() => setIsCreditsModalOpen(false)} />
        </div>
    );
}
