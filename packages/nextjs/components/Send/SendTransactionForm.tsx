"use client";
import React, { useState, useCallback } from "react";
import { AmountInput } from "./AmountInput";
import { TransactionOptions } from "./TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, SendModalProps, SetupSchedulePaymentModalProps } from "@/types/modal";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { createP2IDENote, createBatchNote } from "@/services/utils/miden/note";
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
import SchedulePaymentOption from "../SchedulePayment/SchedulePaymentOption";
import { RecipientInput } from "./RecipientInput";
import { SchedulePaymentFrequency } from "@/types/schedule-payment";
import { useCreateSchedulePayment, useGetSchedulePayments } from "@/services/api/schedule-payment";

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

export const SendTransactionForm: React.FC<SendTransactionFormProps & SendModalProps> = ({
  activeTab,
  onTabChange,
  onClose,
  ...props
}) => {
  // **************** Custom Hooks *******************
  const searchParams = useSearchParams();
  const { openModal, isModalOpen } = useModal();
  const { isConnected } = useWalletConnect();
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { mutateAsync: sendSingleTransaction } = useSendSingleTransaction();
  const { mutateAsync: sendBatchTransaction } = useSendBatchTransaction();
  const { addTransaction, getBatchTransactions, removeTransaction } = useBatchTransactions(state => state);
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const { mutateAsync: acceptRequest } = useAcceptRequest();
  const { mutateAsync: createSchedulePayment } = useCreateSchedulePayment();
  const { refetch: refetchSchedulePayments } = useGetSchedulePayments();

  // ********************************************
  // **************** Helper Functions **********
  // ********************************************

  /**
   * Creates notes for a transaction based on whether it's a schedule payment or not
   * @param senderAccountId - The sender's account ID
   * @param recipientAccountId - The recipient's account ID
   * @param faucetAccountId - The token faucet ID
   * @param amount - The transaction amount
   * @param isPrivateTransaction - Whether the transaction is private
   * @param recallHeight - The recall height for the notes
   * @param schedulePayment - Schedule payment configuration (null for regular transactions)
   * @returns Object containing notes array, serial numbers, and calculated recall height
   */
  const createNotesForTransaction = async (
    senderAccountId: string,
    recipientAccountId: string,
    faucetAccountId: string,
    amount: number,
    isPrivateTransaction: boolean,
    recallHeight: number,
    schedulePayment: { frequency: SchedulePaymentFrequency; times: number } | null,
  ) => {
    let notes: any[] = [];
    let allSerialNumbers: string[] | string[][] = [];
    let calculatedRecallHeight = recallHeight;
    let noteIds: string[] = [];

    if (schedulePayment) {
      // Create multiple notes for schedule payments using createBatchNote
      const batchTransactions = Array.from({ length: schedulePayment.times }, (_, index) => ({
        id: `schedule-${Date.now()}-${index}`, // Generate unique ID for each transaction
        tokenMetadata: selectedToken.metadata,
        tokenAddress: selectedToken.faucetId,
        amount: amount.toString(),
        recipient: recipientAccountId,
        isPrivate: isPrivateTransaction,
        recallableHeight: recallHeight,
        recallableTime: recallHeight * BLOCK_TIME, // Convert height to seconds
        noteType: CustomNoteType.P2IDR,
        createdAt: new Date(),
      }));

      const {
        batch,
        noteIds: batchNoteIds,
        serialNumbers,
        recallableHeights,
      } = await createBatchNote(senderAccountId, batchTransactions);
      notes = batch;
      allSerialNumbers = serialNumbers; // Keep as array of arrays, each index corresponds to a transaction
      noteIds = batchNoteIds;
      calculatedRecallHeight = Math.max(...recallableHeights);
    } else {
      // Create single note for regular transactions
      const [note, serialNumbers, noteRecallHeight] = await createP2IDENote(
        senderAccountId,
        recipientAccountId,
        faucetAccountId,
        Math.round(amount * Math.pow(10, selectedToken.metadata.decimals)),
        isPrivateTransaction ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
        recallHeight,
      );
      notes.push(note);
      allSerialNumbers = serialNumbers;
      noteIds = [note.id().toString()];
      calculatedRecallHeight = noteRecallHeight;
    }

    return { notes, allSerialNumbers, noteIds, calculatedRecallHeight };
  };

  /**
   * Creates a schedule payment record in the database
   * @param walletAddress - The sender's wallet address
   * @param recipientAddress - The recipient's address
   * @param amount - The transaction amount
   * @param selectedToken - The selected token metadata
   * @param schedulePayment - Schedule payment configuration
   * @param message - Optional message for the payment
   * @param transactionIds - Array of transaction IDs from the batch transaction
   */
  const createSchedulePaymentRecord = async (
    walletAddress: string,
    recipientAddress: string,
    amount: number,
    selectedToken: AssetWithMetadata,
    schedulePayment: { frequency: SchedulePaymentFrequency; times: number },
    message: string,
    transactionIds: string[],
  ) => {
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

    console.log("Creating schedule payment with:", {
      frequency: schedulePayment.frequency,
      times: schedulePayment.times,
      maxExecutions: schedulePayment.times,
      endDate: endDate.toISOString(),
      nextExecutionDate: nextExecutionDate.toISOString(),
    });

    await createSchedulePayment({
      payer: walletAddress,
      payee: recipientAddress,
      amount: amount.toString(),
      tokens: [{ faucetId: selectedToken.faucetId, amount: amount.toString(), metadata: selectedToken.metadata }],
      message: message,
      frequency: schedulePayment.frequency,
      endDate: endDate.toISOString(),
      nextExecutionDate: nextExecutionDate.toISOString(),
      maxExecutions: schedulePayment.times,
      transactionIds: transactionIds,
    });

    // Refetch schedule payments to update the UI
    refetchSchedulePayments();

    toast.success(`Schedule payment created successfully with ${schedulePayment.times} transactions`);
  };

  /**
   * Validates schedule payment configuration
   * @param amount - The transaction amount
   * @param schedulePayment - Schedule payment configuration
   * @param selectedToken - The selected token metadata
   * @returns Error message string if validation fails, null if validation passes
   */
  const validateSchedulePayment = (
    amount: number,
    schedulePayment: { frequency: SchedulePaymentFrequency; times: number },
    selectedToken: AssetWithMetadata,
  ): string | null => {
    if (schedulePayment.times <= 0 || schedulePayment.times > 100) {
      return "Schedule payment times must be between 1 and 100";
    }

    // Check if user has sufficient balance for all scheduled payments
    const totalAmount = amount * schedulePayment.times;
    if (totalAmount > parseFloat(selectedToken.amount)) {
      return `Insufficient balance for ${schedulePayment.times} scheduled payments. Required: ${totalAmount.toFixed(2)} ${selectedToken.metadata.symbol}`;
    }

    return null; // No validation errors
  };

  // Check if component is being used as a modal
  const isSendModalOpen = isModalOpen(MODAL_IDS.SEND);

  // Get initial data based on usage mode
  // If modal: use props data, else: use URL search params
  const recipientParam = isSendModalOpen ? props.recipient || "" : searchParams?.get("recipient") || "";
  const recipientNameParam = isSendModalOpen ? props.recipientName || "" : searchParams?.get("name") || ""; // Modal doesn't have name param
  const tokenAddressParam = isSendModalOpen ? props.tokenAddress || "" : searchParams?.get("tokenAddress") || "";
  const amountParam = isSendModalOpen ? props.amount || "" : searchParams?.get("amount") || "";
  const messageParam = isSendModalOpen ? props.message || "" : searchParams?.get("message") || "";
  const isGroupPaymentParam = isSendModalOpen ? props.isGroupPayment : false;
  const isRequestPaymentParam = isSendModalOpen ? props.isRequestPayment : false;

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
    times: number;
  } | null>(null);

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

  const handleSendTransaction = async (data: SendTransactionFormValues) => {
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

      // Validate schedule payment configuration
      if (schedulePayment) {
        const validationError = validateSchedulePayment(amount, schedulePayment, selectedToken);
        if (validationError) {
          toast.error(validationError);
          return;
        }
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
          if (onClose && props.onTransactionConfirmed) {
            await props.onTransactionConfirmed();
            onClose();
          }

          try {
            setIsSending(true);
            toast.loading("Sending transaction...");

            // each block is 5 seconds, calculate recall height
            const recallHeight = Math.floor(recallableTime / BLOCK_TIME);

            // Create AccountId objects once to avoid aliasing issues
            const senderAccountId = walletAddress;
            const recipientAccountId = recipientAddress;
            const faucetAccountId = selectedToken.faucetId;

            // Create notes using the helper function
            const { notes, allSerialNumbers, noteIds, calculatedRecallHeight } = await createNotesForTransaction(
              senderAccountId,
              recipientAccountId,
              faucetAccountId,
              amount,
              isPrivateTransaction,
              recallHeight,
              schedulePayment,
            );

            // submit transaction to miden
            const txId = await submitTransactionWithOwnOutputNotes(senderAccountId, notes);

            // submit transaction to server - use batch transaction for schedule payments
            let response;
            let transactionIds: string[] = [];

            if (schedulePayment) {
              // For schedule payments, create batch transaction with all notes
              const batchTransactions = notes.map((_, index) => ({
                assets: [
                  { faucetId: selectedToken.faucetId, amount: amount.toString(), metadata: selectedToken.metadata },
                ],
                private: isPrivateTransaction,
                recipient: recipientAddress,
                recallable: true,
                recallableTime: new Date(Date.now() + recallableTime * 1000),
                recallableHeight: calculatedRecallHeight,
                serialNumber: Array.isArray(allSerialNumbers[index])
                  ? allSerialNumbers[index]
                  : [allSerialNumbers[index] || ""],
                noteType: CustomNoteType.P2IDR,
                noteId: noteIds[index] || notes[index].id().toString(),
                transactionId: txId, // All notes use the same transaction ID from Miden
                requestPaymentId: props.pendingRequestId ?? null,
              }));

              response = await sendBatchTransaction(batchTransactions);
              // Extract transaction IDs from batch response
              transactionIds = response?.map((tx: any) => tx.id || tx.transactionId) || [];

              // Create schedule payment if schedulePayment is configured
              if (schedulePayment && response) {
                try {
                  await createSchedulePaymentRecord(
                    walletAddress,
                    recipientAddress,
                    amount,
                    selectedToken,
                    schedulePayment,
                    getValues("message") || "",
                    transactionIds,
                  );
                } catch (scheduleError) {
                  console.error("Failed to create schedule payment:", scheduleError);
                  toast.error("Transaction sent but failed to create schedule payment");
                }
              }
            } else {
              const noteId = notes[0].id().toString();

              // For regular transactions, use single transaction
              response = await sendSingleTransaction({
                assets: [
                  { faucetId: selectedToken.faucetId, amount: amount.toString(), metadata: selectedToken.metadata },
                ],
                private: isPrivateTransaction,
                recipient: recipientAddress,
                recallable: true,
                recallableTime: new Date(Date.now() + recallableTime * 1000),
                recallableHeight: calculatedRecallHeight,
                serialNumber: Array.isArray(allSerialNumbers[0]) ? allSerialNumbers[0] : (allSerialNumbers as string[]),
                noteType: CustomNoteType.P2IDR,
                noteId: noteId,
                transactionId: txId,
                requestPaymentId: props.pendingRequestId ?? null,
              });
            }

            // refetch assets
            // call refetch assets 5 seconds later
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
              setSchedulePayment(null);

              // If this transaction exists in batch, remove it
              try {
                if (walletAddress) {
                  const batchTransactions = getBatchTransactions(walletAddress);
                  const matchedTransactions = batchTransactions.filter(tx => {
                    if (props.pendingRequestId != null) return tx.pendingRequestId === props.pendingRequestId;
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
              } catch (_) {}

              if (props.pendingRequestId) {
                await acceptRequest({ id: props.pendingRequestId, txid: txId });
              }
            }
          } catch (error) {
            toast.dismiss();
            toast.error("Failed to send transaction");
            console.error(error);
          } finally {
            setIsSending(false);
          }
        },
      });
    } catch (error) {
      toast.error("Failed to process transaction");
      console.error(error);
    }
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
        pendingRequestId: props.pendingRequestId ?? null,
      });

      toast.success("Transaction added to batch successfully");
      reset();
      setRecipientName("");

      if (onClose) {
        onClose();
      }
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

  // ********************************************
  // **************** Render *******************
  // ********************************************
  const renderRecipientInputButton = () => {
    if (isGroupPaymentParam || isRequestPaymentParam) {
      return null;
    }

    return (
      <>
        {watch("recipientAddress") && validateAddress(watch("recipientAddress")) ? (
          <ActionButton
            text="Remove"
            type="deny"
            onClick={() => {
              setRecipientName("");
              setValue("recipientAddress", "");
            }}
          />
        ) : (
          <ActionButton text="Choose" onClick={handleChooseRecipient} />
        )}
      </>
    );
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
          <nav
            className={`flex gap-1.5 justify-center items-center self-stretch p-1 rounded-xl h-[34px] row-span-1 ${
              !isSendModalOpen ? "" : "w-[150px]"
            }`}
          >
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
            {/* {!isSendModalOpen && (
              <button
                type="button"
                className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
                  activeTab === AmountInputTab.STREAM ? "bg-zinc-800" : ""
                } cursor-pointer`}
                onClick={() => {
                  // TODO: Uncomment this when stream is implemented
                  // onTabChange?.(AmountInputTab.STREAM);
                }}
              >
                <span
                  className={`cursor-not-allowed text-base tracking-tight leading-5 text-white ${activeTab === "stream" ? "" : "opacity-50"}`}
                >
                  Stream Send
                </span>
              </button>
            )} */}
          </nav>
          <SelectTokenInput
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
            tokenAddress={selectedTokenAddress}
            disabled={isGroupPaymentParam || isRequestPaymentParam}
          />
        </header>

        <AmountInput
          disabled={isGroupPaymentParam || isRequestPaymentParam}
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

      <SchedulePaymentOption
        schedulePayment={schedulePayment}
        handleView={() =>
          openModal<SetupSchedulePaymentModalProps>(MODAL_IDS.SETUP_SCHEDULE_PAYMENT, {
            onSave: (values: { frequency: SchedulePaymentFrequency; times: number }) => {
              setSchedulePayment(values);
            },
          })
        }
      />

      <TransactionOptions register={register} watch={watch} setValue={setValue} />

      {isConnected ? (
        <div className="flex items-center gap-2 mt-1">
          <ActionButton
            text="Add To Batch"
            buttonType="submit"
            type="neutral"
            className="w-[30%] h-10 mt-2"
            disabled={isSending}
            onClick={() => setIsSubmittingAsBatch(true)}
          />
          <ActionButton
            text={`${schedulePayment ? "Schedule now" : "Send Transaction"} `}
            buttonType="submit"
            className="w-[70%] h-10 mt-2"
            loading={isSending}
            onClick={() => setIsSubmittingAsBatch(false)}
          />
        </div>
      ) : (
        <div className="relative">
          {/* <WalletMultiButton
            className="wallet-button-custom cursor-pointer w-full h-10 mt-2"
            style={{
              color: "transparent",
              fontSize: "0",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
            }}
          /> */}

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
