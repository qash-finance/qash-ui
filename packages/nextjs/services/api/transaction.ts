import { ConsumableNote, ConsumePublicTransactionDto, RecallRequestDto, SendTransactionDto } from "@/types/transaction";
import { apiServerWithAuth } from "./index";

const getConsumable = async (latestBlockHeight: number) => {
  const response = await apiServerWithAuth.getData(`/transactions/consumable?latestBlockHeight=${latestBlockHeight}`);
  return response as {
    consumableTxs: ConsumableNote[];
    recallableTxs: ConsumableNote[];
  };
};

const getRecallable = async () => {
  const response = await apiServerWithAuth.getData(`/transactions/recall-dashboard`);
  return response;
};

const sendSingleTransaction = async (transaction: SendTransactionDto) => {
  const response = await apiServerWithAuth.postData("/transactions/send-single", transaction);
  return response;
};

const sendBatchTransaction = async (transaction: SendTransactionDto[]) => {
  const response = await apiServerWithAuth.postData("/transactions/send-batch", transaction);
  return response;
};

const consumeTransactions = async (noteIds: { noteId: string; txId: string }[]) => {
  const response = await apiServerWithAuth.putData("/transactions/consume", noteIds);
  return response;
};

const consumePublicTransactions = async (noteIds: ConsumePublicTransactionDto[]) => {
  const response = await apiServerWithAuth.putData("/transactions/consume-public", noteIds);
  return response;
};

const recallBatch = async (recallRequest: RecallRequestDto) => {
  const response = await apiServerWithAuth.putData("/transactions/recall", recallRequest);
  return response;
};

export {
  getConsumable,
  getRecallable,
  sendSingleTransaction,
  sendBatchTransaction,
  consumeTransactions,
  consumePublicTransactions,
  recallBatch,
};
