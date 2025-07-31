import { recallBatch } from "@/services/api/transaction";
import { RecallRequestDto } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

const useRecall = () => {
  return useMutation({
    mutationFn: async (recallRequest: RecallRequestDto) => {
      const response = await recallBatch(recallRequest);
      return response;
    },
  });
};

export default useRecall;
