"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { SchedulePaymentFrequency } from "@/types/schedule-payment";
import { getClaimableTimeLabel } from "@/services/utils/claimableTime";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";

const labelClass = "text-[#989898] text-[14px] leading-5 tracking-[0.07px]";

const getFrequencyLabel = (frequency: SchedulePaymentFrequency): string => {
  switch (frequency) {
    case SchedulePaymentFrequency.DAILY:
      return "Daily";
    case SchedulePaymentFrequency.WEEKLY:
      return "Weekly";
    case SchedulePaymentFrequency.MONTHLY:
      return "Monthly";
    case SchedulePaymentFrequency.YEARLY:
      return "Yearly";
    default:
      return "Custom";
  }
};

export const ScheduleTransactionRow: React.FC<{ index: number; amountLabel: string; claimableAfterLabel: string }> = ({
  index,
  amountLabel,
  claimableAfterLabel,
}) => (
  <div className="grid grid-cols-[1fr_2fr] items-center gap-2 py-1 px-3">
    <span className={`${labelClass} truncate`}>{`Transaction ${index}`}</span>
    <div className="flex items-center gap-2">
      <div className="bg-[#3d3d3d] rounded-md px-2 py-1.5 w-[135px]">
        <span className="text-white text-[14px] leading-5 tracking-[0.07px] truncate block text-center">
          {amountLabel}
        </span>
      </div>
      <div className="bg-[#3d3d3d] rounded-md px-2 py-1.5 w-full">
        <span className="text-white text-[14px] leading-5 tracking-[0.07px] truncate block text-center">
          {claimableAfterLabel}
        </span>
      </div>
    </div>
  </div>
);

export type ScheduleTransaction = { amountLabel: string; claimableAfterLabel: string };

export const ScheduleTransactionDropdown: React.FC<{
  schedulePayment?: {
    frequency: SchedulePaymentFrequency;
    times: number;
    startDate: Date;
  } | null;
  amount?: string;
  tokenSymbol?: string;
  defaultOpen?: boolean;
  className?: string;
}> = ({ schedulePayment, amount, tokenSymbol, defaultOpen = false, className = "" }) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [displayTransactions, setDisplayTransactions] = useState<ScheduleTransaction[]>([]);
  const blockNum = useMidenSdkStore(state => state.blockNum);

  // Generate transactions from schedulePayment
  useEffect(() => {
    (() => {
      if (schedulePayment && amount && tokenSymbol) {
        const { frequency, times, startDate } = schedulePayment;

        const txns = Array.from({ length: times }, (_, index) => {
          const transactionDate = new Date(startDate);

          // Calculate the date for this transaction based on frequency
          switch (frequency) {
            case SchedulePaymentFrequency.DAILY:
              transactionDate.setDate(transactionDate.getDate() + index);
              break;
            case SchedulePaymentFrequency.WEEKLY:
              transactionDate.setDate(transactionDate.getDate() + index * 7);
              break;
            case SchedulePaymentFrequency.MONTHLY:
              transactionDate.setMonth(transactionDate.getMonth() + index);
              break;
            case SchedulePaymentFrequency.YEARLY:
              transactionDate.setFullYear(transactionDate.getFullYear() + index);
              break;
            default:
              transactionDate.setDate(transactionDate.getDate() + index);
          }

          const formattedDate = transactionDate.toLocaleDateString("en-GB");

          return {
            amountLabel: `${amount} ${tokenSymbol}`,
            claimableAfterLabel: `Claimable after ${formattedDate}`,
          };
        });

        setDisplayTransactions(txns);
      }
    })();
  }, [schedulePayment, amount, tokenSymbol]);

  // Measure content height when transactions change
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [displayTransactions]);

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setOpen(prev => !prev);

    // Reset animation flag after transition completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={`bg-[#292929] rounded-lg flex flex-col gap-1 ${className} ${open ? "pb-2" : ""}`}>
      {/* Header */}
      <button
        type="button"
        className="flex items-center justify-between pl-3 pr-[15px] py-2.5 cursor-pointer"
        onClick={handleToggle}
        aria-expanded={open}
        disabled={isAnimating}
      >
        <span className="text-[#989898] text-[14px] tracking-[0.07px] leading-5">Schedule Payment</span>
        <img
          src="/arrow/chevron-down.svg"
          alt="chevron-down"
          className={`w-5 h-5 transition-transform duration-300 ease-out ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Animated content */}
      <div
        ref={contentRef}
        style={{
          height: open ? contentHeight : 0,
          transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
        className="will-change-transform"
      >
        <div
          style={{
            transform: open ? "translateY(0)" : "translateY(-10px)",
            opacity: open ? 1 : 0,
            transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {displayTransactions.map((tx, idx) => (
            <ScheduleTransactionRow
              key={`${tx.amountLabel}-${tx.claimableAfterLabel}-${idx}`}
              index={idx + 1}
              amountLabel={tx.amountLabel}
              claimableAfterLabel={tx.claimableAfterLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
