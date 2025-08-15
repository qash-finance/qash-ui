/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { STALE_TIME } from "@/services/utils/constant";
import { getGiftDetail } from "@/services/api/gift";
import { Gift } from "@/types/gift";

export function useGiftDetail(secretNumber: string) {
  const queryClient = useQueryClient();
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["gift-detail", walletAddress, secretNumber],
    queryFn: async (): Promise<Gift> => {
      const giftDetail = await getGiftDetail(secretNumber);
      return giftDetail;
    },
    enabled: !!walletAddress && !!secretNumber,
    staleTime: STALE_TIME,
    refetchInterval: STALE_TIME,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const forceFetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["gift-detail", walletAddress, secretNumber],
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
