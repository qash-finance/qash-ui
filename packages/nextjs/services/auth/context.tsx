"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { WalletAuthApi, ApiError } from "./api";
import { WalletCrypto, KeyPair } from "./crypto";
import { AuthStorage, StoredAuth, StoredKey } from "./storage";
import { AUTH_EXPIRATION_HOURS, AUTH_REFRESH_INTERVAL } from "../utils/constant";

export interface AuthState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  sessionToken: string | null;
  publicKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (walletAddress: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  isSessionValid: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AuthProvider({
  children,
  apiBaseUrl,
  autoRefresh = true,
  refreshInterval = AUTH_REFRESH_INTERVAL,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    walletAddress: null,
    sessionToken: null,
    publicKey: null,
    isLoading: true,
    error: null,
  });

  const [api] = useState(() => new WalletAuthApi(apiBaseUrl));

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = AuthStorage.getAuth();
        if (storedAuth && !AuthStorage.isSessionExpired(storedAuth.expiresAt)) {
          // Validate session with server
          const validation = await api.validateSession(storedAuth.sessionToken);
          if (validation.valid) {
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              walletAddress: storedAuth.walletAddress,
              sessionToken: storedAuth.sessionToken,
              publicKey: storedAuth.keyPair.publicKey,
              isLoading: false,
            }));
          } else {
            AuthStorage.clearAuth();
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        AuthStorage.clearAuth();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, [api]);

  // Auto-refresh token
  useEffect(() => {
    if (!autoRefresh || !state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, state.isAuthenticated]);

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setError(null);
  };

  const isSessionValid = (): boolean => {
    const storedAuth = AuthStorage.getAuth();
    return !!(storedAuth && !AuthStorage.isSessionExpired(storedAuth.expiresAt));
  };

  const login = async (walletAddress: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const deviceFingerprint = await WalletCrypto.generateDeviceFingerprint();
      const deviceType = WalletCrypto.getDeviceType();

      // Check if we have existing key for this wallet
      let keyPair: KeyPair;
      let publicKey: string;
      console.log("deviceFingerprint", deviceFingerprint);

      const existingKey = AuthStorage.getKey(walletAddress);
      if (existingKey && !AuthStorage.isSessionExpired(existingKey.expiresAt)) {
        console.log("DID I EXPIRED?");
        keyPair = existingKey.keyPair;
        publicKey = existingKey.publicKey;
      } else {
        // Generate new key pair and register it
        keyPair = await WalletCrypto.generateKeyPair();
        publicKey = keyPair.publicKey;

        console.log("KEYPAIR", keyPair);

        // Step 1: Initiate authentication
        const initiateResponse = await api.initiateAuth({
          walletAddress,
          deviceFingerprint,
          deviceType,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });

        // Step 2: Generate challenge response
        const challengeResponse = await WalletCrypto.generateChallengeResponse(
          initiateResponse.challengeCode,
          walletAddress,
        );

        // Step 3: Register key
        await api.registerKey({
          walletAddress,
          publicKey,
          challengeCode: initiateResponse.challengeCode,
          challengeResponse,
          deviceFingerprint,
          deviceType,
          expirationHours: AUTH_EXPIRATION_HOURS, // 30 days
        });

        // Store key for future use
        const keyData: StoredKey = {
          walletAddress,
          keyPair,
          publicKey,
          expiresAt: new Date(Date.now() + AUTH_EXPIRATION_HOURS * 60 * 60 * 1000).toISOString(),
          deviceFingerprint,
          createdAt: new Date().toISOString(),
        };
        AuthStorage.storeKey(walletAddress, keyData);
      }

      // Step 4: Authenticate
      const timestamp = new Date().toISOString();
      const signature = await WalletCrypto.createAuthSignature(walletAddress, timestamp, publicKey);

      const authResponse = await api.authenticate({
        walletAddress,
        publicKey,
        signature,
        timestamp,
        deviceFingerprint,
      });

      // Store auth data
      const authData: StoredAuth = {
        walletAddress,
        keyPair,
        sessionToken: authResponse.sessionToken,
        expiresAt: authResponse.expiresAt,
        deviceFingerprint,
      };
      AuthStorage.storeAuth(authData);

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        walletAddress,
        sessionToken: authResponse.sessionToken,
        publicKey: authResponse.publicKey,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = (error as ApiError).message || "Login failed";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const storedAuth = AuthStorage.getAuth();
      if (storedAuth?.sessionToken) {
        await api.revokeSession(storedAuth.sessionToken);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      AuthStorage.clearAuth();
      setState({
        isAuthenticated: false,
        walletAddress: null,
        sessionToken: null,
        publicKey: null,
        isLoading: false,
        error: null,
      });
    }
  };

  const refreshToken = async (): Promise<void> => {
    const storedAuth = AuthStorage.getAuth();
    if (!storedAuth) return;

    try {
      const response = await api.refreshToken({
        sessionToken: storedAuth.sessionToken,
        walletAddress: storedAuth.walletAddress,
      });

      const updatedAuth: StoredAuth = {
        ...storedAuth,
        sessionToken: response.sessionToken,
        expiresAt: response.expiresAt,
      };
      AuthStorage.storeAuth(updatedAuth);

      setState(prev => ({
        ...prev,
        sessionToken: response.sessionToken,
        error: null,
      }));
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      throw error;
    }
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
    isSessionValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
