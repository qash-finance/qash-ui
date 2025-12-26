"use client";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { useWalletAuth } from "../server/useWalletAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  isAccountDeployed: boolean;
  accountBalance: string;
  error?: unknown;
}

// Function to fetch assets and notes
const fetchAccountData = async (walletAddress: string | null): Promise<AccountData> => {
  return {
    assets: [defaultQashToken],
    isAccountDeployed: false,
    accountBalance: "0",
    error: "",
  };
};

export function useAccount() {
  const { isAuthenticated, walletAddress } = useWalletAuth();
  const queryClient = useQueryClient();

  const {
    data: accountData,
    isLoading: loading,
    error,
    refetch: refetchAssets,
  } = useQuery<AccountData>({
    queryKey: ["account-data", walletAddress],
    queryFn: () => fetchAccountData(walletAddress),
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    staleTime: 30000, // Consider data fresh for 30 seconds
    enabled: !!walletAddress && isAuthenticated,
    retry: 3,
  });

  const forceFetch = async () => {
    // repeat 3 times, each with 3 seconds delay
    for (let i = 0; i < 5; i++) {
      queryClient.invalidateQueries({ queryKey: ["account-data", walletAddress] });
      await refetchAssets();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  };

  const defaultData: AccountData = {
    assets: [defaultQashToken],
    isAccountDeployed: true,
    accountBalance: "0",
  };

  return {
    assets: accountData?.assets || defaultData.assets,
    refetchAssets,
    forceFetch,
    accountBalance: accountData?.accountBalance || defaultData.accountBalance,
    loading,
    error,
    isAccountDeployed: accountData?.isAccountDeployed ?? defaultData.isAccountDeployed,
    accountId: walletAddress,
    isError: !!error,
  };
}
