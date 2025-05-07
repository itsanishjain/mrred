import { useCallback, useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { lensClient } from '@/lib/lens/client';

export function useLensAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Check if the user is authenticated with Lens
  const checkAuthStatus = useCallback(async () => {
    if (!address || !isConnected) {
      setIsAuthenticated(false);
      setProfile(null);
      return;
    }

    try {
      const { isAuthenticated: authStatus } = await lensClient.authentication.isAuthenticated();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        // Get the default profile if authenticated
        const { data: profiles } = await lensClient.profile.fetchAll({
          where: {
            ownedBy: [address],
          },
        });
        
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsAuthenticated(false);
      setProfile(null);
    }
  }, [address, isConnected]);

  // Connect wallet and authenticate with Lens
  const login = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      
      // Connect wallet if not connected
      if (!isConnected) {
        connect({ connector: injected() });
      }
      
      if (!address) return;

      // Generate a challenge from the server
      const { id, text } = await lensClient.authentication.generateChallenge({
        for: address,
      });
      
      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [text, address],
      });
      
      // Authenticate with the Lens API
      await lensClient.authentication.authenticate({
        id,
        signature,
      });
      
      // Update authentication state
      await checkAuthStatus();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, connect, checkAuthStatus]);

  // Logout from Lens and disconnect wallet
  const logout = useCallback(async () => {
    try {
      await lensClient.authentication.logout();
      disconnect();
      setIsAuthenticated(false);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [disconnect]);

  // Check authentication status on mount and when address changes
  useEffect(() => {
    checkAuthStatus();
  }, [address, checkAuthStatus]);

  return {
    login,
    logout,
    isAuthenticated,
    isAuthenticating,
    profile,
    address,
    isConnected,
  };
}
