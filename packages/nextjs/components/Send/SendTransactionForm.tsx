"use client";
import React, { useState } from "react";
import { AmountInput } from "./AmountInput";
import { RecipientInput } from "./RecipientInput";
import { TransactionOptions } from "./TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";
import { useForm } from "react-hook-form";
import { NoteType as MidenNoteType, NoteType, OutputNotesArray } from "@demox-labs/miden-sdk";
import { toast } from "react-hot-toast";
import { AccountId } from "@demox-labs/miden-sdk";
import { createP2IDRNote } from "@/services/utils/miden/note";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useAccount } from "@/hooks/web3/useAccount";
import { getDefaultSelectedToken } from "@/services/utils/tokenSelection";
import { useEffect } from "react";
import { AssetWithMetadata } from "@/types/faucet";
import {
  qashTokenAddress,
  qashTokenSymbol,
  qashTokenDecimals,
  qashTokenMaxSupply,
  blockTime,
  buttonStyle,
} from "@/services/utils/constant";
import { useSearchParams } from "next/navigation";
import { submitTransaction } from "@/services/utils/miden/transactions";
import useSendSingleTransaction from "@/hooks/server/useSendSingleTransaction";
import { CustomNoteType } from "@/types/note";

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
}

export const SendTransactionForm: React.FC<SendTransactionFormProps> = ({ activeTab, onTabChange }) => {
  const searchParams = useSearchParams();
  const recipientParam = searchParams?.get("recipient") || "";
  const recipientNameParam = searchParams?.get("name") || "";
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SendTransactionFormValues>({
    defaultValues: {
      amount: 0,
      recipientAddress: recipientParam,
      recallableTime: 1 * 60 * 60, // 1 hour in seconds
      isPrivateTransaction: false,
    },
  });
  // **************** Custom Hooks *******************
  const { openModal, isModalOpen } = useModal();
  const { handleConnect, walletAddress, isConnected } = useWalletConnect();
  const { assets } = useAccount(walletAddress || "");
  const { mutate: sendSingleTransaction, isPending: isSendingSingleTransaction } = useSendSingleTransaction();

  const isSendModalOpen = isModalOpen(MODAL_IDS.SEND);

  // **************** Local State *******************
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    tokenAddress: qashTokenAddress,
    metadata: {
      symbol: qashTokenSymbol,
      decimals: qashTokenDecimals,
      maxSupply: qashTokenMaxSupply,
    },
  });
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recipientName, setRecipientName] = useState(recipientNameParam);

  // **************** Effects *******************
  useEffect(() => {
    const defaultToken = getDefaultSelectedToken(assets);
    setSelectedToken(defaultToken);
    setSelectedTokenAddress(defaultToken.tokenAddress);
  }, [assets]);

  const handleTokenSelect = (token: AssetWithMetadata) => {
    setSelectedToken(token);

    // Reset amount when switching tokens
    setValue("amount", 0);

    // Find the selected token in assets to get its address
    if (token.metadata.symbol === "QASH") {
      const qashTokenAddress = require("@/services/utils/constant").qashTokenAddress;
      setSelectedTokenAddress(qashTokenAddress);
    } else {
      const selectedAsset = assets.find(asset => asset.metadata.symbol === token.metadata.symbol);
      if (selectedAsset) {
        setSelectedTokenAddress(selectedAsset.tokenAddress);
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
      toast.loading("Sending transaction...");
      setIsSending(true);
      // check if amount > balance
      if (amount > parseFloat(selectedToken.amount)) {
        toast.dismiss();
        toast.error("Insufficient balance");
        return;
      }

      // check if recipient address is valid bech32
      try {
        AccountId.fromBech32(recipientAddress);
      } catch (error) {
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

      // each block is 5 seconds, calculate recall height
      const recallHeight = Math.floor(recallableTime / blockTime);

      // send transaction
      // create note
      const [note, serialNumbers] = await createP2IDRNote(
        AccountId.fromBech32(walletAddress),
        AccountId.fromBech32(recipientAddress),
        AccountId.fromBech32(selectedToken.tokenAddress),
        amount,
        isPrivateTransaction ? MidenNoteType.Private : MidenNoteType.Public,
        recallHeight,
      );

      // submit transaction to blockchain
      await submitTransaction(new OutputNotesArray([note]), AccountId.fromBech32(walletAddress));

      // submit transaction to server
      sendSingleTransaction({
        assets: [{ faucetId: selectedToken.tokenAddress, amount: amount.toString() }],
        private: isPrivateTransaction,
        recipient: recipientAddress,
        recallable: true,
        recallableTime: recallableTime > 0 ? new Date(Date.now() + recallableTime * 1000) : undefined,
        serialNumber: serialNumbers.map(felt => Number(felt.toString())),
        noteType: CustomNoteType.P2IDR,
      });

      toast.dismiss();
      toast.success("Transaction sent successfully");

      reset();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to send transaction");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddToBatch = (data: SendTransactionFormValues) => {
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
      try {
        AccountId.fromBech32(recipientAddress);
      } catch (error) {
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

      toast.success("Transaction added to batch successfully");

      reset();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to add transaction to batch");
      console.error(error);
    }
  };

  return (
    <form className={`p-2 rounded-b-2xl bg-zinc-900 w-[600px]`} onSubmit={handleSubmit(handleSendTransaction)}>
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
            className={`flex gap-1.5 justify-center items-center self-stretch p-1 rounded-xl bg-neutral-950 h-[34px] row-span-1 ${
              !isSendModalOpen ? "w-[280px]" : "w-[150px]"
            }`}
          >
            <button
              type="button"
              className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
                activeTab === "send" ? "bg-zinc-800" : ""
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
            {!isSendModalOpen && (
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
            )}
          </nav>
          <SelectTokenInput
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
            tokenAddress={selectedTokenAddress}
          />
        </header>

        <AmountInput
          selectedToken={selectedToken}
          availableBalance={parseFloat(selectedToken.amount) || 0}
          register={register}
          errors={errors}
          setValue={setValue}
        />
      </section>

      <RecipientInput
        onChooseRecipient={handleChooseRecipient}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        recipientName={recipientName}
      />

      <TransactionOptions register={register} watch={watch} setValue={setValue} />

      {isConnected ? (
        <div className="flex items-center gap-2 mt-1">
          <ActionButton text="Add To Batch" buttonType="submit" type="neutral" className="w-[30%] h-10 mt-2" />
          <ActionButton
            text="Send Transaction"
            buttonType="submit"
            className="w-[70%] h-10 mt-2"
            disabled={isSending}
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
          <button
            type="button"
            onClick={handleConnect}
            style={{
              ...buttonStyle,
              color: "transparent", // Hide original text
              fontSize: "0", // Hide text
            }}
            className="mt-2 wallet-button-custom cursor-pointer h-[40px]"
          />
          <div className="absolute bottom-0 bg-[#1E8FFF] text-white text-[16px] font-medium pointer-events-none z-10 w-full text-center h-10 flex items-center justify-center rounded-lg">
            Connect Wallet
          </div>
        </div>
      )}

      {/* Send button */}
    </form>
  );
};

export default SendTransactionForm;
