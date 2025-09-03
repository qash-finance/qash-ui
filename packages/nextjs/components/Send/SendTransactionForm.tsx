"use client";
import React, { useState, useCallback } from "react";
import { AmountInput } from "./AmountInput";
import { TransactionOptions } from "./TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, RemoveSchedulePaymentProps, SendModalProps, SetupSchedulePaymentModalProps } from "@/types/modal";
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

export enum AmountInputTab {
  SEND = "send",
  STREAM = "stream",
}

interface SendTransactionFormProps {
  activeTab?: AmountInputTab;
  onTabChange?: (tab: AmountInputTab) => void;
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

export const SendTransactionForm: React.FC<SendTransactionFormProps> = ({
  activeTab,
  onTabChange,
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
  const blockNum = useMidenSdkStore(state => state.blockNum);

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
      isPrivateTransaction: false,
      message: messageParam || "",
    },
  });

  // **************** Local State *******************
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: QASH_TOKEN_ADDRESS,
    metadata: {
      symbol: QASH_TOKEN_SYMBOL,
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY,
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

  useEffect(() => {
    const defaultToken = getDefaultSelectedToken(assets);
    setSelectedToken(defaultToken);
    setSelectedTokenAddress(defaultToken.faucetId);
  }, [assets]);

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
    setValue("amount", 0);

    // Find the selected token in assets to get its address
    if (token.metadata.symbol === "QASH") {
      const qashTokenAddress = require("@/services/utils/constant").QASH_TOKEN_ADDRESS;
      setSelectedTokenAddress(qashTokenAddress);
    } else {
      const selectedAsset = assets.find(asset => asset.metadata.symbol === token.metadata.symbol);
      if (selectedAsset) {
        setSelectedTokenAddress(selectedAsset.faucetId);
      }
    }
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_RECIPIENT, {
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
      if(!blockNum) {
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

      // submit transaction to miden
      const txId = await submitTransactionWithOwnOutputNotes(senderAccountId, [note]);

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
        noteId: note.id().toString(),
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

    // Show transaction overview modal first
    openModal(MODAL_IDS.TRANSACTION_OVERVIEW, {
      amount: `${amount}`,
      accountName: "My Account", // You can get this from account context if available
      accountAddress: walletAddress,
      recipientName: recipientName || null,
      recipientAddress: recipientAddress,
      transactionType: isPrivateTransaction ? "Private" : "Public",
      cancellableTime: `${recallableTime / 3600} hour(s)`,
      message: data.message || "Transaction details",
      tokenAddress: selectedToken.faucetId,
      tokenSymbol: selectedToken.metadata.symbol,
      schedulePayment: schedulePayment,
      onConfirm: async () => {
        setIsSending(true);
        toast.loading("Sending transaction...");

        // each block is 5 seconds, calculate recall height
        const recallHeight = Math.floor(recallableTime / BLOCK_TIME);

        // Create AccountId objects once to avoid aliasing issues
        const senderAccountId = walletAddress;
        const recipientAccountId = recipientAddress;
        const faucetAccountId = selectedToken.faucetId;

        if (schedulePayment.times !== undefined) {
          await handleSchedulePaymentTransaction(
            senderAccountId,
            recipientAccountId,
            faucetAccountId,
            recallHeight,
            data,
          );
        } else {
          await handleSingleSendTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, data);
        }
      },
    });
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
    <form className={`p-2 rounded-b-2xl bg-zinc-900 w-[600px]`} onSubmit={handleSubmit(handleFormSubmit)}>
      <section
        className="grid grid-rows-7 overflow-hidden flex-col items-center pb-3 w-full text-white whitespace-nowrap rounded-lg bg-[#292929] mb-1"
        style={{
          backgroundImage: "url('/modal/request-background.svg')",
          backgroundPosition: "bottom",
          width: "100%",
          backgroundRepeat: "repeat-x",
        }}
      >
        {/* Title */}
        <header className="flex flex-wrap gap-5 justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] row-span-1">
          {/* Tab Navigation */}
          <nav className={`flex gap-1.5 justify-center items-center self-stretch p-1 rounded-xl h-[34px] row-span-1`}>
            <button
              type="button"
              className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
                activeTab === "send" ? "" : ""
              } cursor-pointer`}
              onClick={() => {
                onTabChange?.(AmountInputTab.SEND);
              }}
            >
              <span
                className={`text-base font-medium tracking-tight leading-5 text-white ${
                  activeTab === AmountInputTab.SEND ? "" : "opacity-50"
                }`}
              >
                Send
              </span>
            </button>
          </nav>
          <SelectTokenInput
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
            tokenAddress={selectedTokenAddress}
          />
        </header>

        <AmountInput
          selectedToken={selectedToken}
          availableBalance={Number(
            formatUnits(BigInt(Math.round(Number(selectedToken.amount))), selectedToken.metadata.decimals),
          )}
          register={register}
          errors={errors}
          setValue={setValue}
        />
      </section>

      {/* Recipient Input */}
      {/* If recipient name is not set, show the input */}
      <RecipientInput
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        recipientName={recipientName}
        setRecipientName={setRecipientName}
        getValues={getValues}
        onChooseRecipient={handleChooseRecipient}
      />

      {/* Schedule Payment Option */}
      <div
        className={`bg-[#292929] rounded-lg py-2.5 pl-3 pr-[15px] flex items-center justify-between mb-[4px] cursor-pointer`}
        onClick={() => !schedulePayment.times && handleSetupSchedulePayment()}
      >
        <div className="flex flex-col gap-2">
          <span className="text-white text-[16px] leading-none">Schedule payment</span>
          <span className="text-[#656565] text-[15px] tracking-[-0.45px] leading-[1.25]">
            Pick a date and time to automatically send your payment
          </span>
        </div>

        {schedulePayment.times ? (
          <div className="flex items-center gap-2">
            <ActionButton text="View" onClick={() => handleSetupSchedulePayment()} className="rounded-full" />
            <ActionButton
              text="Remove"
              onClick={() => {
                openModal(MODAL_IDS.REMOVE_SCHEDULE_PAYMENT, {
                  onConfirm: async () => {
                    setSchedulePayment(DEFAULT_SCHEDULE_PAYMENT);
                  },
                });
              }}
              type="deny"
              className="rounded-full"
            />
          </div>
        ) : (
          <img
            src="/arrow/chevron-right.svg"
            alt="chevron-right"
            className="w-6 h-6 cursor-pointer"
            onClick={() => handleSetupSchedulePayment()}
          />
        )}
      </div>

      <TransactionOptions register={register} watch={watch} setValue={setValue} />

      {isConnected ? (
        <div className="flex items-center gap-2 mt-1">
          <ActionButton
            text="Add To Batch"
            buttonType="submit"
            type="neutral"
            className="w-[30%] h-10 mt-2"
            disabled={isSending || schedulePayment.times !== undefined}
            onClick={() => setIsSubmittingAsBatch(true)}
          />
          <ActionButton
            text={`${schedulePayment.times !== undefined ? "Schedule now" : "Send Transaction"} `}
            buttonType="submit"
            className="w-[70%] h-10 mt-2"
            loading={isSending}
            onClick={() => setIsSubmittingAsBatch(false)}
          />
        </div>
      ) : (
        <div className="relative">
          <ActionButton
            text="Connect Wallet"
            buttonType="submit"
            className="w-full h-10 mt-2"
            onClick={() => {
              openModal(MODAL_IDS.CONNECT_WALLET);
            }}
          />
        </div>
      )}

      {/* Send button */}
    </form>
  );
};

export default SendTransactionForm;
