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
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter-reactui";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { useSendSingleTransaction } from "@/services/api/transaction";
import { SendTransaction } from "@demox-labs/miden-wallet-adapter-base";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import { NoteType } from "@/types/transaction";
import { NoteType as MidenNoteType } from "@demox-labs/miden-sdk";
import { toast } from "react-hot-toast";
import { AccountId } from "@demox-labs/miden-sdk";
import { createNoteAndSubmit } from "@/services/utils/note";
import { useDeployedAccount } from "@/hooks/web3/useDeployedAccount";

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
}

export const SendTransactionForm: React.FC<SendTransactionFormProps> = ({ activeTab, onTabChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<SendTransactionFormValues>();
  const { connected, publicKey, wallet } = useWallet();
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [privateTransaction, setPrivateTransaction] = useState(false);
  const [recallableTime, setRecallableTime] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { openModal, isModalOpen } = useModal();
  const isSendModalOpen = isModalOpen(MODAL_IDS.SEND);
  const { mutate: sendSingleTransaction, isPending: isSendingSingleTransaction } = useSendSingleTransaction();
  const { deployedAccountData } = useDeployedAccount();

  const handleTokenSelect = () => {
    // In a real app, this would open a token selection modal
    console.log("Token selection clicked");
  };

  const handleChooseRecipient = () => {
    openModal(MODAL_IDS.SELECT_RECIPIENT);
  };

  const handleChooseRecallableTime = () => {
    // In a real app, this would open a time selection modal
    console.log("Choose recallable time clicked");
  };

  const handleSendTransaction = async (data: SendTransactionFormValues) => {
    if (!connected || !publicKey) {
      return;
    }

    const { amount, recipientAddress, recallableTime } = data;

    try {
      // const faucetId = "0x2f3da6aa8735e7200006e8d6e06a8c";

      // const midenTransaction = new SendTransaction(
      //   publicKey,
      //   recipientAddress,
      //   faucetId,
      //   privateTransaction ? "private" : "public",
      //   amount!,
      // );

      // const txId = (await (wallet?.adapter as TridentWalletAdapter).requestSend(midenTransaction)) || "";

      // sendSingleTransaction(
      //   {
      //     recipient: recipientAddress,
      //     assets: [{ faucetId, amount: amount.toString() }],
      //     private: privateTransaction,
      //     recallable: true,
      //     serialNumber: Array.from({ length: 4 }, () => Math.floor(Math.random() * 10000)),
      //     noteType: NoteType.P2ID,
      //   },
      //   {
      //     onSuccess: () => {
      //       toast.success("Transaction sent successfully");
      //     },
      //     onError: () => {
      //       toast.error("Transaction failed");
      //     },
      //     onSettled: () => {
      //       reset();
      //     },
      //   },
      // );

      //@ts-ignore
      const faucetId = AccountId.fromBech32("mtst1qppen8yngje35gr223jwe6ptjy7gedn9");
      const sender = AccountId.fromHex(deployedAccountData?.accountId || "");

      let recipient;
      if (recipientAddress.startsWith("0x")) {
        recipient = AccountId.fromHex(recipientAddress);
      } else {
        //@ts-ignore
        recipient = AccountId.fromBech32(recipientAddress);
      }

      setIsSending(true);

      await createNoteAndSubmit(sender, recipient, faucetId, amount, MidenNoteType.Public)
        .then(() => {
          toast.success("Transaction sent successfully");
        })
        .catch(error => {
          console.error(error);
          toast.error("Transaction failed");
        });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
      reset();
    }
  };

  return (
    <form className={`p-2 rounded-b-2xl bg-zinc-900 w-[600px]`}>
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
                  onTabChange?.(AmountInputTab.STREAM);
                }}
              >
                <span
                  className={`text-base tracking-tight leading-5 text-white ${activeTab === "stream" ? "" : "opacity-50"}`}
                >
                  Stream Send
                </span>
              </button>
            )}
          </nav>
          <SelectTokenInput selectedToken={selectedToken} onTokenSelect={setSelectedToken} />
        </header>

        <AmountInput selectedToken={selectedToken} register={register} errors={errors} setValue={setValue} />
      </section>

      <RecipientInput
        onChooseRecipient={handleChooseRecipient}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />

      <TransactionOptions
        privateTransaction={privateTransaction}
        recallableTime={recallableTime}
        onPrivateTransactionChange={setPrivateTransaction}
        onRecallableTimeChange={setRecallableTime}
        onChooseRecallableTime={handleChooseRecallableTime}
        register={register}
      />

      {connected ? (
        <ActionButton
          text="Send Transaction"
          onClick={handleSubmit(handleSendTransaction)}
          className="w-full h-10 mt-2"
          disabled={isSending}
        />
      ) : (
        <div className="relative">
          <WalletMultiButton
            className="wallet-button-custom cursor-pointer w-full h-10 mt-2"
            style={{
              color: "transparent",
              fontSize: "0",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
            }}
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
