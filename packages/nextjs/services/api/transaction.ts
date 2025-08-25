import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConsumableNote, ConsumePublicTransactionDto, RecallRequestDto, SendTransactionDto } from "@/types/transaction";
import { apiServerWithAuth } from "./index";

const getConsumable = async (latestBlockHeight: number) => {
  const response = await apiServerWithAuth.getData(`/transactions/consumable?latestBlockHeight=${latestBlockHeight}`);
  return response as {
    consumableTxs: ConsumableNote[];
    recallableTxs: ConsumableNote[];
  };
};

const getRecallable = async () => {
  const response = await apiServerWithAuth.getData(`/transactions/recall-dashboard`);
  return response;
};

const sendSingleTransaction = async (transaction: SendTransactionDto) => {
  const response = await apiServerWithAuth.postData("/transactions/send-single", transaction);
  return response;
};

const sendBatchTransaction = async (transaction: SendTransactionDto[]) => {
  const response = await apiServerWithAuth.postData("/transactions/send-batch", transaction);
  return response;
};

const consumeTransactions = async (noteIds: { noteId: string; txId: string }[]) => {
  const response = await apiServerWithAuth.putData("/transactions/consume", noteIds);
  return response;
};

const consumePublicTransactions = async (noteIds: ConsumePublicTransactionDto[]) => {
  const response = await apiServerWithAuth.putData("/transactions/consume-public", noteIds);
  return response;
};

const useConsumePublicNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteIds: ConsumePublicTransactionDto[]) => {
      const response = await apiServerWithAuth.putData("/transactions/consume-public", noteIds);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["consumable"] });
      queryClient.invalidateQueries({ queryKey: ["recallable"] });

      // Invalidate schedule payments cache since consume public affects them
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
    onError: error => {
      console.error("Error consuming public transactions:", error);
    },
  });
};

const useRecallBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recallRequest: RecallRequestDto) => {
      const response = await apiServerWithAuth.putData("/transactions/recall", recallRequest);
      return response;
    },
    onSuccess: () => {
      // Invalidate transactions cache
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["consumable"] });
      queryClient.invalidateQueries({ queryKey: ["recallable"] });

      // Invalidate schedule payments cache since recall affects them
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

const useTopInteractedWallets = () => {
  return useQuery<
    {
      walletAddress: string;
      accumulatedAmount: number;
      transactionCount: number;
      rank: number;
    }[]
  >({
    queryKey: ["top-interacted-wallets"],
    queryFn: async () => {
      return apiServerWithAuth.getData("/transactions/top-interacted-wallets");
    },
  });
};

export {
  getConsumable,
  getRecallable,
  sendSingleTransaction,
  sendBatchTransaction,
  consumeTransactions,
  consumePublicTransactions,
  useTopInteractedWallets,
  useRecallBatch,
  useConsumePublicNotes,
};
