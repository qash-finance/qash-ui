"use client";
import React, { createContext, useContext } from "react";
import { AssetWithMetadata } from "@/types/faucet";
import { useAccount } from "@/hooks/web3/useAccount";

interface AccountContextType {
  assets: AssetWithMetadata[];
  loading: boolean;
  error: unknown;
  isAccountDeployed: boolean;
  accountId: string;
  isError: boolean;
  forceFetch: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { assets, refetchAssets, loading, error, isAccountDeployed, accountId, isError, forceFetch } = useAccount();

  const value = {
    assets,
    loading,
    error,
    isAccountDeployed,
    accountId: accountId || "",
    isError,
    forceFetch,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccountContext must be used within an AccountProvider");
  }
  return context;
};
