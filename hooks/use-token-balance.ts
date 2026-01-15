"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivyWallet } from "./use-privy-wallet";

// devUSDC.e Token on Cronos Testnet
const TOKEN_ADDRESS = "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0";

// Cronos Testnet RPC endpoint
const RPC_URL = "https://evm-t3.cronos.org";

interface TokenBalanceState {
    balance: string;
    formattedBalance: string;
    rawBalance: bigint;
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
function formatBalance(hexBalance: string, decimals: number): { formatted: string; raw: bigint } {
    const balanceBigInt = BigInt(hexBalance || "0x0");
    const divisor = BigInt(10 ** decimals);
    const integerPart = balanceBigInt / divisor;
    const fractionalPart = balanceBigInt % divisor;

    // Format with 2 decimal places
    const fractionalStr = fractionalPart.toString().padStart(decimals, "0").slice(0, 2);
    const formatted = `${integerPart.toLocaleString()}.${fractionalStr}`;

    // Clean up trailing zeros
    const cleanFormatted = parseFloat(formatted).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });

    return { formatted: cleanFormatted, raw: balanceBigInt };
}

export function useTokenBalance() {
    const { walletAddress } = usePrivyWallet();
    const [state, setState] = useState<TokenBalanceState>({
        balance: "0",
        formattedBalance: "0.00",
        rawBalance: BigInt(0),
        symbol: "devUSDC.e",
        decimals: 6, // USDC typically has 6 decimals
        isLoading: false,
        error: null,
    });

    const fetchBalance = useCallback(async () => {
        if (!walletAddress) {
            setState(prev => ({
                ...prev,
                balance: "0",
                formattedBalance: "0.00",
                rawBalance: BigInt(0),
                isLoading: false
            }));
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

            // devUSDC.e uses 6 decimals like regular USDC
            const decimals = 6;
            const { formatted, raw } = formatBalance(balanceHex, decimals);

            setState({
                balance: raw.toString(),
                formattedBalance: formatted,
                rawBalance: raw,
                symbol: "devUSDC.e",
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

        // Refresh balance every 15 seconds
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    return {
        ...state,
        refresh: fetchBalance,
        tokenAddress: TOKEN_ADDRESS,
        faucetUrl: "https://faucet.cronos.org/"
    };
}
