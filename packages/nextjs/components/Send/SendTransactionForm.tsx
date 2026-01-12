"use client";
import React, { useState, useCallback } from "react";
import { AmountInput } from "./AmountInput";
import { TransactionOptions } from "./TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, RemoveSchedulePaymentProps, SetupSchedulePaymentModalProps } from "@/types/modal";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { createP2IDENote, createBatchNote, createBatchSchedulePaymentNote } from "@/services/utils/miden/note";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useAccountContext } from "@/contexts/AccountProvider";
import { getDefaultSelectedToken } from "@/services/utils/tokenSelection";
import { useEffect } from "react";
import { AssetWithMetadata } from "@/types/faucet";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_SYMBOL,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_MAX_SUPPLY,
  BLOCK_TIME,
  REFETCH_DELAY,
  MIDEN_EXPLORER_URL,
} from "@/services/utils/constant";
import { useSearchParams } from "next/navigation";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { useSendSingleTransaction, useSendBatchTransaction } from "@/hooks/server/useSendTransaction";
import { CustomNoteType, WrappedNoteType } from "@/types/note";
import { useBatchTransactions } from "@/services/store/batchTransactions";
import { formatUnits } from "viem";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useAcceptRequest } from "@/services/api/request-payment";
import { RecipientInput } from "./RecipientInput";
import { SchedulePaymentFrequency } from "@/types/schedule-payment";
import { useCreateSchedulePayment, useGetSchedulePayments } from "@/services/api/schedule-payment";
import { calculateClaimableTime } from "@/services/utils/claimableTime";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { PrimaryButton } from "../Common/PrimaryButton";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { ToggleSwitch } from "../Common/ToggleSwitch";
export enum AmountInputTab {
  SEND = "send",
  STREAM = "stream",
}

interface SendTransactionFormProps {
  activeTab?: AmountInputTab;
  onTabChange?: (tab: AmountInputTab) => void;
  onTransactionData?: (data: {
    amount: string;
    accountName: string;
    accountAddress: string;
    recipientName: string;
    recipientAddress: string;
    transactionType: string;
    cancellableTime: string;
    message: string;
    tokenAddress: string;
    tokenSymbol: string;
    recallableTimeSeconds: number;
  }) => void;
}

interface SendTransactionFormValues {
  amount: number;
  recipientAddress: string;
  recallableTime: number;
  isPrivateTransaction: boolean;
  message?: string;
}

const DEFAULT_SCHEDULE_PAYMENT = {
  frequency: SchedulePaymentFrequency.DAILY,
  times: undefined,
  startDate: new Date(),
};

// Common input container styles
const inputContainerClass = "bg-background rounded-xl p-3 border-b border-primary-divider";
const inputFieldClass = "text-text-primary text-base bg-transparent border-none outline-none w-full";
const labelClass = "text-text-secondary text-sm";
const timeButtonClass =
  "flex items-center justify-center px-8 py-1.5 rounded-full cursor-pointer text-sm transition-all duration-200";

// Time options data
const timeOptions = [
  { value: 3600, label: "1 hour" },
  { value: 43200, label: "12 hours" },
  { value: 86400, label: "24 hours" },
];

export const SendTransactionForm: React.FC<SendTransactionFormProps> = ({
  activeTab,
  onTabChange,
  onTransactionData,
}) => {
  // **************** Custom Hooks *******************
  const searchParams = useSearchParams();
  const { openModal } = useModal();
  const { isConnected } = useWalletConnect();
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { mutateAsync: sendSingleTransaction } = useSendSingleTransaction();
  const { mutateAsync: sendBatchTransaction } = useSendBatchTransaction();
  const { addTransaction, getBatchTransactions, removeTransaction } = useBatchTransactions(state => state);
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const { mutateAsync: createSchedulePayment } = useCreateSchedulePayment();
  const { refetch: refetchSchedulePayments } = useGetSchedulePayments();
  const blockNum = 0;

  // Get initial data based on usage mode
  // Use URL search params for standalone form
  const recipientParam = searchParams?.get("recipient") || "";
  const recipientNameParam = searchParams?.get("name") || "";
  const tokenAddressParam = searchParams?.get("tokenAddress") || "";
  const amountParam = searchParams?.get("amount") || "";
  const messageParam = searchParams?.get("message") || "";

  // **************** Form Hooks *******************
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<SendTransactionFormValues>({
    defaultValues: {
      amount: amountParam ? parseFloat(amountParam) : undefined,
      recipientAddress: recipientParam,
      recallableTime: 1 * 60 * 60, // 1 hour in seconds
      isPrivateTransaction: true,
      message: messageParam || "",
    },
  });

  // **************** Local State *******************
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: "",
    metadata: {
      symbol: "",
      decimals: 0,
      maxSupply: 0,
    },
  });
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recipientName, setRecipientName] = useState(recipientNameParam);
  const [isSubmittingAsBatch, setIsSubmittingAsBatch] = useState(false);
  const [schedulePayment, setSchedulePayment] = useState<{
    frequency: SchedulePaymentFrequency;
    times: number | undefined;
    startDate: Date | undefined;
  }>(DEFAULT_SCHEDULE_PAYMENT);

  // Debounced address validation
  const validateAddress = useCallback((address: string) => {
    try {
      if (address.startsWith("mt")) {
        return true;
      }
      // address need to be at least 36 characters
      if (address.length < 36) {
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  // ********************************************
  // **************** Effects *******************
  // ********************************************

  // useEffect(() => {
  //   const defaultToken = getDefaultSelectedToken(assets);
  //   setSelectedToken(defaultToken);
  //   setSelectedTokenAddress(defaultToken.faucetId);
  // }, [assets]);

  // Handle URL parameters for payment requests
  useEffect(() => {
    if (tokenAddressParam && assets.length > 0) {
      // Find the token by address
      const token = assets.find(asset => asset.faucetId === tokenAddressParam);
      if (token) {
        setSelectedToken(token);
        setSelectedTokenAddress(token.faucetId);
      }
    }
  }, [tokenAddressParam, assets]);

  // ********************************************
  // **************** Handlers ******************
  // ********************************************

  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);

    // Reset amount when switching tokens
    // @ts-ignore
    setValue("amount", undefined);

    // Find the selected token in assets to get its address
    if (token.metadata.symbol === "QASH") {
      const qashTokenAddress = QASH_TOKEN_ADDRESS;
      setSelectedTokenAddress(qashTokenAddress);
    } else {
      const selectedAsset = assets.find(asset => asset.metadata.symbol === token.metadata.symbol);
      if (selectedAsset) {
        setSelectedTokenAddress(selectedAsset.faucetId);
      }
    }
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_EMPLOYEE, {
      onSave: (address: string, name: string) => {
        setValue("recipientAddress", address, { shouldValidate: true });
        setRecipientName(name);
      },
    });
  };

  const handleSchedulePaymentTransaction = async (
    senderAccountId: string,
    recipientAccountId: string,
    faucetAccountId: string,
    recallHeight: number,
    data: SendTransactionFormValues,
  ) => {
    try {
      if (!blockNum) {
        throw new Error("Block number is not available");
      }

      if (!schedulePayment.times) {
        throw new Error("Schedule payment times is not available");
      }

      const { amount, recipientAddress, recallableTime, isPrivateTransaction } = data;

      // Check if user has sufficient balance for all scheduled payments
      const totalAmount = amount * schedulePayment.times;
      if (totalAmount > parseFloat(selectedToken.amount)) {
        return `Insufficient balance for ${schedulePayment.times} scheduled payments. Required: ${totalAmount.toFixed(2)} ${selectedToken.metadata.symbol}`;
      }

      if (!schedulePayment.startDate) {
        throw new Error("Schedule payment start date is not available");
      }

      const startDate = schedulePayment.startDate;

      // prepare transactions based on schedule payment times
      const transactions = await Promise.all(
        Array.from({ length: schedulePayment.times }, async (_, index) => {
          const { timelockHeight } = await calculateClaimableTime(
            index,
            schedulePayment.frequency,
            blockNum,
            startDate,
          );

          return {
            id: `schedule-${Date.now()}-${index}`,
            tokenMetadata: selectedToken.metadata,
            tokenAddress: faucetAccountId,
            amount: amount.toString(),
            recipient: recipientAccountId,
            isPrivate: isPrivateTransaction,
            recallableHeight: timelockHeight + recallHeight,
            recallableTime: recallHeight * BLOCK_TIME,
            noteType: CustomNoteType.P2IDR,
            timelockHeight: timelockHeight,
            createdAt: new Date(),
          };
        }),
      );

      // create batch note
      const { notes, noteIds, serialNumbers, recallableHeights, timelockHeights } =
        await createBatchSchedulePaymentNote(senderAccountId, transactions);

      // submit transaction to miden
      const txId = await submitTransactionWithOwnOutputNotes(senderAccountId, notes);

      // prepare batch transactions for server
      const batchTransactions = notes.map((note, index) => ({
        assets: [{ faucetId: faucetAccountId, amount: amount.toString(), metadata: selectedToken.metadata }],
        private: isPrivateTransaction,
        recipient: recipientAddress,
        recallable: true,
        recallableTime: new Date(Date.now() + recallableTime * 1000),
        recallableHeight: Math.max(...recallableHeights),
        serialNumber: Array.isArray(serialNumbers[index]) ? serialNumbers[index] : [serialNumbers[index] || ""],
        noteType: CustomNoteType.P2IDR,
        noteId: noteIds[index],
        transactionId: txId, // All notes use the same transaction ID from Miden
        timelockHeight: timelockHeights[index],
      }));

      // submit batch transaction to server
      const response = await sendBatchTransaction(batchTransactions);

      // get transaction ids from server response
      const transactionIds = response?.map((tx: any) => tx.id || tx.transactionId) || [];

      // create schedule payment record
      const nextExecutionDate = new Date();
      const endDate = new Date();

      // Calculate next execution date and end date based on frequency
      switch (schedulePayment.frequency) {
        case SchedulePaymentFrequency.DAILY:
          nextExecutionDate.setDate(nextExecutionDate.getDate() + 1);
          endDate.setDate(endDate.getDate() + schedulePayment.times);
          break;
        case SchedulePaymentFrequency.WEEKLY:
          nextExecutionDate.setDate(nextExecutionDate.getDate() + 7);
          endDate.setDate(endDate.getDate() + schedulePayment.times * 7);
          break;
        case SchedulePaymentFrequency.MONTHLY:
          nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1);
          endDate.setMonth(endDate.getMonth() + schedulePayment.times);
          break;
        case SchedulePaymentFrequency.YEARLY:
          nextExecutionDate.setFullYear(nextExecutionDate.getFullYear() + 1);
          endDate.setFullYear(endDate.getFullYear() + schedulePayment.times);
          break;
      }

      const schedulePaymentResponse = await createSchedulePayment({
        payer: walletAddress,
        payee: recipientAddress,
        amount: amount.toString(),
        tokens: [{ faucetId: faucetAccountId, amount: amount.toString(), metadata: selectedToken.metadata }],
        message: getValues("message") || "",
        frequency: schedulePayment.frequency,
        endDate: endDate.toISOString(),
        nextExecutionDate: nextExecutionDate.toISOString(),
        maxExecutions: schedulePayment.times,
        transactionIds: transactionIds,
      });

      setTimeout(() => {
        forceRefetchAssets();
        forceRefetchRecallablePayment();
        if (schedulePayment) {
          refetchSchedulePayments();
        }
      }, REFETCH_DELAY);

      if (schedulePaymentResponse) {
        toast.dismiss();
        toast.success(
          <div>
            {schedulePayment
              ? `Created schedule payment successfully with ${schedulePayment.times} transactions, view transaction on `
              : "Transaction sent successfully, view transaction on "}
            <a
              href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Miden Explorer
            </a>
          </div>,
        );

        reset();
        setRecipientName("");
        setSchedulePayment(DEFAULT_SCHEDULE_PAYMENT);
      }
    } catch (error) {
      toast.dismiss();
      console.error("Failed to send schedule payment transaction:", error);
      toast.error("Failed to create schedule payment");
    } finally {
      setIsSending(false);
    }
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
        if (schedulePayment) {
          refetchSchedulePayments();
        }
      }, REFETCH_DELAY);

      if (response) {
        toast.dismiss();
        toast.success(
          <div>
            {schedulePayment
              ? `Transaction sent successfully with ${schedulePayment.times} transactions, view transaction on `
              : "Transaction sent successfully, view transaction on "}
            <a
              href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Miden Explorer
            </a>
          </div>,
        );

        reset();
        setRecipientName("");

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
      toast.dismiss();
      console.error("Failed to send schedule payment transaction:", error);
      toast.error("Failed to send schedule payment transaction");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTransaction = async (data: SendTransactionFormValues) => {
    const { amount, recipientAddress, recallableTime, isPrivateTransaction } = data;

    if (!isConnected || !walletAddress) {
      toast.dismiss();
      toast.error("Please connect your wallet");
      return;
    }

    // check if amount > balance
    if (amount > parseFloat(selectedToken.amount)) {
      toast.dismiss();
      toast.error("Insufficient balance");
      return;
    }

    if (!validateAddress(recipientAddress)) {
      toast.dismiss();
      toast.error("Invalid recipient address");
      return;
    }

    // check if recallable time is valid
    if (recallableTime <= 0) {
      toast.dismiss();
      toast.error("Recallable time must be greater than 0");
      return;
    }

    // check if amount > 0
    if (amount <= 0) {
      toast.dismiss();
      toast.error("Amount must be greater than 0");
      return;
    }

    if (recallableTime <= 0) {
      toast.error("Recallable time must be greater than 0");
      return;
    }

    // Prepare transaction data
    const transactionData = {
      amount: `${amount}`,
      accountName: "My Account", // You can get this from account context if available
      accountAddress: walletAddress,
      recipientName: recipientName || "Unknown",
      recipientAddress: recipientAddress,
      transactionType: isPrivateTransaction ? "Private" : "Public",
      cancellableTime: `${recallableTime / 3600} hour(s)`,
      message: data.message || "Transaction details",
      tokenAddress: selectedToken.faucetId,
      tokenSymbol: selectedToken.metadata.symbol,
      recallableTimeSeconds: recallableTime, // Pass the recallable time in seconds
    };

    // If onTransactionData callback is provided, use it instead of modal
    if (onTransactionData) {
      onTransactionData(transactionData);
      return;
    }

    // Show transaction overview modal first
    // openModal(MODAL_IDS.TRANSACTION_OVERVIEW, {
    //   ...transactionData,
    //   schedulePayment: schedulePayment,
    //   onConfirm: async () => {
    //     setIsSending(true);
    //     toast.loading("Sending transaction...");

    //     // each block is 5 seconds, calculate recall height
    //     const recallHeight = Math.floor(recallableTime / BLOCK_TIME);

    //     // Create AccountId objects once to avoid aliasing issues
    //     const senderAccountId = walletAddress;
    //     const recipientAccountId = recipientAddress;
    //     const faucetAccountId = selectedToken.faucetId;
    //     if (schedulePayment.times !== undefined) {
    //       await handleSchedulePaymentTransaction(
    //         senderAccountId,
    //         recipientAccountId,
    //         faucetAccountId,
    //         recallHeight,
    //         data,
    //       );
    //     } else {
    //       await handleSingleSendTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, data);
    //     }
    //   },
    // });
  };

  const handleAddToBatch = async (data: SendTransactionFormValues) => {
    const { amount, recipientAddress, recallableTime, isPrivateTransaction } = data;

    if (!isConnected || !walletAddress) {
      return;
    }

    try {
      // check if amount > balance
      if (amount > parseFloat(selectedToken.amount)) {
        toast.dismiss();
        toast.error("Insufficient balance");
        return;
      }

      // check if recipient address is valid bech32
      if (!validateAddress(recipientAddress)) {
        toast.dismiss();
        toast.error("Invalid recipient address");
        return;
      }

      // check if recallable time is valid
      if (recallableTime <= 0) {
        toast.dismiss();
        toast.error("Recallable time must be greater than 0");
        return;
      }

      // check if amount > 0
      if (amount <= 0) {
        toast.dismiss();
        toast.error("Amount must be greater than 0");
        return;
      }

      // add to batch storage
      addTransaction(walletAddress, {
        tokenAddress: selectedToken.faucetId,
        tokenMetadata: selectedToken.metadata,
        amount: amount.toString(),
        recipient: recipientAddress,
        isPrivate: isPrivateTransaction,
        recallableHeight: Math.floor(recallableTime / BLOCK_TIME),
        recallableTime: recallableTime,
        noteType: CustomNoteType.P2IDR,
        message: getValues("message"),
      });

      toast.success("Transaction added to batch successfully");
      reset();
      setRecipientName("");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to add transaction to batch");
      console.error(error);
    }
  };

  const handleFormSubmit = async (data: SendTransactionFormValues) => {
    if (isSubmittingAsBatch) {
      await handleAddToBatch(data);
    } else {
      await handleSendTransaction(data);
    }
  };

  const handleSetupSchedulePayment = () => {
    openModal(MODAL_IDS.SETUP_SCHEDULE_PAYMENT, {
      schedulePayment,
      onSave: (values: { frequency: SchedulePaymentFrequency; times: number; startDate: Date }) => {
        setSchedulePayment(values);
      },
    });
  };

  return (
    <form className="flex flex-col gap-3 p-3" onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Token Selector */}
      <div
        className={`${inputContainerClass} flex items-center justify-between cursor-pointer`}
        onClick={() =>
          openModal(MODAL_IDS.SELECT_TOKEN, {
            selectedToken,
            onTokenSelect: handleTokenSelect,
          })
        }
      >
        <div className="flex gap-3 items-center">
          {selectedToken.metadata.symbol ? (
            <>
              <div className="relative w-10 h-10">
                <img
                  alt=""
                  className="w-full h-full"
                  src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                />
                <img alt="" className="absolute bottom-0 right-0 w-5 h-5" src="/chain/miden.svg" />
              </div>
              <div className="flex flex-col">
                <p className="text-text-primary text-sm">{selectedToken.metadata.symbol}</p>
                <p className="text-text-secondary text-sm">Miden</p>
              </div>
            </>
          ) : (
            <span className="text-text-primary py-1">Select token</span>
          )}
        </div>
        <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
      </div>

      {/* Amount Input */}
      <div className={`${inputContainerClass} flex items-center gap-5`}>
        <div className="flex flex-col gap-0.5 flex-1">
          <span className={labelClass}>Amount</span>
          <input
            {...register("amount", { required: true })}
            type="number"
            step="0.000001"
            className={inputFieldClass}
            placeholder="0"
            autoComplete="off"
          />
        </div>
        <span className="text-text-primary text-base">{selectedToken.metadata.symbol}</span>
        <button
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-background border border-primary-divider shadow-sm cursor-pointer"
          onClick={() =>
            setValue(
              "amount",
              parseFloat(
                formatUnits(BigInt(Math.round(Number(selectedToken.amount))), selectedToken.metadata.decimals),
              ),
            )
          }
        >
          <span className="text-text-primary text-sm font-semibold">Max</span>
        </button>
      </div>
      <div className="flex justify-end px-3">
        <p className="text-xs text-text-secondary">
          Available:{" "}
          <span className="text-text-primary">
            {formatNumberWithCommas(
              formatUnits(BigInt(Math.round(Number(selectedToken.amount))), selectedToken.metadata.decimals),
            )}{" "}
            {selectedToken.metadata.symbol}
          </span>
        </p>
      </div>

      {/* Recipient Input */}
      <div className={`${inputContainerClass} flex items-center justify-between`}>
        <div className="flex flex-col gap-0.5 flex-1">
          <p className={labelClass}>Send to</p>
          <input
            {...register("recipientAddress", { required: true })}
            type="text"
            className={inputFieldClass}
            autoComplete="off"
            placeholder="mtst..."
          />
        </div>
        <button
          className="bg-app-background flex items-center justify-center rounded-lg w-8 h-8 cursor-pointer border border-primary-divider"
          onClick={handleChooseRecipient}
        >
          <img alt="" className="w-4 h-4" src="/misc/address-book-icon.svg" />
        </button>
      </div>

      {/* Message Input */}
      <div className={`${inputContainerClass} h-[120px] flex flex-col gap-2`}>
        <div className="flex flex-col gap-0.5 flex-1">
          <p className={labelClass}>Message (optional)</p>
          <textarea
            {...register("message")}
            className={`${inputFieldClass} h-full resize-none`}
            autoComplete="off"
            placeholder="Hey there! Just a quick note to confirm your cryptocurrency transfer."
            maxLength={250}
          />
        </div>
      </div>
      <div className="flex justify-end px-3">
        <p className="text-xs text-text-secondary">{watch("message")?.length || 0}/250</p>
      </div>

      {/* Cancellable Time Options */}
      <div className="flex flex-col gap-2 px-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-text-primary text-sm">Cancellable in</span>
          <span className="text-text-secondary text-sm">Get your money back after cancellable expires</span>
        </div>
        <div className="flex gap-2">
          {timeOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${timeButtonClass} ${
                watch("recallableTime") === value ? "bg-black text-white" : "bg-white text-text-primary"
              }`}
              onClick={() => setValue("recallableTime", value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-primary-divider">
        <div className="flex flex-col gap-0.5 flex-1">
          <p className="text-text-primary text-sm">Private transaction</p>
          <p className="text-text-secondary text-sm">Only you and the recipient know about this transaction</p>
        </div>
        <ToggleSwitch
          enabled={watch("isPrivateTransaction")}
          onChange={enabled => setValue("isPrivateTransaction", enabled)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {selectedToken.metadata.symbol && watch("amount") && watch("recipientAddress") && (
          <button
            type="submit"
            className="bg-background justify-center border-b-1 border-primary-divider rounded-lg flex items-center gap-2 px-4 py-2 flex-1 cursor-pointer"
            onClick={() => setIsSubmittingAsBatch(true)}
          >
            <img alt="" className="w-5" src="/misc/light-shopping-bag.svg" />
            <span className="text-text-primary text-sm">Add to Batch</span>
          </button>
        )}
        <PrimaryButton
          text="Send"
          onClick={() => setIsSubmittingAsBatch(false)}
          containerClassName="flex-3"
          disabled={!selectedToken.metadata.symbol || !watch("amount") || !watch("recipientAddress")}
        />
      </div>
    </form>
  );
};

export default SendTransactionForm;
