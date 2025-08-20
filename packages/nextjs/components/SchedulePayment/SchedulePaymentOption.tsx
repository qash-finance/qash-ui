"use client";

import React from "react";
import { ActionButton } from "../Common/ActionButton";
import { SchedulePaymentFrequency } from "@/types/schedule-payment";

type SchedulePaymentProps = {
  handleView: () => void;
  className?: string;
  schedulePayment: {
    frequency: SchedulePaymentFrequency;
    times: number;
  } | null;
};

export const SchedulePaymentOption: React.FC<SchedulePaymentProps> = ({
  handleView,
  className = "",
  schedulePayment,
}) => {
  return (
    <div
      className={`bg-[#292929] rounded-lg py-2.5 pl-3 pr-[15px] flex items-center justify-between ${className} mb-[4px]`}
    >
      <div className="flex flex-col gap-2">
        <span className="text-white text-[16px] leading-none">Schedule payment</span>
        <span className="text-[#656565] text-[15px] tracking-[-0.45px] leading-[1.25]">
          Pick a date and time to automatically send your payment
        </span>
      </div>

      {schedulePayment ? (
        <ActionButton text="View" onClick={handleView} className="rounded-[10px]" />
      ) : (
        <img
          src="/arrow/chevron-right.svg"
          alt="chevron-right"
          className="w-6 h-6 cursor-pointer"
          onClick={handleView}
        />
      )}
    </div>
  );
};

export default SchedulePaymentOption;
