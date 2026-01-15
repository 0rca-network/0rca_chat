"use client";

import { Suspense } from "react";
import { WalletGate } from "@/components/wallet-gate";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full w-full bg-[#030303]">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <WalletGate>
                {children}
            </WalletGate>
        </Suspense>
    );
}
