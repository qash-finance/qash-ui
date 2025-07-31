import { consumePublicTransactions, consumeTransactions } from "@/services/api/transaction";
import { ConsumePublicTransactionDto } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

const useConsumePublicNotes = () => {
  return useMutation({
    mutationFn: async (noteIds: ConsumePublicTransactionDto[]) => {
      const response = await consumePublicTransactions(noteIds);
      return response;
    },
  });
};

export default useConsumePublicNotes;
