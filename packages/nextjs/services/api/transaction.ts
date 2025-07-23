import { ConsumableNote, SendTransactionDto } from "@/types/transaction";
import { apiServerWithAuth } from "./index";

const getConsumable = async (address: string) => {
  const response = await apiServerWithAuth.getData(`/transactions/consumable?userAddress=${address}`);
  return response as ConsumableNote[];
};

const getRecallable = async () => {
  const response = await apiServerWithAuth.getData(`/transactions/recall-dashboard`);
  return response;
};

const sendSingleTransaction = async (transaction: SendTransactionDto) => {
  const response = await apiServerWithAuth.postData("/transactions/send-single", transaction);
  return response;
};

const sendBatchTransaction = async (transaction: SendTransactionDto) => {
  const response = await apiServerWithAuth.postData("/transactions/send-batch", transaction);
  return response;
};

const consumeTransactions = async (transactionIds: string[]) => {
  const response = await apiServerWithAuth.putData("/transactions/consume", transactionIds);
  return response;
};

const recallBatch = async (transactionIds: string[]) => {
  const response = await apiServerWithAuth.putData("/transactions/recall", transactionIds);
  return response;
};

export { getConsumable, getRecallable, sendSingleTransaction, sendBatchTransaction, consumeTransactions, recallBatch };
