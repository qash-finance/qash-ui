import { openGift } from "@/services/api/gift";
import { useMutation } from "@tanstack/react-query";

const useOpenGift = () => {
  return useMutation({
    mutationFn: async (dto: { secret: string; txId: string }) => {
      const response = await openGift(dto.secret, dto.txId);
      return response;
    },
  });
};

export default useOpenGift;
