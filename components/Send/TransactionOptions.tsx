"use client";
import * as React from "react";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { ActionButton } from "../Common/ActionButton";

interface TransactionOptionsProps {
  sendAsGift: boolean;
  privateTransaction: boolean;
  recallableTime: boolean;
  onSendAsGiftChange: (enabled: boolean) => void;
  onPrivateTransactionChange: (enabled: boolean) => void;
  onRecallableTimeChange: (enabled: boolean) => void;
  onChooseRecallableTime: () => void;
}

export const TransactionOptions: React.FC<TransactionOptionsProps> = ({
  sendAsGift,
  privateTransaction,
  recallableTime,
  onSendAsGiftChange,
  onPrivateTransactionChange,
  onRecallableTimeChange,
  onChooseRecallableTime,
}) => {
  return (
    <div className="space-y-1">
      <section className="flex flex-wrap gap-2.5 items-center py-2.5 pr-4 pl-3 w-full rounded-lg bg-zinc-800 max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-60">
          <h3 className="self-start text-base leading-none text-center text-white">Send as a gift</h3>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-600">
            Recipient doesn't know the amount, surprise!
          </p>
        </div>
        <ToggleSwitch enabled={sendAsGift} onChange={onSendAsGiftChange} />
      </section>

      <section className="flex flex-wrap gap-2.5 items-center py-2.5 pr-4 pl-3 w-full rounded-lg bg-zinc-800 max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-60">
          <h3 className="self-start text-base leading-none text-center text-white">Private transaction</h3>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-600">
            Only you and the receipient know about this transaction
          </p>
        </div>
        <ToggleSwitch enabled={privateTransaction} onChange={onPrivateTransactionChange} />
      </section>

      <section className="flex flex-wrap gap-2.5 items-center py-2.5 pr-4 pl-3 w-full rounded-lg bg-zinc-800 max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink justify-center basis-5 min-w-60">
          <h3 className="self-start text-base leading-none text-center text-white">Recallable time</h3>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-600">
            Get your money back after recallable time expires
          </p>
        </div>
        <ActionButton text="Choose" onClick={onChooseRecallableTime} className="" />
      </section>
    </div>
  );
};
