"use client";

import React from "react";
import { ProgressIndicator } from "./ProgressIndicator";
import { ActionButton } from "@/components/Common/ActionButton";

interface TransactionRowProps {
  timeRemaining: string;
  rate: string;
  currentAmount: string;
  totalAmount: string;
  toAddress: string;
  progressPercentage: number;
  onCancel?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  timeRemaining,
  rate,
  currentAmount,
  totalAmount,
  toAddress,
  progressPercentage,
  onCancel,
}) => {
  return (
    <div className="flex items-center gap-2 w-full rounded-xl bg-zinc-800 min-h-[52px] pr-2">
      {/* Timer & Rate Section */}
      <div className="flex flex-1 h-[52px]">
        <div className="flex-3/5 flex items-center bg-neutral-950 text-white min-w-[120px] justify-center w-full text-center rounded-tl-xl rounded-bl-xl text-xl">
          {timeRemaining}
        </div>
        <div className="flex-2/5 flex items-center bg-[#066EFF] text-white min-w-[100px] justify-center w-full text-center">
          <span>
            {rate}
            <span className="text-[#48B3FF]">/sec</span>
          </span>
        </div>
      </div>

      {/* Amount Section */}
      <div className="flex flex-1/8 items-center gap-1 min-w-0">
        <img src="/token/usdt.svg" alt="USDT" className="w-6 h-6 flex-shrink-0" />
        <span className="text-lg text-white truncate">{currentAmount}</span>
        <span className="text-sm text-stone-500">/{totalAmount}</span>
      </div>

      {/* Address Section */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-stone-50/10 rounded-full text-base">
        <span className="text-neutral-400">To</span>
        <span className="text-white truncate max-w-[120px]">{toAddress}</span>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator percentage={progressPercentage} />

      {/* Cancel Button */}
      <ActionButton text="Cancel" type="deny" onClick={onCancel} className="h-9 flex-shrink-0" />
    </div>
  );
};
