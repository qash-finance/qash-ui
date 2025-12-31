"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { ApiError, AuthMeResponse, ParaAuthApi } from "./api";

type UserData = AuthMeResponse["user"] | null;

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  loginWithPara: (paraJwtToken: string) => Promise<AuthMeResponse["user"] | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  const api = useRef(new ParaAuthApi()).current;
  const initializeRef = useRef(false);

  useEffect(() => {
    if (initializeRef.current) return; // Skip if already initialized
    initializeRef.current = true;

    const initializeAuth = async () => {
      try {
        // Check for Para cookie-based auth
        const me = await api.getMe();
        if (me.authenticated && me.user) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: me.user ?? null,
            isLoading: false,
            error: null,
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
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

  const loginWithPara = async (paraJwtToken: string): Promise<AuthMeResponse["user"] | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Send Para JWT to backend to set cookie
      const response = await api.setParaJwtCookie(paraJwtToken);

      const userData: UserData = response.user ?? null;

      // Update state with user data from backend
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userData,
        isLoading: false,
        error: null,
      }));

      // Return user data to component
      return (userData as AuthMeResponse["user"]) ?? null;
    } catch (error) {
      console.error("Para login failed:", error);
      const errorMessage = (error as ApiError).message || "Failed to authenticate with Para";
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, [api]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const me = await api.getMe();
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

  const value: AuthContextValue = {
    ...state,
    loginWithPara,
    logout,
    refreshUser,
    clearError,
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
