"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/services/auth/context";
import { AuthenticatedApiClient } from "@/services/api";

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

  // Authenticated API client
  api: AuthenticatedApiClient;
}

export function useWalletAuth(): WalletAuthHook {
  const auth = useAuth();
  // const session = useSessionManager();
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine auth error with local error
  const error = auth.error || localError;

  // Create authenticated API client
  const api = new AuthenticatedApiClient(
    process.env.NEXT_PUBLIC_SERVER_URL || "",
    () => auth.sessionToken,
    () => auth.refreshToken(),
    () => auth.logout(),
  );

  const clearError = useCallback(() => {
    auth.clearError();
    setLocalError(null);
  }, [auth]);

  const connectWallet = useCallback(
    async (walletAddress: string) => {
      try {
        setLocalError(null);
        await auth.login(walletAddress);
        // await session.loginUser(walletAddress);
      } catch (error) {
        // await session.logoutUser();
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
      // await session.logoutUser();
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
    api,
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

// Hook for making authenticated API calls (alternative approach)
export function useAuthenticatedApi() {
  const { api, isAuthenticated } = useWalletAuth();

  const makeAuthenticatedRequest = useCallback(
    async (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, data?: any) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      switch (method) {
        case "GET":
          return await api.getData(url);
        case "POST":
          return await api.postData(url, data);
        case "PUT":
          return await api.putData(url, data);
        case "PATCH":
          return await api.patchData(url, data);
        case "DELETE":
          return await api.deleteData(url);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    },
    [api, isAuthenticated],
  );

  return {
    makeAuthenticatedRequest,
    api,
    isAuthenticated,
  };
}
