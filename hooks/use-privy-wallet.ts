"use client";

import { useConnectWallet, useWallets } from "@privy-io/react-auth";

export function usePrivyWallet() {
    const { connectWallet } = useConnectWallet();
    const { wallets } = useWallets();
    const activeWallet = wallets?.[0];

    const connect = () => {
        connectWallet({
            walletList: ["metamask", "wallet_connect", "coinbase_wallet", "rainbow"],
        });
    };

    const disconnect = async () => {
        if (activeWallet) {
            await activeWallet.disconnect();
        }
    }

    return {
        connect,
        disconnect,
        activeWallet,
        walletAddress: activeWallet?.address,
    };
}
