"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BALANCE_VISIBILITY_KEY } from "@/services/utils/constant";

interface BalanceVisibilityContextType {
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType | undefined>(undefined);

interface BalanceVisibilityProviderProps {
  children: ReactNode;
}

export function BalanceVisibilityProvider({ children }: BalanceVisibilityProviderProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  useEffect(() => {
    // Load balance visibility preference from localStorage
    const storedVisibility = localStorage.getItem(BALANCE_VISIBILITY_KEY);
    if (storedVisibility !== null) {
      setIsBalanceVisible(storedVisibility === "true");
    }
  }, []);

  const toggleBalanceVisibility = () => {
    const newVisibility = !isBalanceVisible;
    setIsBalanceVisible(newVisibility);
    localStorage.setItem(BALANCE_VISIBILITY_KEY, newVisibility.toString());
  };

  return (
    <BalanceVisibilityContext.Provider value={{ isBalanceVisible, toggleBalanceVisibility }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext);
  if (context === undefined) {
    throw new Error("useBalanceVisibility must be used within a BalanceVisibilityProvider");
  }
  return context;
}
