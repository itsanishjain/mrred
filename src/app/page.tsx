// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { client } from "@/lib/lens/client";
// import { fetchAccounts } from "@lens-protocol/client/actions";
// import { CreateAccount } from "@/components/lens/CreateAccount";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { AuthButton } from "@/components/auth/AuthButton";
// import { useSession, SessionType } from "@lens-protocol/react-web";
// import Link from "next/link";
// import type { Account } from "@lens-protocol/client";

// export default function Home() {
//   const [accounts, setAccounts] = useState<Account[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchLensAccounts = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Use the fetchAccounts action from @lens-protocol/client/actions
//       const result = await fetchAccounts(client);

//       console.log("Accounts result:", result);

//       // Handle the result using the correct API
//       if (result.isOk()) {
//         // Convert readonly array to regular array with spread operator
//         setAccounts([...result.value.items]);
//       } else {
//         setError(result.error.message);
//       }
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "An error occurred";
//       setError(errorMessage);
//       console.error("Error fetching accounts:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const { data: session } = useSession();

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl font-bold">Lens Protocol Integration</h1>
//         <AuthButton variant="outline" />
//       </div>

//       {session && session.type === SessionType.WithProfile && (
//         <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
//           <p className="text-green-800 font-medium">
//             Welcome, {session.profile.handle?.fullHandle ?? session.profile.id}! You are successfully authenticated with Lens Protocol.
//           </p>
//         </div>
//       )}

//       {!session?.authenticated && (
//         <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
//           <p className="text-blue-800 mb-2">
//             You are not authenticated with Lens Protocol. Connect your wallet and authenticate to access all features.
//           </p>
//           <Link href="/auth">
//             <Button variant="secondary" size="sm">Go to Authentication</Button>
//           </Link>
//         </div>
//       )}

//       <Tabs defaultValue="accounts" className="w-full mb-8">
//         <TabsList className="grid w-full grid-cols-2 mb-4">
//           <TabsTrigger value="accounts">View Accounts</TabsTrigger>
//           <TabsTrigger value="create">Create Account</TabsTrigger>
//         </TabsList>

//         <TabsContent value="accounts">
//           <Button onClick={fetchLensAccounts} disabled={loading} className="mb-4">
//             {loading ? "Loading..." : "Fetch Lens Accounts"}
//           </Button>

//       {error && (
//         <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
//           Error: {error}
//         </div>
//       )}

//       {accounts.length > 0 && (
//         <div>
//           <h2 className="text-xl font-semibold mb-2">Lens Accounts:</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {accounts.map((account) => (
//               <div
//                 key={account.address}
//                 className="p-4 border rounded-lg shadow"
//               >
//                 <div className="font-medium text-lg">
//                   {account.username?.localName || account.address}
//                 </div>
//                 {account.metadata?.name && (
//                   <div className="text-sm text-gray-700">
//                     Name: {account.metadata.name}
//                   </div>
//                 )}
//                 {account.metadata?.bio && (
//                   <div className="text-sm text-gray-500 mt-2">
//                     {account.metadata.bio}
//                   </div>
//                 )}
//                 {account.metadata?.picture?.optimized?.uri && (
//                   <img
//                     src={account.metadata.picture.optimized.uri}
//                     alt={account.username?.localName || "Account"}
//                     className="w-16 h-16 rounded-full mt-2"
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//         </TabsContent>

//         <TabsContent value="create">
//           <div className="mt-4">
//             <CreateAccount />
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

"use client";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useCreateProfile, useValidateHandle } from "@lens-protocol/react-web";

const WalletInfo = () => {
  const { address, isConnecting, isDisconnected } = useAccount();

  if (isConnecting) return <div>Connecting...</div>;
  if (isDisconnected) return <div>Disconnected</div>;

  return (
    <div>
      <CreateProfile address={address} />
      Connected Wallet: {address}
    </div>
  );
};

const CreateProfile = ({ address }: { address?: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // For profile creation
  const [localName, setLocalName] = useState("");
  const { execute: validateHandle, loading: verifying } = useValidateHandle();
  const { execute: createProfile, loading: creating } = useCreateProfile();

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
      console.log("Here we go", { validity });

      // if (validity.isFailure()) {
      //   console.log("VALIDITY", validity);
      //   setError(validity.error.message);
      //   return;
      // }

      // Create profile
      const result = await createProfile({ localName, to: address });
      console.log({ result });

      if (result.isFailure()) {
        console.log(result.error);
        setError(result.error.message);
        return;
      }

      console.log("Success", result);

      setSuccess(
        `Profile created successfully: ${result.value.handle?.fullHandle}!`
      );
      setLocalName("");
    } catch (err) {
      console.log("ERROR", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    }
  };
  return (
    <div>
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
    </div>
  );
};

const App = () => {
  return (
    <>
      <ConnectKitButton />
      <WalletInfo />
    </>
  );
};

export default App;
