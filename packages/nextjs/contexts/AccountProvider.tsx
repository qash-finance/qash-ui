"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Account } from "@demox-labs/miden-sdk";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { deployAccount } from "@/services/utils/account";

interface DeployedAccountData {
  accountId: string;
  walletAddress: string;
  isPublic: boolean;
  createdAt: number;
}

interface AccountContextType {
  deployedAccount: Account | null;
  deployedAccountData: DeployedAccountData | null;
  isDeploying: boolean;
  error: string | null;
  deployAccountForWallet: (walletAddress: string, isPublic?: boolean) => Promise<Account>;
  switchToWalletAccount: (walletAddress: string) => Promise<void>;
  clearDeployedAccount: () => void;
  clearAllStoredAccounts: () => void; // For debugging
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// localStorage key for persisting wallet -> deployed account mappings
const STORAGE_KEY = "miden_deployed_accounts";

/**
 * AccountProvider manages deployed accounts for connected wallets.
 *
 * Strategy:
 * 1. When wallet connects, automatically deploy a new Miden account via webclient SDK
 * 2. Store wallet address -> deployed account mapping in localStorage
 * 3. Reuse existing deployed account for same wallet on subsequent connections
 * 4. All subsequent transactions use webclient SDK with deployed account (not wallet SDK)
 *
 * This enables transitioning from wallet SDK calls to webclient SDK calls while maintaining
 * the ability to switch back to wallet SDK in the future by simply changing the implementation.
 */
export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const [deployedAccount, setDeployedAccount] = useState<Account | null>(null);
  const [deployedAccountData, setDeployedAccountData] = useState<DeployedAccountData | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load account from localStorage based on current wallet
  useEffect(() => {
    const loadStoredAccount = async () => {
      try {
        if (!publicKey) {
          // No wallet connected, clear state
          setDeployedAccountData(null);
          setDeployedAccount(null);
          return;
        }

        const walletAddress = publicKey.toString();
        const accountData = getStoredAccountForWallet(walletAddress);

        if (accountData) {
          console.log("Loading stored account for wallet:", walletAddress, "accountId:", accountData.accountId);
          setDeployedAccountData(accountData);
          // Clear deployed account object since we only store account data
          setDeployedAccount(null);
        } else {
          console.log("No stored account found for wallet:", walletAddress);
          setDeployedAccountData(null);
          setDeployedAccount(null);
        }
      } catch (error) {
        console.error("Failed to load stored account:", error);
      }
    };

    loadStoredAccount();
  }, [publicKey]); // Depend on publicKey to reload when wallet changes

  const saveAccountToStorage = (walletAddress: string, account: Account, isPublic: boolean) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const accountsMap = stored ? JSON.parse(stored) : {};

      const accountData: DeployedAccountData = {
        accountId: account.id().toString(),
        walletAddress,
        isPublic,
        createdAt: Date.now(),
      };

      accountsMap[walletAddress] = accountData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accountsMap));
      setDeployedAccountData(accountData);
    } catch (error) {
      console.error("Failed to save account to storage:", error);
    }
  };

  const getStoredAccountForWallet = (walletAddress: string): DeployedAccountData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const accountsMap = JSON.parse(stored);
        return accountsMap[walletAddress] || null;
      }
    } catch (error) {
      console.error("Failed to get stored account for wallet:", error);
    }
    return null;
  };

  const deployAccountForWallet = async (walletAddress: string, isPublic: boolean = true): Promise<Account> => {
    console.log("deployAccountForWallet called for wallet:", walletAddress);
    setIsDeploying(true);
    setError(null);

    try {
      // Check if we already have a deployed account for this wallet
      const existingAccountData = getStoredAccountForWallet(walletAddress);

      if (existingAccountData) {
        console.log("Found existing deployed account for wallet:", walletAddress, "- returning early");
        console.log("Existing account data:", existingAccountData);
        setDeployedAccountData(existingAccountData);

        // TODO: In the future, we should recreate the Account object from stored data
        // For now, we'll use the stored account data without the full Account object
        // This works because most operations use accountId string, not the full Account
        setDeployedAccount(null); // Clear since we don't have the full object
        setIsDeploying(false);

        // Return a placeholder - components should use accountId from deployedAccountData
        // This is a temporary solution until we implement proper Account object recreation
        const dummyAccount = {} as Account;
        return dummyAccount;
      }

      console.log("No existing account found - deploying new account for wallet:", walletAddress);
      const account = await deployAccount(isPublic);

      setDeployedAccount(account);
      saveAccountToStorage(walletAddress, account, isPublic);

      console.log("New account deployed successfully:", account.id().toString());
      return account;
    } catch (err) {
      console.error("Error in deployAccountForWallet:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to deploy account";
      setError(errorMessage);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  };

  const clearDeployedAccount = () => {
    setDeployedAccount(null);
    setDeployedAccountData(null);
    setError(null);
    // Note: We don't clear localStorage here to preserve wallet->account mappings
  };

  const clearAllStoredAccounts = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDeployedAccount(null);
    setDeployedAccountData(null);
    setError(null);
    console.log("All stored accounts cleared");
  };

  const switchToWalletAccount = async (walletAddress: string): Promise<void> => {
    console.log("Switching to wallet account:", walletAddress);

    // Clear current state first
    setDeployedAccount(null);
    setDeployedAccountData(null);
    setError(null);

    // Load account for the new wallet
    const existingAccountData = getStoredAccountForWallet(walletAddress);
    if (existingAccountData) {
      console.log("Found existing account for wallet:", walletAddress, "accountId:", existingAccountData.accountId);
      setDeployedAccountData(existingAccountData);
    } else {
      console.log("No existing account found for wallet:", walletAddress);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        deployedAccount,
        deployedAccountData,
        isDeploying,
        error,
        deployAccountForWallet,
        switchToWalletAccount,
        clearDeployedAccount,
        clearAllStoredAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};
