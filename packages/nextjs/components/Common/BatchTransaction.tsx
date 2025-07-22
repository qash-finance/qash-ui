import React from "react";
import { TransactionTypeBadge } from "@/components/Common/TransactionTypeBadge";
import { RecipientDetails } from "@/components/Batch/RecipientDetails";

export interface BatchTransactionProps {
  badgeType: "P2ID-R" | "P2ID";
  amount: string;
  recipient: string;
  isPrivate?: boolean;
  isAddress?: boolean;
}

export function BatchTransaction({ badgeType, amount, recipient, isPrivate, isAddress }: BatchTransactionProps) {
  return (
    <div className="flex items-center self-stretch py-2 pl-2 rounded-lg bg-neutral-700 max-sm:flex-col max-sm:gap-2 max-sm:p-3">
      <div className="flex gap-2 items-center self-stretch flex-[1_0_0] max-sm:flex-col max-sm:gap-2 max-sm:items-start">
        <TransactionTypeBadge type={badgeType} />
        <span className="overflow-hidden text-base leading-4 text-white underline decoration-dotted text-ellipsis">
          {amount}
        </span>
        <div className="flex gap-1 justify-center items-center px-2 rounded-xl bg-neutral-950 w-10">
          <span className="text-xs tracking-tight leading-5 text-sky-400">To</span>
        </div>
        <RecipientDetails recipient={recipient} isPrivate={isPrivate} isAddress={isAddress} />
      </div>
    </div>
  );
}
