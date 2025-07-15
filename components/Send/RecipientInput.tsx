"use client";
import * as React from "react";
import { ActionButton } from "../Common/ActionButton";

interface RecipientInputProps {
  recipientAddress: string;
  onRecipientChange: (address: string) => void;
  onChooseRecipient: () => void;
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
  recipientAddress,
  onRecipientChange,
  onChooseRecipient,
}) => {
  return (
    <section className="flex flex-wrap gap-2.5 items-center py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-zinc-800">
      <img
        src="/default-avatar-icon.svg"
        alt="Recipient avatar"
        className="object-contain shrink-0 aspect-square w-[33px]"
      />
      <div className="flex flex-col flex-1 shrink justify-center basis-5 min-w-60">
        <div className="flex gap-2 items-center self-start whitespace-nowrap">
          <label className="text-base leading-none text-center text-white">To</label>
          <span className="text-base tracking-tight leading-none text-neutral-600">{recipientAddress || "0x..."}</span>
        </div>
        <input
          type="text"
          value={recipientAddress}
          onChange={e => onRecipientChange(e.target.value)}
          placeholder="Enter address or choose from your contacts book"
          className="mt-2 text-base tracking-tight leading-none text-neutral-600 bg-transparent outline-none placeholder:text-neutral-600"
        />
      </div>
      <ActionButton text="Choose" onClick={onChooseRecipient} />
    </section>
  );
};
