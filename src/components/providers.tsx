"use client";

import { ReactNode } from "react";
import { http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LensConfig, LensProvider, development } from "@lens-protocol/react-web";
import { bindings } from "@lens-protocol/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { PrivyClientConfig } from "@privy-io/react-auth";

// Create wagmi config with Privy bindings
const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

// Privy configuration
const privyConfig: PrivyClientConfig = {
  defaultChain: polygonAmoy,
  supportedChains: [polygon, polygonAmoy],
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
};

// Create a query client
const queryClient = new QueryClient();

// Create Lens configuration
const lensConfig: LensConfig = {
  environment: development,
  bindings: bindings(wagmiConfig),
  debug: true,
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          <LensProvider config={lensConfig}>
            {children}
          </LensProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
