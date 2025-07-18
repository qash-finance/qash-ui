"use client";
import React, { useState } from "react";
import { AmountInput } from "./AmountInput";
import { RecipientInput } from "./RecipientInput";
import { TransactionOptions } from "./TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { ActionButton } from "../Common/ActionButton";

export enum AmountInputTab {
  SEND = "send",
  STREAM = "stream",
}

interface SendTransactionFormProps {
  activeTab: AmountInputTab;
  onTabChange: (tab: AmountInputTab) => void;
}

export const SendTransactionForm: React.FC<SendTransactionFormProps> = ({ activeTab, onTabChange }) => {
  const [amount, setAmount] = useState("0.00");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAsGift, setSendAsGift] = useState(false);
  const [privateTransaction, setPrivateTransaction] = useState(false);
  const [recallableTime, setRecallableTime] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { openModal, isModalOpen } = useModal();
  const isSendModalOpen = isModalOpen(MODAL_IDS.SEND);

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

  const handleConnectWallet = () => {
    if (isWalletConnected) {
      // Handle transaction submission
      console.log("Submitting transaction...");
    } else {
      // Handle wallet connection
      setIsWalletConnected(true);
    }
  };

  return (
    <main className={`p-2 rounded-b-2xl bg-zinc-900 w-[600px]`}>
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
              className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
                activeTab === "send" ? "bg-zinc-800" : ""
              } cursor-pointer`}
              onClick={() => {
                onTabChange(AmountInputTab.SEND);
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
                className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
                  activeTab === AmountInputTab.STREAM ? "bg-zinc-800" : ""
                } cursor-pointer`}
                onClick={() => {
                  onTabChange(AmountInputTab.STREAM);
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

        <AmountInput amount={amount} onAmountChange={setAmount} selectedToken={selectedToken} />
      </section>

      <TransactionOptions
        sendAsGift={sendAsGift}
        privateTransaction={privateTransaction}
        recallableTime={recallableTime}
        onSendAsGiftChange={setSendAsGift}
        onPrivateTransactionChange={setPrivateTransaction}
        onRecallableTimeChange={setRecallableTime}
        onChooseRecallableTime={handleChooseRecallableTime}
      />

      {/* Send button */}
      <ActionButton text="Send Transaction" onClick={handleConnectWallet} className="w-full h-10 mt-2" />
    </main>
  );
};

export default SendTransactionForm;
