import { apiServerWithAuth } from "./index";
import { Gift, GiftDashboardDto, SendGiftDto } from "@/types/gift";

const sendGift = async (gift: SendGiftDto) => {
  const response = await apiServerWithAuth.postData(`/gift/send`, gift);
  return response;
};

const getGiftDashboard = async () => {
  const response = await apiServerWithAuth.get(`/gift/dashboard`);
  return response.data as GiftDashboardDto;
};

const getGiftDetail = async (secretNumber: string) => {
  const response = await apiServerWithAuth.get(`/gift/detail?secret=${secretNumber}`);
  return response.data as Gift;
};

export { sendGift, getGiftDashboard, getGiftDetail };
