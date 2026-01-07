"use client";

import { usePrivyWallet } from "@/hooks/use-privy-wallet";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletConnectButton() {
    const { connect, disconnect, activeWallet, walletAddress } = usePrivyWallet();

    if (!activeWallet) {
        return (
            <Button
                onClick={connect}
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/10"
            >
                <Wallet className="size-4" />
                <span>Connect Wallet</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-violet-500/10 border-violet-500/20 text-white hover:bg-violet-500/20"
                >
                    <Wallet className="size-4 text-violet-400" />
                    <span className="truncate max-w-[120px]">{walletAddress}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/95 border-white/10 text-white">
                <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                    onClick={disconnect}
                    className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-400/10"
                >
                    <LogOut className="mr-2 size-4" />
                    <span>Disconnect</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
