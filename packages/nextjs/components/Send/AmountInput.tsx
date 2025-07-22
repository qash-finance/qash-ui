"use client";
import * as React from "react";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  selectedToken: string;
  availableBalance?: number; // add this prop
}

const percentages = [25, 50, 75] as const;

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  onAmountChange,
  selectedToken,
  availableBalance = 0,
}) => {
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
    <>
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
    </>
  );
};
