/* eslint-disable react-hooks/rules-of-hooks */
import { getRecallable } from "@/services/api/transaction";
import { useQuery } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { STALE_TIME } from "@/services/utils/constant";
import { RecallableDashboard } from "@/types/transaction";

export function useRecallableNotes() {
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recallable-notes", walletAddress],
    queryFn: async (): Promise<RecallableDashboard> => {
      const recallableNotes: RecallableDashboard = await getRecallable();
      return recallableNotes;
    },
    enabled: !!walletAddress,
    staleTime: STALE_TIME,
    // Only refetch every 5 minutes and when the window is focused
    refetchInterval: STALE_TIME,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
