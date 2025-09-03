"use client";
import React from "react";
import { ActionButton } from "../Common/ActionButton";

export type SchedulePaymentTooltipProps = {
  statusText?: string; // e.g. "Pending Send"
  sentText: string; // e.g. "1 000 BTC"
  dateTimeText: string; // e.g. "01/08/2025, 09:41"
  balanceText: string; // e.g. "2 000 BTC"
  remainingTimeText: string; // e.g. "00:30:25"
  onCancel?: () => void;
  disabledCancel?: boolean;
};

const SchedulePaymentTooltip: React.FC<SchedulePaymentTooltipProps> = ({
  statusText = "Pending Send",
  sentText,
  dateTimeText,
  balanceText,
  remainingTimeText,
  disabledCancel,
  onCancel,
}) => {
  return (
    <div className={`bg-[#292929] relative rounded-xl w-[390px]`}>
      <div className="flex flex-col gap-2.5 p-3">
        {/* Row: Status + Cancel */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-row gap-2 items-center text-[14px] tracking-[0.07px]">
            <span className="text-[#989898] leading-5">Status:</span>
            <span className="text-[#ffb700] font-medium leading-none">{statusText}</span>
          </div>

          <ActionButton
            text="Cancel"
            type="accept"
            onClick={onCancel}
            className="bg-[#1E8FFF] hover:bg-[#1E8FFF]/80 rounded-full h-[25px]"
            disabled={disabledCancel}
          />
        </div>

        {/* Row: Sent */}
        {sentText && (
          <div className="flex flex-row gap-2 items-center">
            <span className="text-[#989898] text-[14px] tracking-[0.07px] leading-5">Sent:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[14px] tracking-[0.07px] leading-5 font-medium">{sentText}</span>
            </div>
          </div>
        )}

        {/* Row: Date/Time */}
        <div className="flex flex-row gap-2 items-center text-[14px] tracking-[0.07px]">
          <span className="text-[#989898] leading-5">Date/Time:</span>
          <span className="text-white leading-5">{dateTimeText}</span>
        </div>

        {/* Row: Balance */}
        <div className="flex flex-row gap-2 items-center text-[14px] tracking-[0.07px]">
          <span className="text-[#989898] leading-5">Balance:</span>
          <span className="text-white font-medium leading-5">{balanceText}</span>
        </div>

        {/* Row: Remaining time */}
        <div className="flex flex-row gap-2 items-center text-[14px] tracking-[0.07px]">
          <span className="text-[#989898] leading-5">Remaining time:</span>
          <span className="text-white font-medium leading-5">{remainingTimeText}</span>
        </div>

        {/* Row: Next Schedule Date */}
        {/* <div className="flex items-center justify-between w-full">
          <div className="flex flex-row gap-2 items-center text-[14px] tracking-[0.07px]">
            <span className="text-[#989898] leading-5">Next Schedule Date:</span>
          </div>

          <div className="flex flex-row gap-2 items-center text-[14px] tracking-[0.07px]">
            <span className="text-white font-medium leading-5">
              2025-08-15 <span className="text-[#48B3FF]">(10 days left)</span>
            </span>
          </div>
        </div> */}
      </div>

      {/* bottom border accent to match Figma */}
      <div className="absolute inset-0 pointer-events-none rounded-xl border-b-2 border-[#454545]" aria-hidden />
    </div>
  );
};

export default SchedulePaymentTooltip;
