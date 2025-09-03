/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { STALE_TIME } from "@/services/utils/constant";
import { getGiftDashboard } from "@/services/api/gift";
import { GiftDashboardDto } from "@/types/gift";

export function useGiftDashboard() {
  const queryClient = useQueryClient();
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["gift-dashboard", walletAddress],
    queryFn: async (): Promise<GiftDashboardDto> => {
      const giftDashboard = await getGiftDashboard();
      return giftDashboard;
    },
    enabled: !!walletAddress,
    staleTime: STALE_TIME,
    refetchInterval: STALE_TIME,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const forceFetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["gift-dashboard", walletAddress],
    });
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    forceFetch,
  };
}
