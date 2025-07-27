import { sendBatchTransaction, sendSingleTransaction } from "@/services/api/transaction";
import { SendTransactionDto } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

const useSendSingleTransaction = () => {
  return useMutation({
    mutationFn: async (transaction: SendTransactionDto) => {
      const response = await sendSingleTransaction(transaction);
      return response;
    },
  });
};

const useSendBatchTransaction = () => {
  return useMutation({
    mutationFn: async (transaction: SendTransactionDto[]) => {
      const response = await sendBatchTransaction(transaction);
      return response;
    },
  });
};

export { useSendSingleTransaction, useSendBatchTransaction };
