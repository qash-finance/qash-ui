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
}

const percentages = [25, 50, 75] as const;

export const AmountInput: React.FC<AmountInputProps> = ({
  selectedToken,
  availableBalance = 0,
  register,
  errors,
  setValue,
}) => {
  const handlePercentageSelect = (percentage: number | "MAX") => {
    console.log("Percentage button clicked:", percentage, "Available balance:", availableBalance);
    let newAmount: number;
    if (percentage === "MAX") {
      newAmount = availableBalance;
    } else {
      newAmount = (availableBalance * percentage) / 100;
    }

    // Round to the token's decimal places
    const roundedAmount = Number(newAmount.toFixed(selectedToken.metadata.decimals));

    console.log("Setting amount to:", roundedAmount);
    setValue("amount", roundedAmount);
  };

  return (
    <>
      {/* Amount */}
      <div className="flex flex-col text-5xl font-medium leading-none text-center align-middle row-span-5">
        <input
          {...register("amount", {
            required: "Amount is required",
            validate: {
              isNumber: value => !isNaN(value) || "Please enter a valid number",
              isPositive: value => parseFloat(value) > 0 || "Amount must be greater than 0",
              hasValidDecimals: value => {
                const decimals = value.toString().split(".")[1];
                return (
                  !decimals ||
                  decimals.length <= selectedToken.metadata.decimals ||
                  `Maximum ${selectedToken.metadata.decimals} decimal places allowed`
                );
              },
              isInRange: value => {
                const amount = parseFloat(value);
                return amount <= availableBalance || "Amount exceeds available balance";
              },
            },
          })}
          className="text-white opacity-20 text-center outline-none"
          placeholder="0.00"
          type="text"
          inputMode="decimal"
          onKeyDown={e => {
            // Allow: backspace, delete, tab, escape, enter, decimal point
            if (
              e.key === "Backspace" ||
              e.key === "Delete" ||
              e.key === "Tab" ||
              e.key === "Escape" ||
              e.key === "Enter" ||
              e.key === "." ||
              e.key === "ArrowLeft" ||
              e.key === "ArrowRight"
            ) {
              // Allow the key
              return;
            }

            // Block any non-number keys
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }

            // Block multiple decimal points
            if (e.key === "." && (e.target as HTMLInputElement).value.includes(".")) {
              e.preventDefault();
            }
          }}
          onChange={e => {
            // Remove any non-numeric characters except decimal point
            const value = e.target.value.replace(/[^\d.]/g, "");
            // Ensure only one decimal point
            const parts = value.split(".");
            const sanitizedValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "");
            e.target.value = sanitizedValue;

            // Update form value
            setValue("amount", sanitizedValue === "" ? "" : parseFloat(sanitizedValue));
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
