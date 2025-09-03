"use client";

import { AssetWithMetadata } from "@/types/faucet";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import React from "react";

export type SchedulePaymentCardProps = {
  avatarUrl?: string; // fallback to Figma localhost image if not provided
  recipientName: string;
  amount: string; // e.g. "0.001"
  token: AssetWithMetadata;
  frequencyLabel: string; // e.g. "Monthly"
  startDateLabel: string; // e.g. "02/08/2025"
  timesLabel: string; // e.g. "2 times"
  onClick?: () => void;
  className?: string;
};

export const SchedulePaymentCard: React.FC<SchedulePaymentCardProps> = ({
  recipientName,
  amount,
  token,
  frequencyLabel,
  startDateLabel,
  timesLabel,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-[#0c0c0c] rounded-lg p-2 flex items-center gap-3 cursor-pointer ${className}`}
    >
      <div
        className="shrink-0 w-16 h-16 rounded bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/modal/calendar.svg)`,
          backgroundSize: "75% 75%",
          backgroundPosition: "43% 55%",
        }}
        aria-hidden
      />

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3 w-full">
          <div className="w-[206px] truncate">
            <span className="text-white text-[16px] leading-[1.2] font-medium truncate">{recipientName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <div className="bg-[#292929] rounded-md px-2 py-1.5 flex items-center gap-2">
            <img
              src={token.faucetId === QASH_TOKEN_ADDRESS ? "/token/qash.svg" : blo(turnBechToHex(token.faucetId))}
              alt="token"
              className="w-3.5 h-3.5"
            />
            <span className="text-white text-[14px] leading-3 tracking-[0.07px] font-medium">{amount}</span>
          </div>

          <div className="bg-[#292929] rounded-md px-2 py-1.5 flex items-center">
            <span className="text-white text-[14px] leading-3 tracking-[0.07px] font-medium">{frequencyLabel}</span>
          </div>

          <div className="bg-[#292929] rounded-md px-2 py-1.5 flex items-center">
            <span className="text-white text-[14px] leading-3 tracking-[0.07px] font-medium">{startDateLabel}</span>
          </div>

          <div className="bg-[#292929] rounded-md px-2 py-1.5 flex items-center">
            <span className="text-white text-[14px] leading-3 tracking-[0.07px] font-medium">{timesLabel}</span>
          </div>
        </div>
      </div>

      <img src="/arrow/chevron-right.svg" alt="open" className="w-5 h-5 shrink-0" />
    </button>
  );
};

export default SchedulePaymentCard;
