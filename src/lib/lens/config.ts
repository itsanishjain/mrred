import { LensConfig, development, production } from "@lens-protocol/react-web";
import { config as wagmiConfig } from "@/lib/wagmi/config";
import { bindings } from "@lens-protocol/wagmi";

// Determine if we're in production or development
const isProd = process.env.NODE_ENV === "production";

// Create Lens configuration
export const lensConfig: LensConfig = {
  environment: isProd ? production : development,
  bindings: bindings(wagmiConfig),
  debug: !isProd,
};
