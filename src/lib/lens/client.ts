import { PublicClient } from "@lens-protocol/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import type { EnvironmentConfig } from "@lens-protocol/client";

// Define the environment based on NODE_ENV
const isProd = process.env.NODE_ENV === "production";

// Test App addresses from the Lens documentation
export const LENS_APP_IDS = {
  mainnet: "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE",
  testnet: "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7",
};

// Initialize the PublicClient
export const client = PublicClient.create({
  environment: isProd
    ? ("mainnet" as EnvironmentConfig)
    : ("testnet" as EnvironmentConfig),
});

/**
 * Login to Lens Protocol
 * @param address The wallet address
 * @param signer The signer to use for signing the challenge
 * @returns A SessionClient if successful
 */
export async function login(address: string, signer: any) {
  try {
    // Get the app ID based on environment
    const appId = isProd ? LENS_APP_IDS.mainnet : LENS_APP_IDS.testnet;

    // Login as an onboarding user
    const result = await client.login({
      onboardingUser: {
        wallet: address,
        app: appId,
      },
      signMessage: signMessageWith(signer),
    });

    if (result.isErr()) {
      throw new Error(`Authentication failed: ${result.error.message}`);
    }

    return result.value;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Resume a previous session if available
 * @returns A SessionClient if a session is available
 */
export async function resumeSession() {
  try {
    const result = await client.resumeSession();

    if (result.isErr()) {
      return null;
    }

    return result.value;
  } catch (error) {
    console.error("Resume session error:", error);
    return null;
  }
}
