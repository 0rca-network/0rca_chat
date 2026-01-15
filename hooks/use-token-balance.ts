"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivyWallet } from "./use-privy-wallet";

// 0RCA Token on Cronos
const TOKEN_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";

// Cronos RPC endpoint
const RPC_URL = "https://evm.cronos.org";

interface TokenBalanceState {
    balance: string;
    formattedBalance: string;
    symbol: string;
    decimals: number;
    isLoading: boolean;
    error: string | null;
}

// Helper to encode ERC-20 function calls
function encodeBalanceOf(address: string): string {
    // balanceOf(address) = 0x70a08231 + address padded to 32 bytes
    const cleanAddress = address.toLowerCase().replace("0x", "");
    return `0x70a08231000000000000000000000000${cleanAddress}`;
}

// Helper to make JSON-RPC calls
async function jsonRpcCall(method: string, params: any[]): Promise<any> {
    const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method,
            params,
        }),
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.result;
}

// Helper to format balance with decimals
function formatBalance(hexBalance: string, decimals: number): string {
    const balanceBigInt = BigInt(hexBalance);
    const divisor = BigInt(10 ** decimals);
    const integerPart = balanceBigInt / divisor;
    const fractionalPart = balanceBigInt % divisor;

    // Format with 2 decimal places
    const fractionalStr = fractionalPart.toString().padStart(decimals, "0").slice(0, 2);
    const formatted = `${integerPart.toLocaleString()}.${fractionalStr}`;

    // Clean up trailing zeros
    return parseFloat(formatted).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
}

export function useTokenBalance() {
    const { walletAddress } = usePrivyWallet();
    const [state, setState] = useState<TokenBalanceState>({
        balance: "0",
        formattedBalance: "0",
        symbol: "0RCA",
        decimals: 18,
        isLoading: false,
        error: null,
    });

    const fetchBalance = useCallback(async () => {
        if (!walletAddress) {
            setState(prev => ({ ...prev, balance: "0", formattedBalance: "0", isLoading: false }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Call balanceOf on the token contract
            const balanceHex = await jsonRpcCall("eth_call", [
                {
                    to: TOKEN_ADDRESS,
                    data: encodeBalanceOf(walletAddress),
                },
                "latest",
            ]);

            // Default to 18 decimals for most ERC-20 tokens
            const decimals = 18;
            const formatted = formatBalance(balanceHex, decimals);

            setState({
                balance: BigInt(balanceHex).toString(),
                formattedBalance: formatted,
                symbol: "0RCA",
                decimals,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            console.error("Failed to fetch token balance:", error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || "Failed to fetch balance",
            }));
        }
    }, [walletAddress]);

    useEffect(() => {
        fetchBalance();

        // Refresh balance every 30 seconds
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    return { ...state, refresh: fetchBalance, tokenAddress: TOKEN_ADDRESS };
}
