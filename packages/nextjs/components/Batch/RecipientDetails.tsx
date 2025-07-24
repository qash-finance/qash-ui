"use client";
import { formatAddress } from "@/services/utils/miden/address";
import * as React from "react";

interface RecipientDetailsProps {
  recipient: string;
  isPrivate?: boolean;
  isAddress?: boolean;
}

export function RecipientDetails({ recipient, isPrivate, isAddress }: RecipientDetailsProps) {
  if (isAddress) {
    return (
      <div className="flex gap-1 items-center flex-[1_0_0]">
        <div className="flex gap-0.5 justify-center items-center px-1.5 py-1.5 bg-blend-luminosity bg-[#515151] bg-opacity-10 rounded-[34px]">
          <span className="text-xs font-medium tracking-tight leading-4 text-white ">{formatAddress(recipient)}</span>
        </div>
        {isPrivate && (
          <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-600">
            <span className="text-sm tracking-tight leading-5 text-white">Private</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-1 items-center flex-[1_0_0]">
      <span className="overflow-hidden text-base leading-4 text-white underline decoration-dotted text-ellipsis">
        {recipient}
      </span>
      {isPrivate && (
        <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-600">
          <span className="text-sm tracking-tight leading-5 text-white">Private</span>
        </div>
      )}
    </div>
  );
}
