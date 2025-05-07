"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import {
  useSession,
  useProfilesManaged,
  useCreateProfile,
  useValidateHandle,
  useLogin,
  SessionType,
  profileId,
} from "@lens-protocol/react-web";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// Create a simple radio group implementation since we don't have the Shadcn component
const RadioGroup = ({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) => <div className="space-y-2">{children}</div>;

const RadioGroupItem = ({
  value,
  id,
  name,
}: {
  value: string;
  id: string;
  name: string;
}) => (
  <input
    type="radio"
    value={value}
    id={id}
    name={name}
    className="box-content h-1.5 w-1.5 appearance-none rounded-full border-[5px] border-white bg-white bg-clip-padding outline-none ring-1 ring-gray-950/10 checked:border-green-500 checked:ring-green-500"
  />
);

// Helper function to truncate Ethereum addresses
const truncateEthAddress = (address: string | undefined): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface AuthPageProps {
  onSuccess?: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps): JSX.Element {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // For profile creation
  const [localName, setLocalName] = useState("");
  const { execute: validateHandle, loading: verifying } = useValidateHandle();
  const { execute: createProfile, loading: creating } = useCreateProfile();

  // For login
  const { execute: loginWithLens, loading: isLoginPending } = useLogin();
  const { data: profiles, loading: profilesLoading } = useProfilesManaged(
    address ? { for: address as string, includeOwned: true } : { for: "" }
  );

  // Handle profile creation
  const handleCreateProfile = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError("Wallet not connected");
      return;
    }

    try {
      // Validate handle first
      const validity = await validateHandle({ localName });

      if (validity.isFailure()) {
        setError(validity.error.message);
        return;
      }

      // Create profile
      const result = await createProfile({ localName, to: address });

      if (result.isFailure()) {
        setError(result.error.message);
        return;
      }

      setSuccess(
        `Profile created successfully: ${result.value.handle?.fullHandle}!`
      );
      setLocalName("");

      // Switch to login tab after successful creation
      setActiveTab("login");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    }
  };

  // Handle login with Lens
  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError("Wallet not connected");
      return;
    }

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const id = formData.get("profileId") as string;

      if (!id) {
        setError("Please select a profile");
        return;
      }

      const result = await loginWithLens({
        address,
        profileId: profileId(id),
      });

      if (result.isFailure()) {
        setError(result.error.message);
        return;
      }

      setSuccess(
        `Logged in successfully as ${
          result.value?.handle?.fullHandle ?? result.value?.id
        }`
      );
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    }
  };

  // If not ready, show loading
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated with Privy, show connect wallet button
  if (!authenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Connect to Lens Protocol</CardTitle>
          <CardDescription>
            Connect your wallet to get started with Lens Protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Button size="lg" onClick={login} className="w-full max-w-xs">
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If wallet is connected but not authenticated with Lens
  if (isConnected && !session?.authenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Lens Protocol</CardTitle>
          <CardDescription>
            Connected wallet: {truncateEthAddress(address)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="create">Create Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 pt-4">
              {profilesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : profiles && profiles.length > 0 ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select a Lens Profile</Label>
                    <RadioGroup defaultValue={profiles[0].id}>
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center space-x-2 border p-3 rounded-md hover:border-primary transition-colors"
                        >
                          <RadioGroupItem
                            value={profile.id}
                            id={profile.id}
                            name="profileId"
                          />
                          <Label
                            htmlFor={profile.id}
                            className="font-medium cursor-pointer"
                          >
                            {profile.handle?.fullHandle ?? profile.id}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoginPending}
                  >
                    {isLoginPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sign message in wallet
                      </>
                    ) : (
                      "Login to Lens"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No Lens Profiles found in this wallet.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("create")}
                  >
                    Create a Profile
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4 pt-4">
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="handle">Lens Handle</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="handle"
                      placeholder="yourhandle"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      disabled={verifying || creating}
                      required
                    />
                    <span className="flex items-center text-muted-foreground">
                      .lens
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose a unique handle for your Lens profile
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifying || creating || !localName}
                >
                  {verifying || creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {verifying ? "Verifying..." : "Creating..."}
                    </>
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={logout}>
            Disconnect Wallet
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If authenticated with Lens, show profile info
  if (session && session.type === SessionType.WithProfile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Lens</CardTitle>
          <CardDescription>You are connected to Lens Protocol</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">Logged in as:</p>
            <p className="text-xl font-bold">
              {session.profile.handle?.fullHandle ?? session.profile.id}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Wallet: {truncateEthAddress(address)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <div></div>;
}
