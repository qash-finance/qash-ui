"use client";
import React from "react";
import { useFormContext, UseFormRegister } from "react-hook-form";
import { ToggleSwitch } from "../Common/ToggleSwitch";

interface TransactionOptionsProps {
  privateTransaction: boolean;
  recallableTime: boolean;
  onPrivateTransactionChange: (enabled: boolean) => void;
  onRecallableTimeChange: (enabled: boolean) => void;
  onChooseRecallableTime: () => void;
  register: UseFormRegister<any>;
}

const options = [
  {
    label: "1 hour",
    value: 1 * 60 * 60,
  },
  {
    label: "12 hours",
    value: 12 * 60 * 60,
  },
  {
    label: "24 hours",
    value: 24 * 60 * 60,
  },
];

export const TransactionOptions: React.FC<TransactionOptionsProps> = ({
  privateTransaction,
  recallableTime,
  onPrivateTransactionChange,
  onRecallableTimeChange,
  onChooseRecallableTime,
  register,
}) => {
  return (
    <div className="space-y-1">
      {/* <section className="flex flex-wrap gap-2.5 items-center py-2.5 pr-4 pl-3 w-full rounded-lg bg-zinc-800 max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-60">
          <h3 className="self-start text-base leading-none text-center text-white">Send as a gift</h3>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-600">
            Recipient doesn't know the amount, surprise!
          </p>
        </div>
        <ToggleSwitch enabled={sendAsGift} onChange={onSendAsGiftChange} />
      </section> */}

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
          <h3 className="self-start text-base leading-none text-center text-white">Cancellable in</h3>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-600">
            Get your money back after recallable time expires
          </p>
        </div>
        <select
          {...register("recallableTime")}
          className="w-24 px-2 py-1 bg-[#464646] rounded-lg text-white text-sm font-normal font-['Barlow'] shadow-[0px_0px_14px_0px_rgba(0,0,0,0.25)] cursor-pointer"
          defaultValue="1 hour"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
};
