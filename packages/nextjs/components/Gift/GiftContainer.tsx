"use client";

import * as React from "react";
import { GiftStatistics } from "./GiftStatistics";

export const GiftContainer: React.FC = () => {
  return (
    <main className="flex flex-col gap-4 items-start h-full p-4 w-full">
      <div className="w-full flex items-center gap-2 font-semibold">
        <img src="/gift/gift-icon.svg" alt="gift-box" className="w-6 h-6" />
        <span className="text-text-primary text-2xl font-semibold">Gift</span>
      </div>
      <GiftStatistics />

      {/* <GiftCreationForm /> */}
      {/* <div className="flex-1 h-full rounded-xl relative border border-[#202020]">
        {!isConnected && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
            <img src="/gift/gift-icon.svg" alt="gift-icon" />
            <span className="text-white">You'll see the gifts after connect your wallet</span>
            <ActionButton text="Connect Wallet" onClick={() => openModal(MODAL_IDS.CONNECT_WALLET)} />
          </div>
        )}
        <div className={`h-full ${!isConnected ? "filter blur pointer-events-none" : ""}`}></div>
      </div> */}
    </main>
  );
};

export default GiftContainer;
