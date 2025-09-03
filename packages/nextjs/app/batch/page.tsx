"use client";

import BatchTransactionContainer from "@/components/Batch/BatchTransactionContainer";
import React, { useState } from "react";
import { useBatchTransactions } from "@/services/store/batchTransactions";
import { useAccountContext } from "@/contexts/AccountProvider";
import { toast } from "react-hot-toast";
import { createBatchNote } from "@/services/utils/miden/note";
import { useSendBatchTransaction } from "@/hooks/server/useSendTransaction";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { useAcceptRequest } from "@/services/api/request-payment";

export default function BatchPage() {
  // **************** Custom Hooks *******************
  const { accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { getBatchTransactions, clearBatch } = useBatchTransactions();
  const { mutateAsync: sendBatchTransaction } = useSendBatchTransaction();
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const { mutateAsync: acceptRequest } = useAcceptRequest();

  const { openModal } = useModal();

  // **************** Local State *******************
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      openModal(MODAL_IDS.BATCH_TRANSACTION_OVERVIEW, {
        sender: walletAddress,
        transactions: getBatchTransactions(walletAddress),
        onConfirm: async () => {
          setIsLoading(true);
          toast.loading("Processing batch transactions...");
          // Get all batch transactions for this wallet
          const transactions = getBatchTransactions(walletAddress);
          if (transactions.length === 0) {
            toast.dismiss();
            toast.error("No transactions in batch");
            return;
          }
          const { batch, noteIds, serialNumbers, recallableHeights } = await createBatchNote(
            walletAddress,
            transactions,
          );
          // Submit transaction to blockchain
          const txId = await submitTransactionWithOwnOutputNotes(walletAddress, batch);
          // submit transaction to server
          await sendBatchTransaction(
            transactions.map((transaction, index) => ({
              assets: [
                {
                  faucetId: transaction.tokenAddress,
                  amount: transaction.amount,
                  metadata: transaction.tokenMetadata,
                },
              ],
              private: transaction.isPrivate,
              recipient: transaction.recipient,
              recallable: true,
              recallableTime: new Date(Date.now() + transaction.recallableTime * 1000),
              recallableHeight: recallableHeights[index],
              serialNumber: serialNumbers[index],
              noteType: transaction.noteType,
              noteId: noteIds[index],
              transactionId: txId,
            })),
          );

          // we can add multiple request payments to the batch
          // we need to avoid accepting the same request payment multiple times
          const acceptedRequestPayments = new Set<number>();
          for (const transaction of transactions) {
            if (transaction.pendingRequestId) {
              if (!acceptedRequestPayments.has(transaction.pendingRequestId)) {
                await acceptRequest({ id: transaction.pendingRequestId, txid: txId });
                acceptedRequestPayments.add(transaction.pendingRequestId);
              }
            }
          }

          clearBatch(walletAddress);
          await forceRefetchRecallablePayment();
          await forceRefetchAssets();
          setIsLoading(false);
          toast.dismiss();
          toast.success("Batch transactions processed successfully");
        },
      });
    } catch (error) {
      console.error("Failed to process batch transactions:", error);
      toast.dismiss();
      toast.error("Failed to process batch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <BatchTransactionContainer isLoading={isLoading} onConfirm={handleConfirm} />
    </div>
  );
}
