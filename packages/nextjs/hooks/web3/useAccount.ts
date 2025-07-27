"use client";
import { useState, useEffect } from "react";
import { AccountId, ConsumableNoteRecord } from "@demox-labs/miden-sdk";
import { getConsumableNotes } from "../../services/utils/miden/note";
import { getAccountAssets } from "@/services/utils/miden/account";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { useWalletAuth } from "../server/useWalletAuth";
import { formatUnits } from "viem";
import { useQuery } from "@tanstack/react-query";

// Default QASH token that should always be present
const defaultQashToken: AssetWithMetadata = {
  faucetId: QASH_TOKEN_ADDRESS,
  amount: "0",
  metadata: {
    symbol: QASH_TOKEN_SYMBOL,
    decimals: QASH_TOKEN_DECIMALS,
    maxSupply: QASH_TOKEN_MAX_SUPPLY,
  },
};

interface AccountData {
  assets: AssetWithMetadata[];
  consumableNotes: ConsumableNoteRecord[] | null;
  isAccountDeployed: boolean;
  accountBalance: string;
  error?: unknown;
}

// Retry utility function with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error; // Final attempt failed, throw the error
      }

      await new Promise(resolve => setTimeout(resolve, baseDelay));
    }
  }

  throw lastError;
};

// Function to fetch assets and notes
const fetchAccountData = async (walletAddress: string | null): Promise<AccountData> => {
  if (!walletAddress || walletAddress.trim() === "") {
    return {
      assets: [defaultQashToken],
      consumableNotes: null,
      isAccountDeployed: true,
      accountBalance: "0",
    };
  }

  let accountId;
  try {
    accountId = AccountId.fromBech32(walletAddress);
  } catch (error) {
    return {
      assets: [defaultQashToken],
      consumableNotes: null,
      isAccountDeployed: true,
      accountBalance: "0",
    };
  }

  try {
    // Fetch assets and notes in parallel
    const [accountAssets, consumableNotes] = await Promise.all([
      retryWithBackoff(() => getAccountAssets(walletAddress)),
      retryWithBackoff(() => getConsumableNotes(walletAddress)),
    ]);

    // merge QASH token with account assets, replacing if exists
    const mergedAssets = [defaultQashToken, ...accountAssets.filter(asset => asset.faucetId !== QASH_TOKEN_ADDRESS)];

    // if QASH exists in accountAssets, update its amount
    const qashFromAccount = accountAssets.find(asset => asset.faucetId === QASH_TOKEN_ADDRESS);
    if (qashFromAccount) {
      mergedAssets[0] = {
        ...defaultQashToken,
        amount: qashFromAccount.amount,
      };
    }

    // Calculate total balance
    const totalBalance = mergedAssets.reduce((acc, asset) => {
      return acc + Number(formatUnits(BigInt(Math.round(Number(asset.amount))), asset.metadata.decimals));
    }, 0);

    return {
      assets: mergedAssets,
      consumableNotes,
      isAccountDeployed: true,
      accountBalance: totalBalance.toString(),
    };
  } catch (err) {
    const error = String(err);
    const isNotFound = error.includes("status: NotFound");

    return {
      assets: [defaultQashToken],
      consumableNotes: null,
      isAccountDeployed: !isNotFound,
      accountBalance: "0",
      error: err,
    };
  }
};

export function useAccount() {
  const { isAuthenticated, walletAddress } = useWalletAuth();

  const {
    data: accountData,
    isLoading: loading,
    error,
    refetch: refetchAssets,
  } = useQuery<AccountData>({
    queryKey: ["accountData", walletAddress],
    queryFn: () => fetchAccountData(walletAddress),
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    staleTime: 30000, // Consider data fresh for 30 seconds
    enabled: !!walletAddress && isAuthenticated,
    retry: 3,
  });

  const defaultData: AccountData = {
    assets: [defaultQashToken],
    consumableNotes: null,
    isAccountDeployed: true,
    accountBalance: "0",
  };

  return {
    assets: accountData?.assets || defaultData.assets,
    refetchAssets,
    accountBalance: accountData?.accountBalance || defaultData.accountBalance,
    loading,
    error,
    isAccountDeployed: accountData?.isAccountDeployed ?? defaultData.isAccountDeployed,
    consumableNotes: accountData?.consumableNotes || defaultData.consumableNotes,
    accountId: walletAddress,
    isError: !!error,
  };
}
