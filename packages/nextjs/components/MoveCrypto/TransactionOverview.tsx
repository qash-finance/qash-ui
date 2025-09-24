"use client";

import React, { useState } from "react";
import { SecondaryButton } from "../Common/SecondaryButton";
import { formatAddress } from "@/services/utils/miden/address";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import toast from "react-hot-toast";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { BLOCK_TIME, MIDEN_EXPLORER_URL, REFETCH_DELAY } from "@/services/utils/constant";
import { AssetWithMetadata } from "@/types/faucet";
import { createP2IDENote } from "@/services/utils/miden/note";
import { CustomNoteType, WrappedNoteType } from "@/types/note";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { sendSingleTransaction } from "@/services/api/transaction";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useBatchTransactions } from "@/services/store/batchTransactions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

interface SendTransactionFormValues {
  amount: number;
  recipientAddress: string;
  recallableTime: number;
  isPrivateTransaction: boolean;
  message?: string;
}

const itemStyle = "flex flex-rol justify-between items-center py-3 px-5 border-b border-[#C8CBD0]";

interface TransactionOverviewProps {
  amount?: string;
  accountName?: string;
  accountAddress: string;
  recipientName?: string;
  recipientAddress: string;
  transactionType?: string;
  cancellableTime?: string;
  message?: string;
  onBack?: () => void;
  tokenAddress?: string;
  tokenSymbol?: string;
  recallableTimeSeconds?: number; // Add recallable time in seconds
}

export const TransactionOverview = ({
  amount,
  accountName,
  accountAddress,
  recipientName,
  recipientAddress,
  transactionType,
  cancellableTime,
  message,
  onBack,
  tokenAddress,
  tokenSymbol,
  recallableTimeSeconds,
}: TransactionOverviewProps) => {
  const { addTransaction, getBatchTransactions, removeTransaction } = useBatchTransactions(state => state);
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { openModal, closeModal } = useModal();
  const [isSending, setIsSending] = useState(false);
  const recallableTime = recallableTimeSeconds || 3600; // Default to 1 hour if not provided

  // Find the selected token from assets based on tokenAddress
  const selectedToken = assets.find(asset => asset.faucetId === tokenAddress) || {
    amount: "0",
    faucetId: tokenAddress || "",
    metadata: {
      symbol: tokenSymbol || "",
      decimals: 8, // Default decimals for QASH
      maxSupply: 0,
    },
  };

  const onConfirm = async () => {
    // Open processing modal first
    openModal(MODAL_IDS.PROCESSING_TRANSACTION, {});

    setIsSending(true);

    // each block is 5 seconds, calculate recall height
    const recallHeight = Math.floor(recallableTime / BLOCK_TIME);

    // Create AccountId objects once to avoid aliasing issues
    const senderAccountId = walletAddress;
    const recipientAccountId = recipientAddress;
    const faucetAccountId = selectedToken.faucetId;

    await handleSingleSendTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, {
      amount: parseFloat(amount || "0"),
      recipientAddress,
      recallableTime,
      isPrivateTransaction: false,
      message,
    });

    // if (schedulePayment.times !== undefined) {
    //   await handleSchedulePaymentTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, data);
    // } else {
    //   await handleSingleSendTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, data);
    // }
  };

  const handleSingleSendTransaction = async (
    senderAccountId: string,
    recipientAccountId: string,
    faucetAccountId: string,
    recallHeight: number,
    data: SendTransactionFormValues,
  ) => {
    const { amount, recipientAddress, recallableTime, isPrivateTransaction } = data;

    try {
      // create note
      const [note, serialNumbers, noteRecallHeight] = await createP2IDENote(
        senderAccountId,
        recipientAccountId,
        faucetAccountId,
        Math.round(amount * Math.pow(10, selectedToken.metadata.decimals)),
        isPrivateTransaction ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
        recallHeight,
      );

      const noteId = note.id().toString();

      // submit transaction to miden
      const txId = await submitTransactionWithOwnOutputNotes(senderAccountId, [note]);
      console.log("isPrivateTransaction", isPrivateTransaction);
      // submit transaction to server
      const response = await sendSingleTransaction({
        assets: [{ faucetId: selectedToken.faucetId, amount: amount.toString(), metadata: selectedToken.metadata }],
        private: isPrivateTransaction,
        recipient: recipientAddress,
        recallable: true,
        recallableTime: new Date(Date.now() + recallableTime * 1000),
        recallableHeight: noteRecallHeight,
        serialNumber: serialNumbers,
        noteType: CustomNoteType.P2IDR,
        noteId: noteId,
        transactionId: txId,
      });

      setTimeout(() => {
        forceRefetchAssets();
        forceRefetchRecallablePayment();
        // if (schedulePayment) {
        //   refetchSchedulePayments();
        // }
      }, REFETCH_DELAY);

      if (response) {
        // Close processing modal and open transaction overview modal
        closeModal(MODAL_IDS.PROCESSING_TRANSACTION);

        openModal(MODAL_IDS.TRANSACTION_OVERVIEW, {
          amount,
          accountName,
          accountAddress,
          recipientName,
          recipientAddress,
          transactionType,
          cancellableTime,
          message,
          tokenAddress,
          tokenSymbol,
          transactionHash: txId,
        });

        onBack?.();

        const batchTransactions = getBatchTransactions(walletAddress);
        const matchedTransactions = batchTransactions.filter(tx => {
          return (
            tx.tokenAddress === selectedToken.faucetId &&
            tx.amount === amount.toString() &&
            tx.recipient === recipientAddress &&
            tx.isPrivate === isPrivateTransaction &&
            tx.recallableTime === recallableTime
          );
        });
        matchedTransactions.forEach(tx => removeTransaction(walletAddress, tx.id));
      }
    } catch (error) {
      // Close processing modal on error
      closeModal(MODAL_IDS.PROCESSING_TRANSACTION);
      console.error("Failed to send transaction:", error);
      toast.error("Failed to send transaction :(");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`flex flex-col bg-base-container-main-background rounded-4xl p-[1px] w-[600px]`}>
      <div className="flex min-h-[50px] justify-center items-center">Transaction Overview</div>

      <div className="flex p-3 justify-center items-center flex-row bg-base-container-sub-background rounded-3xl border-t-1 border-base-container-sub-border-top gap-15">
        <div className="flex flex-col gap-2 justify-center items-center">
          <span className="text-text-secondary text-sm leading-none">You're about to send</span>
          <div className="flex flex-row gap-2 items-center ">
            <img src={"/token/qash.svg"} alt={tokenSymbol} className="w-7 h-7" />
            <span className="text-text-primary font-bold leading-none text-xl">
              {amount} {tokenSymbol}
            </span>
          </div>
        </div>

        <img src="/arrow/hexagon-arrow-right.svg" alt="Arrow" className="w-12 h-12" />

        <div className="flex flex-col gap-2 justify-center items-center">
          <div className="flex justify-center items-center rounded-full bg-base-container-main-background px-3 py-1.5 border border-[#C8CBD0]">
            <span className="text-text-secondary text-sm leading-none">Recipient</span>
          </div>
          <div className="flex flex-row gap-2 items-center ">
            <img src={blo(turnBechToHex(recipientAddress))} alt={tokenSymbol} className="w-7 h-7 rounded-full" />
            <span className="text-text-primary font-bold leading-none text-xl">{recipientName}</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <span className="text-text-secondary text-sm leading-none">{formatAddress(recipientAddress)}</span>
            <img
              src="/misc/copy-icon.svg"
              alt="Edit"
              className="w-5 h-5 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(recipientAddress);
                toast.success("Copied to clipboard");
              }}
            />
          </div>
        </div>
      </div>

      <div className={itemStyle}>
        <span>Type</span>
        <span>{transactionType}</span>
      </div>

      <div className={itemStyle}>
        <span>Cancellable in</span>
        <span>{cancellableTime}</span>
      </div>

      <div className={itemStyle}>
        <span>Message</span>
        <span className="text-right word-wrap break-words w-[360px] truncate">{message}</span>
      </div>

      <div className="flex flex-rol justify-between items-center p-4 gap-20">
        <div className="flex justify-between items-center flex-row bg-base-container-sub-background rounded-xl border-t-1 border-base-container-sub-border-top flex-1 p-3">
          <div className="flex flex-row items-center gap-2">
            <img src={blo(turnBechToHex(accountAddress))} alt={tokenSymbol} className="w-7 h-7 rounded-full" />
            <div className="flex flex-col gap-1">
              <span className="text-text-secondary text-sm leading-none">Account</span>
              <span className="text-text-primary text-sm leading-none">(Q3x) {formatAddress(accountAddress)}</span>
            </div>
          </div>
          <img src="/arrow/chevron-down.svg" alt="Edit" className="w-5 h-5" />
        </div>
        <SecondaryButton text="Confirm and Send" buttonClassName="flex-1" onClick={onConfirm} />
      </div>
    </div>
  );
};
