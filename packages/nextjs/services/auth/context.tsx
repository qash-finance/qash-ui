"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { ApiError, AuthMeResponse, EmailAuthApi, VerifyOtpResponse } from "./api";
import { AuthStorage } from "./storage";
import { AUTH_REFRESH_INTERVAL } from "../utils/constant";

type UserData = AuthMeResponse["user"] | VerifyOtpResponse["user"] | null;

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserData;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<AuthMeResponse["user"] | null>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  isSessionValid: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
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
    email: null,
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: true,
    error: null,
  });

  const [api] = useState(() => new EmailAuthApi());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAccessToken = AuthStorage.getAccessToken();
        const storedRefreshToken = AuthStorage.getRefreshToken();

        if (!storedRefreshToken) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        let accessToken = storedAccessToken;
        let refreshToken = storedRefreshToken;

        if (!accessToken) {
          const refreshed = await api.refreshToken(storedRefreshToken);
          accessToken = refreshed.accessToken;
          refreshToken = refreshed.refreshToken;
          AuthStorage.storeAccessToken(accessToken);
          AuthStorage.storeRefreshToken(refreshToken);
        }

        const me = await api.getMe(accessToken);

        if (!me.authenticated) {
          AuthStorage.clearAuth();
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          email: me?.user?.email ?? null,
          accessToken,
          refreshToken,
          user: me.user ?? null,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        AuthStorage.clearAuth();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, [api]);

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setError(null);
  };

  const isSessionValid = (): boolean => {
    const refreshToken = AuthStorage.getRefreshToken();
    return !!refreshToken;
  };

  const sendOtp = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await api.sendOtp(email);
      setState(prev => ({ ...prev, email, isLoading: false }));
    } catch (error) {
      console.error("Send OTP failed:", error);
      const errorMessage = (error as ApiError).message || "Failed to send OTP";
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<AuthMeResponse["user"] | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.verifyOtp(email, otp);
      const accessToken = (response as any).accessToken ?? (response as any).access_token;
      const refreshToken = (response as any).refreshToken ?? (response as any).refresh_token;

      // Store tokens and email first (synchronously) to ensure they persist
      if (accessToken) AuthStorage.storeAccessToken(accessToken);
      if (refreshToken) AuthStorage.storeRefreshToken(refreshToken);

      let meUser: AuthMeResponse["user"] | null = null;
      if (accessToken) {
        try {
          const me = await api.getMe(accessToken);
          meUser = me.user ?? null;
        } catch (err) {
          console.error("verifyOtp getMe failed:", err);
        }
      }

      const userData: UserData = meUser ?? (response.user as UserData) ?? null;

      // Update state with complete user data
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        email,
        accessToken: accessToken ?? null,
        refreshToken: refreshToken ?? null,
        user: userData,
        isLoading: false,
        error: null,
      }));

      // Return user data to component
      return (userData as AuthMeResponse["user"]) ?? null;
    } catch (error) {
      console.error("Verify OTP failed:", error);
      const errorMessage = (error as ApiError).message || "Failed to verify OTP";
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = state.refreshToken || AuthStorage.getRefreshToken();
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      AuthStorage.clearAuth();
      setState({
        isAuthenticated: false,
        email: null,
        accessToken: null,
        refreshToken: null,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, [api, state.refreshToken]);

  const refreshSession = useCallback(async (): Promise<void> => {
    const storedRefreshToken = AuthStorage.getRefreshToken();
    if (!storedRefreshToken) return;

    try {
      const response = await api.refreshToken(storedRefreshToken);
      const accessToken = (response as any).accessToken ?? (response as any).access_token;
      const newRefreshToken = (response as any).refreshToken ?? (response as any).refresh_token;

      if (accessToken) AuthStorage.storeAccessToken(accessToken);
      if (newRefreshToken) AuthStorage.storeRefreshToken(newRefreshToken);

      setState(prev => ({
        ...prev,
        accessToken: accessToken ?? prev.accessToken,
        refreshToken: newRefreshToken ?? prev.refreshToken,
        error: null,
      }));
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      throw error;
    }
  }, [api, logout]);

  const refreshUser = useCallback(async (): Promise<void> => {
    const storedAccessToken = AuthStorage.getAccessToken();
    if (!storedAccessToken) return;

    try {
      const me = await api.getMe(storedAccessToken);
      setState(prev => ({
        ...prev,
        user: me.user ?? null,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  }, [api]);

  useEffect(() => {
    if (!autoRefresh || !state.isAuthenticated) return;

    const interval = setInterval(() => {
      refreshSession().catch(error => console.error("Auto-refresh failed:", error));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, state.isAuthenticated, refreshSession]);

  const value: AuthContextValue = {
    ...state,
    sendOtp,
    verifyOtp,
    logout,
    refreshSession,
    refreshUser,
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
