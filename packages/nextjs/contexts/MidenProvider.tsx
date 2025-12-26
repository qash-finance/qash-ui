"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useAccount, useLogout, useModal, useWallet, Wallet } from "@getpara/react-sdk";
import { useMiden } from "@/hooks/web3/useMiden";
import { getBalance } from "@/services/utils/getBalance";
import { Address } from "@demox-labs/miden-sdk";

interface BalanceData {
  balances: Array<{
    assetId: string;
    balance: string;
    decimals?: number;
    maxSupply?: number;
    symbol?: string;
  }>;
  totalUsd: number;
}

interface MidenContextType {
  isConnected: boolean;
  wallet: Omit<Wallet, "signer"> | null | undefined;
  openModal: (config?: any) => void;
  logoutAsync: () => Promise<void>;
  client: any;
  address: string | undefined;
  balances: BalanceData | null;
  balancesLoading: boolean;
  fetchBalances: () => Promise<void>;
}

// Create the context
const MidenContext = createContext<MidenContextType | undefined>(undefined);

// Provider component
export function MidenProvider({ children }: { children: ReactNode }) {
  const { isConnected, isLoading } = useAccount();
  const { data: wallet } = useWallet();
  const { openModal } = useModal();
  const { logoutAsync } = useLogout();
  const { client, accountId: address } = useMiden();
  const [balances, setBalances] = useState<BalanceData | null>(null);
  const [balancesLoading, setBalancesLoading] = useState<boolean>(false);

  const fetchBalances = useCallback(async () => {
    if (!address || !client) return;

    try {
      setBalancesLoading(true);
      const fetchedBalances = await getBalance(client, address);
      console.log("fetchedBalances", fetchedBalances);

      // Convert and normalize the balances
      const normalizedBalances = fetchedBalances.map(asset => ({
        assetId: asset.assetId,
        balance: asset.balance,
        decimals: asset.decimals,
        maxSupply:
          typeof asset.maxSupply === "object" && asset.maxSupply !== null
            ? Number(asset.maxSupply.toString())
            : asset.maxSupply,
        symbol: typeof asset.symbol === "object" && asset.symbol !== null ? asset.symbol.toString() : asset.symbol,
      }));

      // Calculate total USD (assuming 1 token = 1 USD)
      const totalUsd = normalizedBalances.reduce((sum, asset) => {
        const balance = parseFloat(asset.balance) || 0;
        return sum + balance;
      }, 0);

      setBalances({
        balances: normalizedBalances,
        totalUsd,
      });
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    } finally {
      setBalancesLoading(false);
    }
  }, [address, client]);

  // Fetch balances when address changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    if (!client || !address) return;

    const interval = setInterval(async () => {
      const to = await client.getAccount(Address.fromBech32(address).accountId());

      if (!to) {
        console.error("Destination account not found");
        return;
      }

      const mintedNotes = await client.getConsumableNotes(Address.fromBech32(address).accountId());

      if (mintedNotes.length === 0) return;

      const mintedNoteIds = mintedNotes.map(n => n.inputNoteRecord().id().toString());
      const consumeTxRequest = client.newConsumeTransactionRequest(mintedNoteIds);
      const consumeTxHash = await client.submitNewTransaction(to.id(), consumeTxRequest);
      await client.syncState();
    }, 10000);

    return () => clearInterval(interval);
  }, [client, address]);

  const value: MidenContextType = {
    isConnected,
    wallet,
    openModal,
    logoutAsync,
    client,
    address,
    balances,
    balancesLoading,
    fetchBalances,
  };

  return (
    <MidenContext.Provider value={value}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        children
      )}
    </MidenContext.Provider>
  );
}

export function useMidenProvider() {
  const context = useContext(MidenContext);
  if (context === undefined) {
    throw new Error("useMidenProvider must be used within a MidenProvider");
  }
  return context;
}
