"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyAuthProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
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
