import { consumeTransactions, sendBatchTransaction, sendSingleTransaction } from "@/services/api/transaction";
import { useMutation } from "@tanstack/react-query";

const useConsumeNotes = () => {
  return useMutation({
    mutationFn: async (noteIds: string[]) => {
      const response = await consumeTransactions(noteIds);
      return response;
    },
  });
};

export default useConsumeNotes;
