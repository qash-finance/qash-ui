"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { ToggleSwitch } from "../../Common/ToggleSwitch";
import { CustomCheckbox } from "../../Common/CustomCheckbox";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { AssetWithMetadata } from "@/types/faucet";

interface FixedAmountProps {
  isFixedAmountEnabled: boolean;
  setIsFixedAmountEnabled: (enabled: boolean) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedToken: AssetWithMetadata;
  handleTokenSelect: (token: AssetWithMetadata) => void;
  selectedPayDay: number;
  setSelectedPayDay: (day: number) => void;
  timePeriod: string;
  setTimePeriod: (period: string) => void;
  register: any;
  errors: any;
  isBonusAmountEnabled: boolean;
  setIsBonusAmountEnabled: (enabled: boolean) => void;
  applyToAll: boolean;
  setApplyToAll: (apply: boolean) => void;
  monthlyBonusAmounts: { [key: string]: string };
  handleMonthlyBonusChange: (monthKey: string, value: string) => void;
  numberOfMonths: number;
  inputContainerClass: string;
  labelClass: string;
}

export const FixedAmount = ({
  isFixedAmountEnabled,
  setIsFixedAmountEnabled,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedToken,
  handleTokenSelect,
  selectedPayDay,
  setSelectedPayDay,
  timePeriod,
  setTimePeriod,
  register,
  errors,
  isBonusAmountEnabled,
  setIsBonusAmountEnabled,
  applyToAll,
  setApplyToAll,
  monthlyBonusAmounts,
  handleMonthlyBonusChange,
  numberOfMonths,
  inputContainerClass,
  labelClass,
}: FixedAmountProps) => {
  const { openModal } = useModal();

  return (
    <div className="bg-payroll-sub-background border-t-2 border-background rounded-3xl overflow-hidden">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
        <h3 className="text-[18px] font-medium text-text-primary">Fixed amount</h3>
        <ToggleSwitch
          enabled={isFixedAmountEnabled}
          onChange={() => {
            setIsFixedAmountEnabled(!isFixedAmountEnabled);
          }}
        />
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFixedAmountEnabled ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 flex flex-col gap-4">
          {/* Contract Term */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-text-primary text-[16px]">Contract term</p>
              <p className="text-text-secondary text-[14px]">Please enter contract term below</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-background flex gap-2 items-center px-2 py-2.5 rounded-lg flex-1">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-text-secondary text-[14px] leading-none text-left">Start date</span>
                  <input
                    type="text"
                    disabled
                    placeholder="DD/MM/YYYY"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="text-[16px] text-text-primary placeholder:text-text-secondary outline-none w-full"
                  />
                </div>
                <img
                  src="/modal/calendar-icon.svg"
                  alt="Calendar"
                  className="w-6 h-6 cursor-pointer"
                  style={{ filter: "brightness(0)" }}
                  onClick={e => {
                    e.stopPropagation();
                    openModal(MODAL_IDS.DATE_PICKER, {
                      defaultSelected: new Date(),
                      onSelect: (date: Date) => {
                        const day = date.getDate().toString().padStart(2, "0");
                        const month = (date.getMonth() + 1).toString().padStart(2, "0");
                        const year = date.getFullYear();
                        setStartDate(`${day}/${month}/${year}`);
                      },
                    });
                  }}
                />
              </div>
              <div className="w-3 h-0 border-b border-primary-blue"></div>
              <div className="bg-background flex gap-2 items-center px-2 py-2.5 rounded-lg flex-1">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-text-secondary text-[14px] leading-none text-left">End date</span>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    disabled
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="text-[16px] text-text-primary placeholder:text-text-secondary outline-none w-full"
                  />
                </div>
                <img
                  src="/modal/calendar-icon.svg"
                  alt="Calendar"
                  className="w-6 h-6 cursor-pointer"
                  style={{ filter: "brightness(0)" }}
                  onClick={e => {
                    e.stopPropagation();
                    openModal(MODAL_IDS.DATE_PICKER, {
                      defaultSelected: new Date(),
                      onSelect: (date: Date) => {
                        const day = date.getDate().toString().padStart(2, "0");
                        const month = (date.getMonth() + 1).toString().padStart(2, "0");
                        const year = date.getFullYear();
                        setEndDate(`${day}/${month}/${year}`);
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Token Selector */}
          <div
            className={`${inputContainerClass} flex items-center justify-between cursor-pointer`}
            onClick={() =>
              openModal(MODAL_IDS.SELECT_TOKEN, {
                selectedToken,
                onTokenSelect: handleTokenSelect,
              })
            }
          >
            <div className="flex gap-3 items-center">
              {selectedToken.metadata.symbol ? (
                <>
                  <div className="relative w-10 h-10">
                    <img
                      alt=""
                      className="w-full h-full"
                      src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                    />
                    <img alt="" className="absolute bottom-0 right-0 w-5 h-5" src="/chain/miden.svg" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-text-primary text-sm">{selectedToken.metadata.symbol}</p>
                    <p className="text-text-secondary text-sm">Miden</p>
                  </div>
                </>
              ) : (
                <span className="text-text-primary py-1">Select token</span>
              )}
            </div>
            <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <div className="bg-background rounded-xl border-b-2 border-primary-divider">
              <div className="flex flex-col gap-1 px-4 py-2">
                <label className="text-text-secondary text-sm font-medium">Amount per transaction (Monthly)</label>
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
            <p className="text-text-primary text-[18px]">Pay day</p>
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
            <div className="bg-background border-b border-primary-divider rounded-2xl px-4 py-2">
              <div className="flex gap-1 items-center">
                <p className="text-text-primary text-[16px]">Every {selectedPayDay}st of the month</p>
                <p className="text-text-secondary text-[16px]">at</p>
                <input
                  {...register("time")}
                  type="text"
                  className="text-text-primary text-[16px] w-[50px] text-center leading-none outline-none"
                  autoComplete="off"
                  autoFocus={true}
                />
                <div className="bg-app-background border-b border-primary-divider rounded-lg px-0.5 py-0.5 gap-1 flex items-center justify-center flex-row">
                  <button
                    onClick={() => setTimePeriod("AM")}
                    className={`px-2 py-0.5 rounded-[8px] text-[12px] cursor-pointer ${
                      timePeriod === "AM" ? "bg-black text-white" : "bg-white text-text-secondary"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setTimePeriod("PM")}
                    className={`px-2 py-0.5 rounded-[8px] text-[12px] cursor-pointer ${
                      timePeriod === "PM" ? "bg-black text-white" : "bg-white text-text-secondary"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus Amount Section */}
        <div className="flex items-center justify-between p-4 pt-0 cursor-pointer hover:bg-white/5 transition-colors">
          <h3 className="text-[18px] font-medium text-text-primary">Bonus amount</h3>
          <ToggleSwitch
            enabled={isBonusAmountEnabled}
            onChange={() => setIsBonusAmountEnabled(!isBonusAmountEnabled)}
          />
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isBonusAmountEnabled ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
              <CustomCheckbox
                checked={applyToAll}
                onChange={() => setApplyToAll(!applyToAll)}
                className="text-text-primary"
              />
              <span className="text-text-primary text-sm">Apply to all</span>
            </div>

            {/* Monthly Bonus Inputs - Dynamic based on contract term */}
            {numberOfMonths > 0 ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: Math.min(numberOfMonths, 3) }, (_, index) => {
                  const monthNumber = index + 1;
                  const monthKey = `month_${monthNumber}`;
                  const monthValue = monthlyBonusAmounts[monthKey] || "";

                  return (
                    <div key={monthKey} className={`${inputContainerClass} flex items-center justify-between`}>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <p className={labelClass}>
                          {monthNumber === 1
                            ? "1st"
                            : monthNumber === 2
                              ? "2nd"
                              : monthNumber === 3
                                ? "3rd"
                                : `${monthNumber}th`}{" "}
                          month
                        </p>
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder="0.00"
                          value={monthValue}
                          onChange={e => handleMonthlyBonusChange(monthKey, e.target.value)}
                          className="outline-none bg-transparent text-text-primary placeholder:text-text-secondary"
                        />
                      </div>
                      <span className="text-text-primary">{selectedToken.metadata.symbol}</span>
                    </div>
                  );
                })}
                {numberOfMonths > 3 && (
                  <SecondaryButton
                    text={`View all ${numberOfMonths} months`}
                    onClick={() => {
                      openModal(MODAL_IDS.BONUS_AMOUNT, {
                        monthlyBonusAmounts,
                        onUpdateAmounts: handleMonthlyBonusChange,
                        numberOfMonths,
                        selectedTokenSymbol: selectedToken.metadata.symbol || "Token",
                      });
                    }}
                    variant="light"
                    buttonClassName="outline-2 outline-primary-divider rounded-[10px] !border-t-0 border-2 border-[#DADCDF] font-semibold"
                  />
                )}
              </div>
            ) : (
              <div className="flex w-full items-center justify-center">
                <p className="text-text-secondary text-sm">
                  {!startDate || !endDate
                    ? "Please select start and end dates to configure monthly bonuses"
                    : "Invalid date range - end date must be after start date"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
