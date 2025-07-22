import { ConsumableNote, SendTransactionDto } from "@/types/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";

// *************************************************
// **************** TANSTACK QUERY HOOKS ************
// *************************************************

// Create a single shared API client instance
const apiClient = new AuthenticatedApiClient(
  process.env.NEXT_PUBLIC_SERVER_URL || "",
  () => {
    const auth = AuthStorage.getAuth();
    return auth?.sessionToken || null;
  },
  async () => {
    // TODO: Implement token refresh logic
    // For now, just clear auth and redirect to login
  },
  () => {},
);

// *************************************************
// **************** GET METHODS *******************
// *************************************************

const useGetConsumable = (address: string) => {
  return useQuery({
    queryKey: ["consumable", address],
    queryFn: async () => {
      const response = await apiClient.getData(`/transactions/consumable?userAddress=${address}`);
      return response as ConsumableNote[];
    },
    enabled: !!address,
  });
};

const useGetRecallable = () => {
  return useQuery({
    queryKey: ["recallable"],
    queryFn: async () => {
      return apiClient.getData(`/transactions/recall-dashboard`);
    },
  });
};

// *************************************************
// **************** POST METHODS *******************
// *************************************************

const useSendSingleTransaction = () => {
  return useMutation({
    mutationFn: async (transaction: SendTransactionDto) => {
      return apiClient.postData("/transactions/send-single", transaction);
    },
  });
};

const useSendBatchTransaction = () => {
  return useMutation({
    mutationFn: async (transaction: SendTransactionDto) => {
      return apiClient.postData("/transactions/send-batch", transaction);
    },
  });
};

// *************************************************
// **************** PUT METHODS *******************
// *************************************************
const useConsumeTransactions = (address: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionIds: string[]) => {
      return apiClient.putData("/transactions/consume", transactionIds);
    },
    onMutate: async (transactionIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["consumable", address] });
      const previousConsumable = queryClient.getQueryData(["consumable", address]);
      console.log("🚀 ~ onMutate: ~ previousConsumable:", previousConsumable);

      queryClient.setQueryData(["consumable", address], (old: ConsumableNote[] | undefined) => {
        if (!old) return old;
        return old.filter(note => !transactionIds.includes(note.id.toString()));
      });
      return { previousConsumable };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["consumable", address] });
    },
  });
};

const useRecallBatch = () => {
  return useMutation({
    mutationFn: async (transactionIds: string[]) => {
      return apiClient.putData("/transactions/recall", transactionIds);
    },
  });
};

export {
  useGetConsumable,
  useSendSingleTransaction,
  useSendBatchTransaction,
  useGetRecallable,
  useConsumeTransactions,
  useRecallBatch,
};
