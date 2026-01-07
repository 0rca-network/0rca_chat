"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error("Privy App ID is missing. Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env file.");
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="text-red-500">
                Configuration Error: NEXT_PUBLIC_PRIVY_APP_ID is missing.
            </div>
        </div>
    );
  }

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
        appearance: {
          walletList: [
            "metamask",
            "wallet_connect",
            "coinbase_wallet",
            "rainbow",
          ],
        },
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
}
