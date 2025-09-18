"use client";
import React, { useState, useCallback } from "react";
import { AmountInput } from "../Send/AmountInput";
import { TransactionOptions } from "../Send/TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, SendModalProps } from "@/types/modal";
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
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { useSendSingleTransaction, useSendBatchTransaction } from "@/hooks/server/useSendTransaction";
import { CustomNoteType, WrappedNoteType } from "@/types/note";
import { useBatchTransactions } from "@/services/store/batchTransactions";
import { formatUnits } from "viem";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useAcceptRequest } from "@/services/api/request-payment";
import { RecipientInput } from "../Send/RecipientInput";
import { calculateClaimableTime } from "@/services/utils/claimableTime";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import BaseModal from "./BaseModal";

export enum AmountInputTab {
  SEND = "send",
  STREAM = "stream",
}

interface SendTransactionFormValues {
  amount: number;
  recipientAddress: string;
  recallableTime: number;
  isPrivateTransaction: boolean;
  message?: string;
}

export function SendModal({
  isOpen,
  onClose,
  zIndex,
  ...props
}: SendModalProps & { isOpen: boolean; onClose: () => void; zIndex?: number }) {
  if (!isOpen) return null;

  // **************** Custom Hooks *******************
  const { openModal, isModalOpen } = useModal();
  const { isConnected } = useWalletConnect();
  const { assets, accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { mutateAsync: sendSingleTransaction } = useSendSingleTransaction();
  const { mutateAsync: sendBatchTransaction } = useSendBatchTransaction();
  const { addTransaction, getBatchTransactions, removeTransaction } = useBatchTransactions(state => state);
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const { mutateAsync: acceptRequest } = useAcceptRequest();

  // Get initial data based on usage mode
  // If modal: use props data, else: use empty defaults
  const recipientParam = props.recipient || "";
  const recipientNameParam = props.recipientName || "";
  const tokenAddressParam = props.tokenAddress || "";
  const amountParam = props.amount || "";
  const messageParam = props.message || "";
  const isGroupPaymentParam = props.isGroupPayment || false;
  const isRequestPaymentParam = props.isRequestPayment || false;

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

  // Handle token address parameter
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
        requestPaymentId: props.pendingRequestId ?? null,
      });

      setTimeout(() => {
        forceRefetchAssets();
        forceRefetchRecallablePayment();
      }, REFETCH_DELAY);

      if (response) {
        toast.dismiss();
        toast.success(
          <div>
            Transaction sent successfully, view transaction on{" "}
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

        if (props.pendingRequestId) {
          await acceptRequest({ id: props.pendingRequestId, txid: txId });
        }
      }
    } catch (error) {
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
        onConfirm: async () => {
          if (onClose && props.onTransactionConfirmed) {
            await props.onTransactionConfirmed();
            onClose();
          }

          setIsSending(true);
          toast.loading("Sending transaction...");

          // each block is 5 seconds, calculate recall height
          const recallHeight = Math.floor(recallableTime / BLOCK_TIME);

          // Create AccountId objects once to avoid aliasing issues
          const senderAccountId = walletAddress;
          const recipientAccountId = recipientAddress;
          const faucetAccountId = selectedToken.faucetId;

          await handleSingleSendTransaction(senderAccountId, recipientAccountId, faucetAccountId, recallHeight, data);
        },
      });
    } catch (error) {
      toast.dismiss();
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

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Send transaction" icon="/modal/coin-icon.gif" zIndex={zIndex}>
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
              className={`flex gap-1.5 justify-center items-center self-stretch p-1 rounded-xl h-[34px] row-span-1 w-[150px]`}
            >
              <button
                type="button"
                className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] cursor-pointer`}
              >
                <span className="text-base font-medium tracking-tight leading-5 text-white">Send</span>
              </button>
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
        <section className="flex flex-col flex-wrap py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-zinc-800">
          <div className="flex flex-wrap gap-2.5 items-center">
            <img
              src="/default-avatar-icon.png"
              alt="Recipient avatar"
              className="object-contain shrink-0 aspect-square w-[40px]"
            />
            <div className="flex flex-col flex-1 ">
              <div className="flex gap-2 items-center self-start whitespace-nowrap w-full">
                <label className="text-base leading-none text-center text-white">To</label>
                <input
                  {...register("recipientAddress", {
                    validate: (value: string) => {
                      if (!value) return true; // Don't show error when empty
                      if (!value.startsWith("mt")) return "Address must start with 'mt'";
                      if (value.length < 36) return "Address must be at least 36 characters";
                      return true;
                    },
                  })}
                  autoComplete="off"
                  type="text"
                  placeholder="Enter address or choose from your contacts book"
                  className=" flex-1 leading-none text-white bg-transparent outline-none placeholder:text-neutral-600 w-full"
                  disabled={isGroupPaymentParam || isRequestPaymentParam}
                />
              </div>
            </div>
          </div>

          {watch("recipientAddress") && !validateAddress(watch("recipientAddress")) && (
            <span className="text-sm text-red-500">Invalid recipient address</span>
          )}
        </section>

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
              text="Send Transaction"
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
      </form>
    </BaseModal>
  );
}

export default SendModal;
