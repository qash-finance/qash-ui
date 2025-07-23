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
import { useSendSingleTransaction } from "@/services/api/transaction";
import { NoteType as MidenNoteType } from "@demox-labs/miden-sdk";
import { toast } from "react-hot-toast";
import { AccountId } from "@demox-labs/miden-sdk";
import { createNoteAndSubmit } from "@/services/utils/note";
import { useDeployedAccount } from "@/hooks/web3/useDeployedAccount";
import { useWalletState } from "@/services/store";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useAccount } from "@/hooks/web3/useAccount";
import { getDefaultSelectedToken } from "@/services/utils/tokenSelection";
import { useEffect } from "react";
import { AssetWithMetadata } from "@/types/faucet";
import { qashTokenAddress, qashTokenSymbol, qashTokenDecimals, qashTokenMaxSupply } from "@/services/utils/constant";

const buttonStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "16px",
  fontWeight: "500",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  transition: "background-color 0.2s",
  textAlign: "center" as const,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#3b82f6",
};
import { useSearchParams } from "next/navigation";

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
    getValues,
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
  const { deployedAccountData } = useDeployedAccount();
  const { handleConnect, walletAddress, isConnected } = useWalletConnect();
  const { assets } = useAccount(walletAddress || "");
  const [recipientName, setRecipientName] = useState(recipientNameParam);

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
  // Form values are now handled by react-hook-form
  const [isSending, setIsSending] = useState(false);

  // **************** Effects *******************
  // Update default selected token when assets change
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
      console.log("YOYOOY");
      console.log({ amount, recipientAddress, recallableTime, isPrivateTransaction });

      // check if amount > balance
      if (amount > parseFloat(selectedToken.amount)) {
        toast.error("Insufficient balance");
        return;
      }

      // check if recipient address is valid bech32
      try {
        AccountId.fromBech32(recipientAddress);
      } catch (error) {
        toast.error("Invalid recipient address");
        return;
      }

      // check if recallable time is valid
      if (recallableTime <= 0) {
        toast.error("Recallable time must be greater than 0");
        return;
      }

      // check if amount > 0
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
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
        <ActionButton
          text="Send Transaction"
          buttonType="submit"
          onClick={() => console.log("Send button clicked")}
          className="w-full h-10 mt-2"
          disabled={isSending}
        />
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
            className="mt-3 wallet-button-custom cursor-pointer h-[40px]"
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
