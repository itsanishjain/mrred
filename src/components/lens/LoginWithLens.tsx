import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getLensClient } from "@/lib/lens/client";
import { useWalletClient } from "wagmi";
import { signMessageWith } from "@lens-protocol/client/viem";
import type { SessionClient } from "@lens-protocol/client";

export function LoginWithLens({
  onSuccess,
}: {
  onSuccess: (sessionClient: SessionClient) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  // const handleLogin = async () => {
  //   if (!walletClient) {
  //     setError("Wallet not connected. Please connect your wallet first.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // Get the wallet address
  //     const addresses = await walletClient.getAddresses();
  //     const walletAddress = addresses[0];

  //     // Login with the Lens Protocol client as an onboarding user
  //     const result = await getLensClient.login({
  //       onboardingUser: {
  //         wallet: walletAddress,
  //         app: "mrred",
  //       },
  //       signMessage: signMessageWith(walletClient),
  //     });

  //     if (result.isOk()) {
  //       // Call the onSuccess callback with the session client
  //       onSuccess(result.value);
  //     } else {
  //       setError(`Login failed: ${result.error.message}`);
  //     }
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "An error occurred while logging in";
  //     setError(errorMessage);
  //     console.error("Error logging in:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div>
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <Button disabled={loading} className="w-full">
        {loading ? "Connecting..." : "Connect with Lens Protocol"}
      </Button>
    </div>
  );
}
