"use client";
import { useState, useEffect } from "react";
import { useClient } from "./useClient";
import { AccountId, ConsumableNoteRecord, FungibleAsset } from "@demox-labs/miden-sdk";
import { getConsumableNotes } from "../../services/utils/note";
import { getAccountAssets, importAndGetAccount } from "@/services/utils/account";
import { AssetWithMetadata, FaucetMetadata } from "@/types/faucet";

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

export function useAccount(address: string) {
  const [assets, setAssets] = useState<AssetWithMetadata[]>([]);
  const [consumableNotes, setConsumableNotes] = useState<ConsumableNoteRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isAccountDeployed, setIsAccountDeployed] = useState(true);

  useEffect(() => {
    if (!address || address.trim() === "") {
      setAssets([]);
      setConsumableNotes(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAssets = async () => {
      let accountId;
      try {
        accountId = AccountId.fromBech32(address);
      } catch (error) {
        setAssets([]);
        setConsumableNotes(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Retry mechanism for getting account assets
        const accountAsset = await retryWithBackoff(async () => {
          return await getAccountAssets(address);
        });

        setAssets(accountAsset);

        // Retry mechanism for getting consumable notes
        const consumableNotes = await retryWithBackoff(async () => {
          return await getConsumableNotes(address);
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
  }, [address]);

  return {
    assets,
    loading,
    error,
    isAccountDeployed,
    consumableNotes,
    accountId: address,
    isError: !!error,
  };
}
