"use client";
import * as React from "react";
import { RecipientDetails } from "./RecipientDetails";
import { ActionButton } from "../Common/ActionButton";

interface TransactionItemProps {
  amount: string;
  recipient: string;
  isPrivate?: boolean;
  isAddress?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onRemove?: () => void;
}

interface RemoveButtonProps {
  onClick?: () => void;
  className?: string;
}

export function TransactionItem({
  amount,
  recipient,
  isPrivate,
  isAddress,
  hasError,
  errorMessage,
  onRemove,
}: TransactionItemProps) {
  const containerContent = (
    <div className="flex gap-2.5 items-center self-stretch py-2.5 pr-4 pl-3 rounded-lg bg-neutral-700 max-sm:flex-col max-sm:gap-2 max-sm:p-3">
      <div className="flex gap-2 items-center self-stretch flex-[1_0_0] max-sm:flex-col max-sm:gap-2 max-sm:items-start">
        {/* <TransactionTypeBadge type={badgeType} /> */}
        <span className="overflow-hidden text-base leading-4 text-white underline decoration-dotted text-ellipsis">
          {amount}
        </span>
        <div className="flex gap-1 justify-center items-center px-2 rounded-xl bg-neutral-950 w-10">
          <span className="text-xs tracking-tight leading-5 text-sky-400">To</span>
        </div>
        <RecipientDetails recipient={recipient} isPrivate={isPrivate} isAddress={isAddress} />
      </div>

      {/* Remove button */}
      <ActionButton text="Remove" type="deny" onClick={onRemove} />
    </div>
  );

  if (hasError && errorMessage) {
    return (
      <div className="flex flex-col gap-2 items-center self-stretch pb-2.5 bg-red-600 rounded-lg">
        {containerContent}
        <p className="overflow-hidden self-stretch text-base leading-4 text-center text-white text-ellipsis">
          {errorMessage}
        </p>
      </div>
    );
  }

  return containerContent;
}
