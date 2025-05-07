import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { client } from "./client";

interface LensAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const LensAuthContext = createContext<LensAuthContextType | undefined>(
  undefined
);

export function LensAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileFragment | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Check if the user is authenticated
      const { isAuthenticated: authStatus } =
        await lensClient.authentication.isAuthenticated();

      if (authStatus) {
        // Get the default profile if authenticated
        const { data: profiles } = await lensClient.profile.fetchAll({
          where: {
            ownedBy: [await lensClient.authentication.getWalletAddress()],
          },
        });

        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }

      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsAuthenticated(false);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);

      // Generate a challenge from the server
      const { id, text } = await lensClient.authentication.generateChallenge({
        for: window.localStorage.getItem("lens-address") || "",
      });

      // Request signature from wallet
      // Note: This is a simplified example. In a real app, you would use a wallet connector
      // like wagmi or viem to handle the signing process
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [text, window.localStorage.getItem("lens-address")],
      });

      // Authenticate with the Lens API
      await lensClient.authentication.authenticate({
        id,
        signature,
      });

      // Update authentication state
      await checkAuthStatus();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await lensClient.authentication.logout();
      setIsAuthenticated(false);
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value = {
    isAuthenticated,
    isLoading,
    profile,
    login,
    logout,
    refreshAuth,
  };

  return (
    <LensAuthContext.Provider value={value}>
      {children}
    </LensAuthContext.Provider>
  );
}

export function useLensAuth() {
  const context = useContext(LensAuthContext);
  if (context === undefined) {
    throw new Error("useLensAuth must be used within a LensAuthProvider");
  }
  return context;
}
