"use client";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import * as React from "react";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  selectedToken: string;
  availableBalance?: number; // add this prop
}

interface PercentageButtonsProps {
  onPercentageSelect: (percentage: number | "MAX") => void;
}

const percentages = [25, 50, 75] as const;

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  onAmountChange,
  selectedToken,
  availableBalance = 0,
}) => {
  const { openModal } = useModal();

  const handlePercentageSelect = (percentage: number | "MAX") => {
    let newAmount: string;
    if (percentage === "MAX") {
      newAmount = availableBalance.toFixed(2);
    } else {
      newAmount = ((availableBalance * percentage) / 100).toFixed(2);
    }
    onAmountChange(newAmount);
  };

  return (
    <section className="grid grid-rows-7 overflow-hidden flex-col items-center pb-3 w-full text-white whitespace-nowrap rounded-xl bg-[#292929]">
      {/* Title */}
      <header className="flex flex-wrap gap-5 justify-between self-stretch px-3 py-2 w-full bg-[#2D2D2D] row-span-1">
        <h2 className="text-white mt-0.5">Sending</h2>
        <div className="flex gap-2 items-center text-sm font-medium leading-none">
          <div className="flex gap-5 justify-between py-0.5 pr-0.5 pl-2 rounded-[10px] bg-neutral-900">
            <input
              type="text"
              readOnly
              value={amount}
              onChange={e => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-white outline-none w-20"
            />
            <button className="flex flex-col justify-center py-1 px-2 rounded-[10px] bg-zinc-800 hover:bg-zinc-700 transition-colors outline-none">
              <div
                className="flex gap-1 items-center cursor-pointer"
                onClick={() => {
                  openModal(MODAL_IDS.SELECT_TOKEN);
                }}
              >
                <img src="/token/usdt.svg" alt="Token" className="w-5 h-5" />
                <span className="text-white">{selectedToken}</span>
                <img
                  src="/arrow/filled-arrow-down.svg"
                  alt="Dropdown arrow"
                  className="object-contain shrink-0 aspect-[1.75] fill-white w-[7px]"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Amount */}
      <div className="flex flex-col text-5xl font-medium leading-none text-center align-middle row-span-5">
        <input
          className="text-white opacity-20 text-center outline-none"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          placeholder="0.00"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          pattern="^[0-9]*\.?[0-9]{0,2}$"
          onKeyDown={e => {
            if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
            if (e.key === "e" || e.key === "E") e.preventDefault();
          }}
        />
      </div>

      {/* Percentage Buttons */}
      <section className="flex gap-1 justify-center items-center w-full text-base font-medium leading-none row-span-1 px-2">
        {percentages.map(percentage => (
          <button
            key={percentage}
            onClick={() => handlePercentageSelect(percentage)}
            className="flex flex-1 shrink gap-1 justify-center items-center px-6 py-2 rounded-md bg-[#3D3D3D] hover:bg-neutral-600 transition-colors max-md:px-5"
            type="button"
          >
            <span className="text-white">{percentage}</span>
            <span className="text-white">%</span>
          </button>
        ))}
        <button
          onClick={() => handlePercentageSelect("MAX")}
          className="flex flex-1 shrink gap-2 justify-center items-center px-6 py-2 rounded-md bg-[#3D3D3D] hover:bg-neutral-600 transition-colors max-md:px-5"
          type="button"
        >
          <span className="text-white">MAX</span>
        </button>
      </section>
    </section>
  );
};
