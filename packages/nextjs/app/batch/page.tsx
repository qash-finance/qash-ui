"use client";

import BatchTransactionContainer from "@/components/Batch/BatchTransactionContainer";
import React, { useState } from "react";
import { useBatchTransactions } from "@/services/store/batchTransactions";
import { useAccountContext } from "@/contexts/AccountProvider";
import { toast } from "react-hot-toast";
import { AccountId, OutputNote } from "@demox-labs/miden-sdk";
import { createP2IDENote } from "@/services/utils/miden/note";
import { NoteType as MidenNoteType, OutputNotesArray } from "@demox-labs/miden-sdk";
import { useSendBatchTransaction } from "@/hooks/server/useSendTransaction";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

export default function BatchPage() {
  // **************** Custom Hooks *******************
  const { accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { getBatchTransactions, clearBatch } = useBatchTransactions();
  const { mutate: sendBatchTransaction } = useSendBatchTransaction();
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
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
          const batch: OutputNote[] = [];
          const noteIds: string[] = [];
          const serialNumbers: string[][] = [];
          const recallableHeights: number[] = [];
          // Process each transaction
          for (const transaction of transactions) {
            console.log(transaction);
            const amount = parseFloat(transaction.amount);
            const recallHeight = transaction.recallableHeight;
            // Create note for transaction
            const [note, noteSerialNumbers, calculatedRecallHeight] = await createP2IDENote(
              AccountId.fromBech32(walletAddress),
              AccountId.fromBech32(transaction.recipient),
              AccountId.fromBech32(transaction.tokenAddress),
              Math.round(amount * Math.pow(10, transaction.tokenMetadata.decimals)),
              transaction.isPrivate ? MidenNoteType.Private : MidenNoteType.Public,
              recallHeight,
            );
            batch.push(note);
            noteIds.push(note.id().toString());
            serialNumbers.push(noteSerialNumbers);
            recallableHeights.push(calculatedRecallHeight);
          }
          // Submit transaction to blockchain
          const txId = await submitTransactionWithOwnOutputNotes(
            new OutputNotesArray(batch),
            AccountId.fromBech32(walletAddress),
          );
          // submit transaction to server
          sendBatchTransaction(
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
          clearBatch(walletAddress);
          await forceRefetchRecallablePayment();
          await forceRefetchAssets();
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
