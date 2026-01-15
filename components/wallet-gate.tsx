"use client";

import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { Button } from "@/components/ui/button";
import { Wallet, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface WalletGateProps {
    children: React.ReactNode;
}

export function WalletGate({ children }: WalletGateProps) {
    const { walletAddress, connect } = usePrivyWallet();

    if (!walletAddress) {
        return (
            <div className="flex flex-col h-full w-full bg-[#030303] text-white items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md px-6"
                >
                    <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                        <Lock className="w-10 h-10 text-violet-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h1>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Please connect your wallet to access this page. Your wallet is required for authentication and to manage your settings.
                    </p>

                    <Button
                        onClick={connect}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all"
                    >
                        <Wallet className="w-5 h-5 mr-3" />
                        Connect Wallet
                    </Button>

                    <p className="text-white/20 text-xs mt-6">
                        Supports MetaMask, WalletConnect, Coinbase Wallet, and more
                    </p>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
