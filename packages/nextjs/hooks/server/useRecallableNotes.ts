/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { STALE_TIME } from "@/services/utils/constant";

export function useRecallableNotes() {
  const queryClient = useQueryClient();
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recallable-notes", walletAddress],
    queryFn: async (): Promise<any> => {
      return [];
      // const recallableNotes: RecallableDashboard = await getRecallable();
      // return recallableNotes;
    },
    enabled: !!walletAddress,
    staleTime: STALE_TIME,
    gcTime: 5 * 60 * 1000, // Garbage collect after 5 minutes
    refetchInterval: 25000, // Refetch every 25 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  const forceFetch = async () => {
    // repeat 3 times, each with 3 seconds delay
    for (let i = 0; i < 3; i++) {
      queryClient.invalidateQueries({ queryKey: ["recallable-notes", walletAddress] });
      await refetch();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    forceFetch,
  };
}
