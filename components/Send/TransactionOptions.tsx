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
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState("1 hour");
  const options = ["1 hour", "12 hours", "24 hours"];

  const baseItem =
    "self-stretch px-1.5 py-[5px] bg-Grey-950 inline-flex justify-start items-center gap-2 cursor-pointer hover:bg-[#353535] transition-colors";
  const textClass = "justify-start text-white text-sm font-normal font-['Barlow'] leading-none";

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
        <div className="relative">
          <button
            className="w-24 px-2 py-1 bg-[#464646] rounded-lg text-white text-sm font-normal font-['Barlow'] shadow-[0px_0px_14px_0px_rgba(0,0,0,0.25)] flex flex-row gap-1 items-center justify-between"
            onClick={() => setOpen(v => !v)}
            type="button"
          >
            {selected}
            <img src="/arrow/filled-arrow-down.svg" alt="dropdown-arrow" className="w-2 h-2" />
          </button>
          {open && (
            <div className="w-24 p-0.5 -left-4 top-8 absolute bg-[#292929] rounded-lg shadow-[0px_0px_14px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-center gap-0.5 overflow-hidden z-10">
              {options.map((option, i) => {
                const isFirst = i === 0;
                const isLast = i === options.length - 1;
                const rounded = isFirst
                  ? "rounded-tl-md rounded-tr-md rounded-bl-[3px] rounded-br-[3px]"
                  : isLast
                    ? "rounded-tl-[3px] rounded-tr-[3px] rounded-bl-md rounded-br-md"
                    : "rounded-[3px]";
                const border = !isLast ? "border-b border-[#3D3D3D]" : "";
                return (
                  <div
                    key={option}
                    className={`${baseItem} ${rounded} ${border} `}
                    onClick={() => {
                      setSelected(option);
                      setOpen(false);
                    }}
                  >
                    <div className={textClass}>{option}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
