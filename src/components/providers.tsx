"use client";

import { ReactNode } from "react";
// import { http } from "wagmi";
import { lens, polygon, polygonAmoy } from "wagmi/chains";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  LensConfig,
  LensProvider,
  development,
  mainnet,
  production,
  EnvironmentConfig,
} from "@lens-protocol/react-web";
import { bindings } from "@lens-protocol/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
// import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { PrivyClientConfig } from "@privy-io/react-auth";

import { WagmiProvider, createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Create wagmi config with Privy bindings
const wagmiConfig = createConfig({
  // chains: [polygon, polygonAmoy],
  chains: [lens],
  transports: {
    // [polygon.id]: http(),
    // [polygonAmoy.id]: http(),
    [lens.id]: http(),
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

// connectkit config

const connectkitConfig = createConfig(
  getDefaultConfig({
    // chains: [chains.mainnet, chains.testnet],
    chains: [polygon, polygonAmoy],
    transports: {
      // [chains.mainnet.id]: http(chains.mainnet.rpcUrls.default.http[0]!),
      // [chains.testnet.id]: http(chains.testnet.rpcUrls.default.http[0]!),
      [polygon.id]: http(),
      [polygonAmoy.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "Lens Testing App",
    appDescription: "A sample app integrating Lens Testing wallet connection.",
    appUrl: "https://yourapp.com",
    appIcon: "https://yourapp.com/icon.png",
  })
);

// Create Lens configuration
const lensConfig: LensConfig = {
  environment: development,
  bindings: bindings(connectkitConfig),
  debug: true,
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // return (
  //   <PrivyProvider
  //     appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
  //     config={privyConfig}
  //   >
  //     <QueryClientProvider client={queryClient}>
  //       <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
  //         <LensProvider config={lensConfig}>{children}</LensProvider>
  //       </WagmiProvider>
  //     </QueryClientProvider>
  //   </PrivyProvider>
  // );

  return (
    <WagmiProvider config={connectkitConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider config={lensConfig}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
