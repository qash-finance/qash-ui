"use client";

import React, { useRef, useState } from "react";

const labelClass = "text-[#989898] text-[14px] leading-5 tracking-[0.07px]";

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
  title?: string;
  transactions: ScheduleTransaction[];
  defaultOpen?: boolean;
  className?: string;
}> = ({ title = "Schedule payment", transactions, defaultOpen = false, className = "" }) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const maxHeight = React.useMemo(() => {
    if (!contentRef.current) return open ? "1000px" : "0px"; // fallback
    return open ? `${contentRef.current.scrollHeight}px` : "0px";
  }, [open, transactions.length]);

  return (
    <div className={`bg-[#292929] rounded-lg flex flex-col gap-1 ${className} ${open ? "pb-2" : ""}`}>
      {/* Header */}
      <button
        type="button"
        className="flex items-center justify-between pl-3 pr-[15px] py-2.5"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
      >
        <span className="text-[#989898] text-[14px] tracking-[0.07px] leading-5">{title}</span>
        <img
          src="/arrow/chevron-down.svg"
          alt="chevron-down"
          className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Animated content */}
      <div
        ref={contentRef}
        style={{
          maxHeight,
          transition: "max-height 250ms ease, opacity 200ms ease",
          opacity: open ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        {transactions.map((tx, idx) => (
          <ScheduleTransactionRow
            key={`${tx.amountLabel}-${tx.claimableAfterLabel}-${idx}`}
            index={idx + 1}
            amountLabel={tx.amountLabel}
            claimableAfterLabel={tx.claimableAfterLabel}
          />
        ))}
      </div>
    </div>
  );
};
