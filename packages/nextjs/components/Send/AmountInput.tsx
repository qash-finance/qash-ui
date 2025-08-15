"use client";
import { AssetWithMetadata } from "@/types/faucet";
import React from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue, useForm } from "react-hook-form";

interface AmountInputProps {
  selectedToken: AssetWithMetadata;
  availableBalance?: number;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  disabled?: boolean;
}

const percentages = [25, 50, 75] as const;

export const AmountInput: React.FC<AmountInputProps> = ({
  selectedToken,
  availableBalance = 0,
  register,
  errors,
  setValue,
  disabled = false,
}) => {
  const handlePercentageSelect = (percentage: number | "MAX") => {
    let newAmount: number;
    if (percentage === "MAX") {
      newAmount = availableBalance;
    } else {
      newAmount = (availableBalance * percentage) / 100;
    }

    // Round to the token's decimal places
    const roundedAmount = Number(newAmount.toFixed(selectedToken.metadata.decimals));

    setValue("amount", roundedAmount);
  };

  return (
    <>
      {/* Amount */}
      <div className="flex flex-col text-5xl font-medium leading-none text-center align-middle row-span-5">
        <input
          {...register("amount", {
            required: "Amount is required",
            min: { value: 0, message: "Amount must be greater than 0" },
          })}
          autoComplete="off"
          disabled={disabled}
          className={`text-white text-center outline-none ${disabled ? "opacity-50" : ""}`}
          placeholder="0.00"
          type="number"
          inputMode="decimal"
          step="0.000000000000000001" // 18 decimal places
          onKeyDown={e => {
            if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
            if (e.key === "e" || e.key === "E") e.preventDefault();
          }}
        />
        {errors.amount && <span className="text-sm text-red-500 mt-1">{errors.amount.message as string}</span>}
      </div>

      {/* Percentage Buttons */}
      <section className="flex gap-1 justify-center items-center w-full text-base font-medium leading-none row-span-1 px-2">
        {percentages.map(percentage => (
          <button
            key={percentage}
            onClick={() => handlePercentageSelect(percentage)}
            className="cursor-pointer flex flex-1 shrink gap-1 justify-center items-center px-6 py-2 rounded-md bg-[#3D3D3D] hover:bg-neutral-600 transition-colors max-md:px-5"
            type="button"
            disabled={disabled}
          >
            <span className="text-white">{percentage}</span>
            <span className="text-white">%</span>
          </button>
        ))}
        <button
          onClick={() => handlePercentageSelect("MAX")}
          className="flex flex-1 shrink gap-2 justify-center items-center px-6 py-2 rounded-md bg-[#3D3D3D] hover:bg-neutral-600 transition-colors max-md:px-5"
          type="button"
          disabled={disabled}
        >
          <span className="text-white">MAX</span>
        </button>
      </section>
    </>
  );
};
