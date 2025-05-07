import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateAccount() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Simulate account creation
      console.log('Creating account with:', { username, name, bio });
      
      // Simulate a successful response after a short delay
      setTimeout(() => {
        setSuccess(`Account creation simulation successful for username: ${username}`);
        // Clear form
        setUsername("");
        setName("");
        setBio("");
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the account";
      setError(errorMessage);
      console.error("Error creating account:", err);
      setLoading(false);
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
        <div className="p-4 mb-4 bg-blue-100 text-blue-700 rounded">
          ✓ Connected to Lens Protocol (Simulation Mode)
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Create Your Account
        </h3>
      </div>

      <form onSubmit={handleCreateAccount} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Username must be unique and will be your identity on Lens
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
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
