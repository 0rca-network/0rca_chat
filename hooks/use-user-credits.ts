"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivyWallet } from "./use-privy-wallet";

interface UserCredits {
    balance: number;
    lifetimePurchased: number;
    lifetimeUsed: number;
    isLoading: boolean;
    error: string | null;
}

export function useUserCredits() {
    const { walletAddress } = usePrivyWallet();
    const [credits, setCredits] = useState<UserCredits>({
        balance: 0,
        lifetimePurchased: 0,
        lifetimeUsed: 0,
        isLoading: false,
        error: null,
    });

    const fetchCredits = useCallback(async () => {
        if (!walletAddress) {
            setCredits(prev => ({ ...prev, balance: 0, isLoading: false }));
            return;
        }

        setCredits(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch(`/api/credits?wallet=${walletAddress}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setCredits({
                balance: data.balance || 0,
                lifetimePurchased: data.lifetime_purchased || 0,
                lifetimeUsed: data.lifetime_used || 0,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            console.error("Failed to fetch credits:", error);
            setCredits(prev => ({
                ...prev,
                isLoading: false,
                error: error.message,
            }));
        }
    }, [walletAddress]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    return { ...credits, refresh: fetchCredits };
}
