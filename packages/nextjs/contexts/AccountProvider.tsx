"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { AssetWithMetadata } from "@/types/faucet";
import { ConsumableNoteRecord } from "@demox-labs/miden-sdk";
import { useAccount } from "@/hooks/web3/useAccount";

interface AccountContextType {
  assets: AssetWithMetadata[];
  loading: boolean;
  error: unknown;
  isAccountDeployed: boolean;
  consumableNotes: ConsumableNoteRecord[] | null;
  accountId: string;
  isError: boolean;
  refreshAccount: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletAddress } = useWalletConnect();
  const { assets, loading, error, isAccountDeployed, consumableNotes, accountId, isError } = useAccount(
    walletAddress || "",
  );

  const refreshAccount = async () => {
    // This will trigger a re-fetch in useAccount due to dependency change
    // We can add more refresh logic here if needed in the future
  };

  const value = {
    assets,
    loading,
    error,
    isAccountDeployed,
    consumableNotes,
    accountId,
    isError,
    refreshAccount,
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
