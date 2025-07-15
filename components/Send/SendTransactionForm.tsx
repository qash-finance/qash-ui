"use client";
import React, { useState } from "react";
import { AmountInput } from "./AmountInput";
import { RecipientInput } from "./RecipientInput";
import { TransactionOptions } from "./TransactionOptions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

export const SendTransactionForm: React.FC = () => {
  const [amount, setAmount] = useState("0.00");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAsGift, setSendAsGift] = useState(false);
  const [privateTransaction, setPrivateTransaction] = useState(false);
  const [recallableTime, setRecallableTime] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { openModal } = useModal();

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
    <main className="p-2 rounded-xl bg-zinc-900 w-[600px]">
      <AmountInput amount={amount} onAmountChange={setAmount} selectedToken={selectedToken} />

      <RecipientInput
        recipientAddress={recipientAddress}
        onRecipientChange={setRecipientAddress}
        onChooseRecipient={handleChooseRecipient}
      />

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
      <footer className="flex gap-2 items-start pt-2 mt-1 w-full text-base font-medium tracking-normal leading-none text-white max-md:max-w-full">
        <button
          onClick={handleConnectWallet}
          className="flex overflow-hidden flex-1 shrink gap-1.5 justify-center items-center px-4 pt-3 pb-3.5 w-full bg-blue-500 rounded-xl shadow hover:bg-blue-600 transition-colors basis-0 min-w-60 max-md:max-w-full"
        >
          {isWalletConnected ? "Send Transaction" : "Connect wallet"}
        </button>
      </footer>
    </main>
  );
};

export default SendTransactionForm;
