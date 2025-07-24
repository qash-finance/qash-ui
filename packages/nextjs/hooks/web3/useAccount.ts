"use client";
import { useState, useEffect } from "react";
import { useClient } from "./useClient";
import { AccountId, ConsumableNoteRecord, FungibleAsset } from "@demox-labs/miden-sdk";
import { getConsumableNotes } from "../../services/utils/miden/note";
import { getAccountAssets, importAndGetAccount } from "@/services/utils/miden/account";
import { AssetWithMetadata, FaucetMetadata } from "@/types/faucet";
import { qashTokenAddress, qashTokenDecimals, qashTokenMaxSupply, qashTokenSymbol } from "@/services/utils/constant";
import { useWalletAuth } from "../server/useWalletAuth";

// Default QASH token that should always be present
const defaultQashToken: AssetWithMetadata = {
  tokenAddress: qashTokenAddress,
  amount: "0",
  metadata: {
    symbol: qashTokenSymbol,
    decimals: qashTokenDecimals,
    maxSupply: qashTokenMaxSupply,
  },
};

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

export function useAccount() {
  const { isAuthenticated, walletAddress } = useWalletAuth();
  const [assets, setAssets] = useState<AssetWithMetadata[]>([defaultQashToken]);
  const [consumableNotes, setConsumableNotes] = useState<ConsumableNoteRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isAccountDeployed, setIsAccountDeployed] = useState(true);

  useEffect(() => {
    if (!walletAddress || walletAddress.trim() === "") {
      setAssets([defaultQashToken]);
      setConsumableNotes(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAssets = async () => {
      let accountId;
      try {
        accountId = AccountId.fromBech32(walletAddress);
      } catch (error) {
        setAssets([defaultQashToken]);
        setConsumableNotes(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Retry mechanism for getting account assets
        const accountAssets = await retryWithBackoff(async () => {
          return await getAccountAssets(walletAddress);
        });

        // Merge QASH token with account assets, replacing if exists
        const mergedAssets = [
          defaultQashToken,
          ...accountAssets.filter(asset => asset.tokenAddress !== qashTokenAddress),
        ];

        // If QASH exists in accountAssets, update its amount
        const qashFromAccount = accountAssets.find(asset => asset.tokenAddress === qashTokenAddress);
        if (qashFromAccount) {
          mergedAssets[0] = {
            ...defaultQashToken,
            amount: qashFromAccount.amount,
          };
        }

        setAssets(mergedAssets);

        // Retry mechanism for getting consumable notes
        const consumableNotes = await retryWithBackoff(async () => {
          return await getConsumableNotes(walletAddress);
        });

        setConsumableNotes(consumableNotes);
      } catch (err) {
        const error = String(err);
        if (error.includes("status: NotFound")) {
          // account didnt do any transaction
          setIsAccountDeployed(false);
        }
        setError(err);
        console.error("Failed to fetch account data after 3 retries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [walletAddress, isAuthenticated]);

  return {
    assets,
    loading,
    error,
    isAccountDeployed,
    consumableNotes,
    accountId: walletAddress,
    isError: !!error,
  };
}
