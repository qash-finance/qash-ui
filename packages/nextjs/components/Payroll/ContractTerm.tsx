"use client";
import React, { useState } from "react";
import { AssetWithMetadata } from "@/types/faucet";

interface FixedAmountProps {
  selectedToken: AssetWithMetadata | null;
  selectedPayDay: number;
  setSelectedPayDay: (day: number) => void;
  register: any;
  errors: Record<string, any>;
  setValue: any;
  inputContainerClass?: string;
  labelClass?: string;
}

export const ContractTerm = ({
  selectedToken,
  selectedPayDay,
  setSelectedPayDay,
  register,
  errors,
  setValue,
  inputContainerClass,
  labelClass,
}: FixedAmountProps) => {
  const [durationUnit, setDurationUnit] = useState<"month" | "year">("month");
  const handleToggleUnit = () => {
    const newUnit = durationUnit === "month" ? "year" : "month";
    setDurationUnit(newUnit);
    setValue("durationUnit", newUnit, { shouldValidate: true });
  };

  return (
    <div className="bg-payroll-sub-background border-t-2 border-background rounded-3xl overflow-hidden">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
        <h3 className="text-[18px] font-medium text-text-primary">Contract Term</h3>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className={`${inputContainerClass} flex items-center justify-between`}>
            <div className="flex flex-col gap-0.5 flex-1">
              <p className={labelClass}>Duration</p>
              <input
                {...register("duration", { required: "Duration is required" })}
                type="text"
                autoComplete="off"
                placeholder="Please enter contract duration"
                className="outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleToggleUnit}
              className="bg-background flex items-center justify-center rounded-lg w-fit cursor-pointer border border-primary-divider px-4 py-2 gap-2 shadow-lg"
            >
              <span className="leading-none">{durationUnit}</span>
              <img src="/arrow/chevron-up-down.svg" alt="chevron-down" className="w-4" />
            </button>
          </div>
          {/* Hidden input to register durationUnit in the form */}
          <input type="hidden" {...register("durationUnit")} />
          {errors.duration && (
            <div className="flex items-center gap-1 pl-2">
              <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
              <span className="text-[#E93544] text-sm">{errors.duration?.message}</span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <div className="bg-background rounded-xl border-b-2 border-primary-divider flex items-center justify-between">
            <div className="flex flex-col gap-1 px-4 py-2">
              <label className="text-text-secondary text-sm font-medium">Amount (Monthly)</label>
              <input
                {...register("monthlyAmount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: "Amount must be a valid positive number",
                  },
                })}
                type="text"
                placeholder="Enter amount"
                className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                autoFocus={true}
                autoComplete="off"
              />
            </div>
            <span className="text-text-primary pr-2">{selectedToken ? selectedToken.metadata.symbol : ""}</span>
          </div>
          {errors.monthlyAmount && (
            <div className="flex items-center gap-1 pl-2">
              <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
              <span className="text-[#E93544] text-sm">{errors.monthlyAmount?.message}</span>
            </div>
          )}
        </div>

        {/* Pay Day Calendar */}
        <div className="flex flex-col gap-2">
          <p className="text-text-primary text-[18px]">Scheduled pay date</p>
          <div className="bg-background border border-primary-divider rounded-2xl p-3">
            <div className="grid grid-cols-8">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedPayDay(day)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] cursor-pointer ${
                    selectedPayDay === day ? "bg-primary-blue text-white" : "text-text-secondary hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-background rounded-xl border-b-2 border-primary-divider">
            <div className="flex flex-col gap-1 px-4 py-2">
              <label className="text-text-secondary text-sm font-medium">Item description</label>
              <input
                {...register("description", {
                  required: "Description is required",
                })}
                type="text"
                placeholder="Add a description"
                className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                autoFocus={true}
                autoComplete="off"
              />
            </div>
          </div>
          {errors.description && (
            <div className="flex items-center gap-1 pl-2">
              <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
              <span className="text-[#E93544] text-sm">{errors.description?.message}</span>
            </div>
          )}

          <div className="bg-background rounded-xl border-b-2 border-primary-divider">
            <div className="flex flex-col gap-1 px-4 py-2">
              <label className="text-text-secondary text-sm font-medium">Note (Optional)</label>
              <input
                {...register("note")}
                type="text"
                placeholder="Add a note"
                className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
                autoFocus={true}
                autoComplete="off"
              />
            </div>
          </div>
          {errors.note && (
            <div className="flex items-center gap-1 pl-2">
              <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
              <span className="text-[#E93544] text-sm">{errors.note?.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
