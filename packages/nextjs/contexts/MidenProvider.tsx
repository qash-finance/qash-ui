"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAccount, useLogout, useModal, useWallet, Wallet } from "@getpara/react-sdk";
import { useMiden } from "@/hooks/web3/useMiden";
import { getBalance } from "@/services/utils/getBalance";
import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";

// Type definition for the context
interface MidenContextType {
  isConnected: boolean;
  isLoading: boolean;
  wallet: Omit<Wallet, "signer"> | null | undefined;
  openModal: (config?: any) => void;
  logoutAsync: UseMutateAsyncFunction<
    void,
    Error,
    void | {
      clearPregenWallets?: boolean | undefined;
    },
    unknown
  >;
  client: any;
  address: string | undefined;
  balances: Array<{
    assetId: string;
    balance: string;
  }> | null;
}

// Create the context
const MidenContext = createContext<MidenContextType | undefined>(undefined);

// Provider component
export function MidenProvider({ children }: { children: ReactNode }) {
  const { isConnected, isLoading } = useAccount();
  const { data: wallet } = useWallet();
  const { openModal } = useModal();
  const { logoutAsync } = useLogout();
  const { client, accountId: address } = useMiden("https://rpc.testnet.miden.io");
  const [balances, setBalances] = useState<Array<{
    assetId: string;
    balance: string;
  }> | null>(null);

  // Fetch balances when address changes
  useEffect(() => {
    if (!address) return;

    const fetchBalances = async () => {
      try {
        const fetchedBalances = await getBalance(address);
        setBalances(fetchedBalances);
      } catch (err) {
        console.error("Failed to fetch balances:", err);
      }
    };

    fetchBalances();
  }, [address]);

  useEffect(() => {
    if (!client) return;

    const interval = setInterval(async () => {
      const { Address } = await import("@demox-labs/miden-sdk");
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
    isLoading,
    isConnected,
    wallet,
    openModal,
    logoutAsync,
    client,
    address,
    balances,
  };

  return <MidenContext.Provider value={value}>{children}</MidenContext.Provider>;
}

// Custom hook to use the context
export function useMidenProvider() {
  const context = useContext(MidenContext);
  if (context === undefined) {
    throw new Error("useMidenProvider must be used within a MidenProvider");
  }
  return context;
}
