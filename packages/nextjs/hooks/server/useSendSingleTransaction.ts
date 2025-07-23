import { apiServerWithAuth } from "@/services/api";
import { SendTransactionDto } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

const useSendSingleTransaction = () => {
  return useMutation({
    mutationFn: async (transaction: SendTransactionDto) => {
      return apiServerWithAuth.postData("/transactions/send-batch", transaction);
    },
  });
};

export default useSendSingleTransaction;
