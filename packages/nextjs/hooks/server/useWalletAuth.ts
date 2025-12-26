"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/services/auth/context";
import { AuthenticatedApiClient } from "@/services/api";

export interface EmailAuthHook {
  // Auth state
  isAuthenticated: boolean;
  email: string | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;

  // Utilities
  isSessionValid: () => Promise<boolean>;

  // Authenticated API client
  api: AuthenticatedApiClient;
}

export function useEmailAuth(): EmailAuthHook {
  const auth = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine auth error with local error
  const error = auth.error || localError;

  // Create authenticated API client
  const api = new AuthenticatedApiClient(
    process.env.NEXT_PUBLIC_SERVER_URL || "",
    () => auth || null,
  );

  const clearError = useCallback(() => {
    auth.clearError();
    setLocalError(null);
  }, [auth]);

  const sendOtp = useCallback(
    async (email: string) => {
      try {
        setLocalError(null);
        // await auth.sendOtp(email);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
        setLocalError(errorMessage);
        throw error;
      }
    },
    [auth],
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      try {
        setLocalError(null);
        // return await auth.verifyOtp(email, otp);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to verify OTP";
        setLocalError(errorMessage);
        throw error;
      }
    },
    [auth],
  );

  const logout = useCallback(async () => {
    try {
      setLocalError(null);
      await auth.logout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      setLocalError(errorMessage);
      throw error;
    }
  }, [auth]);

  const refreshAuth = useCallback(async () => {
    try {
      setLocalError(null);
      // await auth.refreshToken();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Refresh failed";
      setLocalError(errorMessage);
      throw error;
    }
  }, [auth]);

  return {
    isAuthenticated: auth.isAuthenticated,
    email: "",
    user: auth.user,
    isLoading: auth.isLoading,
    error,
    sendOtp,
    verifyOtp,
    logout,
    refreshAuth,
    clearError,
    isSessionValid: () => Promise.resolve(true),
    api,
  };
}

// Keep useWalletAuth for backward compatibility (deprecated)
export function useWalletAuth() {
  const emailAuth = useEmailAuth();
  return {
    ...emailAuth,
    walletAddress: emailAuth.email, // Map email to walletAddress for compatibility
    connectWallet: async (walletAddress: string) => {
      // This is deprecated - use sendOtp/verifyOtp instead
      console.warn("connectWallet is deprecated. Use sendOtp/verifyOtp instead.");
    },
    disconnectWallet: emailAuth.logout,
    getSessionToken: () => null, // Tokens are in cookies
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
