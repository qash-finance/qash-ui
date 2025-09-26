"use client";

import * as React from "react";
import { GiftCreationForm } from "./GiftCreationForm";
import { GiftStatistics } from "./GiftStatistics";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "../Common/ActionButton";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";

export const GiftContainer: React.FC = () => {
  const { openModal } = useModal();
  const { isConnected } = useWalletConnect();

  return (
    <main className="flex flex-col 2xl:flex-row gap-4 items-center h-full p-4 rounded-2xl bg-[#121212] flex-1">
      <GiftCreationForm />
      <div className="flex-1 w-full h-full rounded-xl relative border border-[#202020]">
        {!isConnected && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
            <img src="/gift/gift-icon.svg" alt="gift-icon" />
            <span className="text-white">You'll see the gifts after connect your wallet</span>
            <ActionButton text="Connect Wallet" onClick={() => openModal(MODAL_IDS.CONNECT_WALLET)} />
          </div>
        )}
        <div className={`w-full h-full ${!isConnected ? "filter blur pointer-events-none" : ""}`}>
          <GiftStatistics />
        </div>
      </div>
    </main>
  );
};

export default GiftContainer;
