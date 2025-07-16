"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/services/auth/context";

export interface WalletAuthHook {
  // Auth state
  isAuthenticated: boolean;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  connectWallet: (walletAddress: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;

  // Utilities
  isSessionValid: () => boolean;
  getSessionToken: () => string | null;
}

export function useWalletAuth(): WalletAuthHook {
  const auth = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine auth error with local error
  const error = auth.error || localError;

  const clearError = useCallback(() => {
    auth.clearError();
    setLocalError(null);
  }, [auth]);

  const connectWallet = useCallback(
    async (walletAddress: string) => {
      try {
        setLocalError(null);
        await auth.login(walletAddress);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Connection failed";
        setLocalError(errorMessage);
        throw error;
      }
    },
    [auth],
  );

  const disconnectWallet = useCallback(async () => {
    try {
      setLocalError(null);
      await auth.logout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Disconnection failed";
      setLocalError(errorMessage);
      throw error;
    }
  }, [auth]);

  const refreshAuth = useCallback(async () => {
    try {
      setLocalError(null);
      await auth.refreshToken();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Refresh failed";
      setLocalError(errorMessage);
      throw error;
    }
  }, [auth]);

  const getSessionToken = useCallback(() => {
    return auth.sessionToken;
  }, [auth.sessionToken]);

  return {
    isAuthenticated: auth.isAuthenticated,
    walletAddress: auth.walletAddress,
    isLoading: auth.isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshAuth,
    clearError,
    isSessionValid: auth.isSessionValid,
    getSessionToken,
  };
}

// Additional hook for checking auth requirements
export function useAuthGuard(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      // In a real app, you'd use your router here
      // For example: router.push(redirectTo);
      console.log(`Redirecting to ${redirectTo} - user not authenticated`);
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated,
  };
}

// Hook for making authenticated API calls
export function useAuthenticatedApi() {
  const { getSessionToken, isAuthenticated } = useWalletAuth();

  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      const token = getSessionToken();
      if (!token) {
        throw new Error("No session token available");
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Request failed",
          statusCode: response.status,
        }));
        throw new Error(error.message || "Request failed");
      }

      return response.json();
    },
    [getSessionToken, isAuthenticated],
  );

  return {
    makeAuthenticatedRequest,
    isAuthenticated,
  };
}
