import { sendGift } from "@/services/api/gift";
import { SendGiftDto } from "@/types/gift";
import { useMutation } from "@tanstack/react-query";

const useSendGift = () => {
  return useMutation({
    mutationFn: async (sendGiftDto: SendGiftDto) => {
      const response = await sendGift(sendGiftDto);
      return response;
    },
  });
};

export default useSendGift;
