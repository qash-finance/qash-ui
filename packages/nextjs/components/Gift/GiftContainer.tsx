"use client";

import * as React from "react";
import { GiftCreationForm } from "./GiftCreationForm";
import { GiftStatistics } from "./GiftStatistics";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "../Common/ActionButton";

export const GiftContainer: React.FC = () => {
  const { isConnected, handleConnect } = useWalletConnect();

  return (
    <main className="flex flex-col gap-4 items-center h-full p-4 rounded-2xl bg-[#121212] flex-1 max-md:p-3 max-sm:p-2">
      <div className="flex gap-4 justify-center items-start self-stretch flex-1 max-md:flex-col max-md:gap-3">
        <GiftCreationForm />
        <div className="flex-1 h-full rounded-xl relative border border-[#202020]">
          {!isConnected && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
              <img src="/gift/gift-icon.svg" alt="gift-icon" />
              <span className="text-white">You'll see the gifts after connect your wallet</span>
              <ActionButton text="Connect Wallet" onClick={handleConnect} />
            </div>
          )}
          <div className={`${!isConnected ? "filter blur pointer-events-none" : ""} h-full`}>
            <GiftStatistics />
          </div>
        </div>
      </div>
    </main>
  );
};

export default GiftContainer;
