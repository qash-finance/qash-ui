"use client";

import BatchTransactionContainer from "@/components/Batch/BatchTransactionContainer";
import React from "react";
import { useBatchTransactions } from "@/services/store/batchTransactions";
import { useAccountContext } from "@/contexts/AccountProvider";
import { toast } from "react-hot-toast";
import { AccountId, Felt, Note, OutputNote } from "@demox-labs/miden-sdk";
import { createP2IDRNote } from "@/services/utils/miden/note";
import { submitTransaction } from "@/services/utils/miden/transactions";
import { NoteType as MidenNoteType, OutputNotesArray } from "@demox-labs/miden-sdk";
import { useSendBatchTransaction } from "@/hooks/server/useSendTransaction";

export default function BatchPage() {
  const { accountId: walletAddress } = useAccountContext();
  const { getBatchTransactions, clearBatch } = useBatchTransactions();
  const { mutate: sendBatchTransaction, isPending: isSendingBatchTransaction } = useSendBatchTransaction();

  const handleConfirm = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      toast.loading("Processing batch transactions...");

      // Get all batch transactions for this wallet
      const transactions = getBatchTransactions(walletAddress);

      if (transactions.length === 0) {
        toast.dismiss();
        toast.error("No transactions in batch");
        return;
      }

      const batch: OutputNote[] = [];
      const serialNumbers: string[][] = [];
      const recallableHeights: number[] = [];

      // Process each transaction
      for (const transaction of transactions) {
        const amount = parseFloat(transaction.amount);
        const recallHeight = transaction.recallableHeight;
        // Create note for transaction
        const [note, noteSerialNumbers, calculatedRecallHeight] = await createP2IDRNote(
          AccountId.fromBech32(walletAddress),
          AccountId.fromBech32(transaction.recipient),
          AccountId.fromBech32(transaction.tokenAddress),
          amount * 10 ** transaction.tokenMetadata.decimals,
          transaction.isPrivate ? MidenNoteType.Private : MidenNoteType.Public,
          recallHeight,
        );
        batch.push(note);
        serialNumbers.push(noteSerialNumbers);
        recallableHeights.push(calculatedRecallHeight);
      }
      // Submit transaction to blockchain
      // await submitTransaction(new OutputNotesArray(batch), AccountId.fromBech32(walletAddress));

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
          noteId: batch[index].id().toString(),
        })),
      );

      clearBatch(walletAddress);

      toast.dismiss();
      toast.success("Batch transactions processed successfully");
    } catch (error) {
      console.error("Failed to process batch transactions:", error);
      toast.dismiss();
      toast.error("Failed to process batch transactions");
    }
  };

  return <BatchTransactionContainer onConfirm={handleConfirm} />;
}
