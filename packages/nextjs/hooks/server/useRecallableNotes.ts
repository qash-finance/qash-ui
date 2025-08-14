/* eslint-disable react-hooks/rules-of-hooks */
import { getRecallable } from "@/services/api/transaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { STALE_TIME } from "@/services/utils/constant";
import { RecallableDashboard } from "@/types/transaction";

export function useRecallableNotes() {
  const queryClient = useQueryClient();
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recallable-notes", walletAddress],
    queryFn: async (): Promise<RecallableDashboard> => {
      const recallableNotes: RecallableDashboard = await getRecallable();
      return recallableNotes;
    },
    enabled: !!walletAddress,
    staleTime: STALE_TIME,
    gcTime: 5 * 60 * 1000, // Garbage collect after 5 minutes
    refetchInterval: 5000, // Refetch every 5 second
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  const forceFetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["recallable-notes", walletAddress],
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
