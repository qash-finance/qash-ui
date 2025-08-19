"use client";

import React, { useState, useMemo } from "react";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { QASH_TOKEN_DECIMALS } from "@/services/utils/constant";

interface GeneralStatisticsProps {
  timePeriod: "month" | "year";
  onTimePeriodChange: (period: "month" | "year") => void;
}

const TimePeriodDropdown: React.FC<{
  timePeriod: "month" | "year";
  onTimePeriodChange: (period: "month" | "year") => void;
}> = ({ timePeriod, onTimePeriodChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeOptions = [
    { value: timePeriod === "year" ? "month" : "year", label: timePeriod === "year" ? "This month" : "This year" },
  ];

  const handleSelect = (period: "month" | "year") => {
    onTimePeriodChange(period);
    setIsOpen(false);
  };

  return (
    <div className="relative" onBlur={() => setIsOpen(false)} tabIndex={0}>
      <div
        className={`bg-[#0C0C0C] flex items-center justify-between p-0.5 rounded-b-lg text-white min-w-[100px] ${isOpen ? "" : "rounded-t-lg"}`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(o => !o)}
          className="bg-[#1E1E1E] flex items-center justify-between gap-2 h-8 px-2.5 py-1.5 rounded-lg text-white min-w-[100px] cursor-pointer"
        >
          <span className="text-sm leading-none truncate">{timePeriod === "year" ? "This year" : "This month"}</span>
          <img
            src="/arrow/chevron-down.svg"
            alt="Toggle dropdown"
            className={`w-4 h-4 transition-transform ${!isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 bottom-full w-full bg-[#0c0c0c] rounded-t-lg p-0.5 shadow-lg">
          {timeOptions.map(option => (
            <button
              key={option.value}
              role="option"
              aria-selected={option.value === timePeriod}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(option.value as "month" | "year")}
              className="w-full text-left text-white text-sm tracking-[-0.42px] p-2 rounded-lg hover:bg-[#3a3a3a] transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GeneralStatistics = ({ timePeriod, onTimePeriodChange }: GeneralStatisticsProps) => {
  const transactions = useTransactionStore(state => state.transactions);
  const loading = useTransactionStore(state => state.loading);

  const { moneyIn, moneyOut } = useMemo(() => {
    // For now, we'll show all transactions since blockNumber is not a timestamp
    // In a real implementation, you'd need to get actual timestamps from the blockchain
    // We dont have timestamp in the transaction for now
    // https://github.com/0xnullifier/miden-browser-wallet/issues/3
    const filteredTransactions = transactions;

    const moneyIn = filteredTransactions
      .filter(tx => tx.type === "Incoming" || tx.type === "Faucet")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const moneyOut = filteredTransactions
      .filter(tx => tx.type === "Outgoing")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      moneyIn: moneyIn / 10 ** QASH_TOKEN_DECIMALS,
      moneyOut: moneyOut / 10 ** QASH_TOKEN_DECIMALS,
    };
  }, [transactions, timePeriod]);

  // Calculate percentage changes (placeholder - you might want to compare with previous period)
  const moneyInChange = 1.25; // Placeholder
  const moneyOutChange = -4.58; // Placeholder

  return (
    <div
      className="h-full overflow-hidden relative rounded-xl flex-1"
      style={{
        background: "linear-gradient(90deg, #0059FF 0%, #003699 100%)",
      }}
    >
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Header */}
        <div className="flex flex-row gap-1 items-center">
          <img src="/wallet-analytics/money-icon.gif" alt="money-icon" className="w-8 h-4" />
          <div className="flex-1">
            <span className="capitalize font-medium text-white text-base">General Statistics</span>
          </div>
        </div>

        {/* Money In Section */}
        <div className="flex flex-col">
          <span className="font-medium text-[#B2C6EB] text-sm">Money in</span>
          <div className="flex flex-col">
            <div className="flex flex-row gap-1.5 items-center text-white text-2xl uppercase">
              <span className="font-normal">$</span>
              <span className="font-medium tracking-[-0.72px]">{loading ? "..." : moneyIn.toLocaleString()}</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <span className="font-medium text-[#7cff96] text-base">+${moneyInChange.toFixed(2)}</span>
              <div className="bg-white flex items-center px-[7px] py-[5px] rounded-full">
                <span className="font-semibold text-[#059022] text-sm leading-[12px]">{moneyInChange}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Money Out Section */}
        <div className="flex flex-row gap-5 items-end justify-end">
          <div className="flex-1">
            <span className="font-medium text-[#B2C6EB] text-sm">Money Out</span>
            <div className="flex flex-col">
              <div className="flex flex-row items-center text-white text-2xl uppercase">
                <span className="font-normal">$</span>
                <span className="font-medium">{loading ? "..." : moneyOut.toLocaleString()}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="font-medium text-[#fc2bad] text-base">${moneyOutChange.toFixed(2)}</span>
                <div className="bg-white flex items-center px-[7px] py-[5px] rounded-full">
                  <span className="font-semibold text-[#ff2323] text-sm leading-[12px]">
                    {Math.abs(moneyOutChange)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Period Dropdown */}
          <TimePeriodDropdown timePeriod={timePeriod} onTimePeriodChange={onTimePeriodChange} />
        </div>
      </div>
    </div>
  );
};

export default GeneralStatistics;
