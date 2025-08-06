import { apiServerWithAuth } from "./index";
import { Gift, GiftDashboardDto, SendGiftDto } from "@/types/gift";

const sendGift = async (gift: SendGiftDto) => {
  const response = await apiServerWithAuth.postData(`/gift/send`, gift);
  return response;
};

const openGift = async (secret: string, txId: string) => {
  const response = await apiServerWithAuth.putData(`/gift/open`, { txId, secret });
  return response.data;
};

const getGiftDashboard = async () => {
  const response = await apiServerWithAuth.get(`/gift/dashboard`);
  return response.data as GiftDashboardDto;
};

const getGiftDetail = async (secretNumber: string) => {
  const response = await apiServerWithAuth.get(`/gift/detail?secret=${secretNumber}`);
  return response.data as Gift;
};

export { sendGift, getGiftDashboard, getGiftDetail, openGift };
