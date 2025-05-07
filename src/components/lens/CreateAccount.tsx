import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProfile, useValidateHandle } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { client } from "@/lib/lens/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "@lens-protocol/client";

export function CreateAccount() {
  const [localName, setLocalName] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { address } = useAccount();
  const { execute: validateHandle, loading: validating } = useValidateHandle();
  const { execute: createProfile, loading: creating } = useCreateProfile();

  const { data: walletClient } = useWalletClient();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setSuccess(null);

      if (!address) {
        setError("Wallet not connected. Please connect your wallet first.");
        return;
      }

      // First validate the handle
      const validity = await validateHandle({ localName });

      if (validity.isFailure()) {
        setError(validity.error.message);
        return;
      }

      // Create the profile with real authentication
      // Include approveSignless: true to enable signless transactions
      const result = await createProfile({
        localName,
        to: address,
        approveSignless: true,
      });

      if (result.isFailure()) {
        setError(result.error.message);
        return;
      }

      setSuccess(
        `Profile created successfully: ${result.value.handle?.fullHandle}!`
      );

      // Clear form
      setLocalName("");
      setName("");
      setBio("");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while creating the account";
      setError(errorMessage);
      console.error("Error creating account:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Lens Account</h2>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-4">
        {!address ? (
          <div className="p-4 mb-4 bg-yellow-100 text-yellow-700 rounded">
            ⚠️ Please connect your wallet first to create a Lens profile
          </div>
        ) : (
          <div className="p-4 mb-4 bg-blue-100 text-blue-700 rounded">
            ✓ Connected with wallet: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">Create Your Lens Profile</h3>
      </div>

      <form onSubmit={handleCreateAccount} className="space-y-4">
        <div>
          <Label htmlFor="localName">Lens Handle</Label>
          <div className="flex space-x-2">
            <Input
              id="localName"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="yourhandle"
              required
              disabled={validating || creating}
            />
            <span className="flex items-center text-muted-foreground">
              .lens
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose a unique handle for your Lens profile
          </p>
        </div>

        <div>
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter display name"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={validating || creating || !localName || !address}
          className="w-full"
        >
          {validating || creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {validating ? "Validating..." : "Creating..."}
            </>
          ) : (
            "Create Lens Profile"
          )}
        </Button>
      </form>
    </div>
  );
}
