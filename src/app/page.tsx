"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/lens/client";
import { fetchAccounts } from "@lens-protocol/client/actions";

export default function Home() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLensAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the fetchAccounts action from @lens-protocol/client/actions
      const result = await fetchAccounts(client);
      
      console.log('Accounts result:', result);
      
      // Handle the result using the correct API
      if (result.isOk()) {
        // Convert readonly array to regular array with spread operator
        setAccounts([...result.value.items]);
      } else {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lens Protocol Test</h1>
      
      <Button 
        onClick={fetchLensAccounts} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? "Loading..." : "Fetch Lens Accounts"}
      </Button>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {accounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Lens Accounts:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id || account.address} className="p-4 border rounded-lg shadow">
                <div className="font-medium text-lg">
                  {account.username?.localName || account.address}
                </div>
                {account.metadata?.name && (
                  <div className="text-sm text-gray-700">
                    Name: {account.metadata.name}
                  </div>
                )}
                {account.metadata?.bio && (
                  <div className="text-sm text-gray-500 mt-2">
                    {account.metadata.bio}
                  </div>
                )}
                {account.metadata?.picture?.optimized?.uri && (
                  <img 
                    src={account.metadata.picture.optimized.uri} 
                    alt={account.username?.localName || "Account"}
                    className="w-16 h-16 rounded-full mt-2" 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
