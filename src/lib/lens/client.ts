import { PublicClient, mainnet, testnet } from "@lens-protocol/client";

import { fragments } from "@/fragments";

const isProd = process.env.NODE_ENV === "production";

export const client = PublicClient.create({
  environment: isProd ? mainnet : testnet,
  fragments,
});
