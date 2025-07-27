import { consumeTransactions, sendBatchTransaction, sendSingleTransaction } from "@/services/api/transaction";
import { useMutation } from "@tanstack/react-query";

const useConsumeNotes = () => {
  return useMutation({
    mutationFn: async (transactionIds: string[]) => {
      const response = await consumeTransactions(transactionIds);
      return response;
    },
  });
};

export default useConsumeNotes;
