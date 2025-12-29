"use client";

import React, { useState, useMemo } from "react";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { useAccountContext } from "@/contexts/AccountProvider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge, BadgeStatus } from "@/components/Common/Badge";

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
        className={`bg-background border border-primary-divider flex items-center justify-between p-0.5 rounded-t-lg text-text-primary min-w-[100px] ${isOpen ? "" : "rounded-b-lg"}`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-text-primary min-w-[100px] cursor-pointer outline-none"
        >
          <span className="text-sm leading-none">{timePeriod === "year" ? "This year" : "This month"}</span>
          <img
            src="/arrow/chevron-down.svg"
            alt="Toggle dropdown"
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 top-full w-full bg-background border border-primary-divider rounded-b-lg p-0.5 shadow-lg">
          {timeOptions.map(option => (
            <button
              key={option.value}
              role="option"
              aria-selected={option.value === timePeriod}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(option.value as "month" | "year")}
              className="w-full text-left text-text-primary text-sm p-2 rounded-lg hover:bg-app-background transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer"
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
  const { assets } = useAccountContext();
  const transactions = useTransactionStore(state => state.transactions);
  const loading = useTransactionStore(state => state.loading);
  const blockNumber = 0;

  // Generate monthly data for the chart based on block numbers
  const chartData = useMemo(() => {
    if (!blockNumber) {
      return [];
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based

    // Calculate block time constants
    const secondsPerDay = 24 * 60 * 60; // 86400 seconds per day
    const blocksPerDay = secondsPerDay / 5; // 17280 blocks per day (assuming 5 second block time)

    return months.map((month, monthIndex) => {
      // Skip future months
      if (monthIndex > currentMonth) {
        return {
          month,
          moneyIn: 0,
          moneyOut: 0,
        };
      }

      // Calculate days from start of year to end of this month
      const monthDate = new Date(currentYear, monthIndex + 1, 0); // Last day of the month
      const startOfYear = new Date(currentYear, 0, 1);
      const daysFromStartOfYear = Math.floor((monthDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate days from start of year to start of this month
      const startOfMonth = new Date(currentYear, monthIndex, 1);
      const daysToStartOfMonth = Math.floor((startOfMonth.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate block ranges for this month
      const blocksFromStartOfYear = Math.floor(blocksPerDay * daysFromStartOfYear);
      const blocksToStartOfMonth = Math.floor(blocksPerDay * daysToStartOfMonth);

      const monthEndBlock =
        blockNumber - Math.floor((currentDate.getTime() - monthDate.getTime()) / (1000 * 60 * 60 * 24)) * blocksPerDay;
      const monthStartBlock =
        blockNumber -
        Math.floor((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) * blocksPerDay;

      // Filter transactions for this month
      const monthTransactions = transactions.filter(transaction => {
        const txBlockNumber = parseInt(transaction.blockNumber);
        return txBlockNumber >= monthStartBlock && txBlockNumber <= monthEndBlock;
      });

      // Calculate totals for this month
      let monthIncoming = 0;
      let monthExpense = 0;

      monthTransactions.forEach(transaction => {
        // Process all assets in the transaction, not just QASH
        transaction.assets.forEach(asset => {
          // Find the asset metadata to get the correct decimals
          const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
          if (assetMetadata) {
            const assetAmount = Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;

            if (transaction.type === "Incoming" || transaction.type === "Faucet") {
              monthIncoming += assetAmount;
            } else if (transaction.type === "Outgoing") {
              monthExpense += assetAmount;
            }
          }
        });
      });

      return {
        month,
        moneyIn: monthIncoming,
        moneyOut: monthExpense,
      };
    });
  }, [transactions, timePeriod, blockNumber, assets]);

  const { moneyIn, moneyOut } = useMemo(() => {
    if (!blockNumber) {
      return { moneyIn: 0, moneyOut: 0 };
    }

    const currentDate = new Date();
    const secondsPerDay = 24 * 60 * 60;
    const blocksPerDay = secondsPerDay / 5;

    let filteredTransactions = [];

    if (timePeriod === "month") {
      // Calculate current month's block range
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const daysFromStartOfMonth = Math.floor((currentDate.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
      const blocksFromStartOfMonth = Math.floor(blocksPerDay * daysFromStartOfMonth);
      const monthStartBlock = blockNumber - blocksFromStartOfMonth;

      filteredTransactions = transactions.filter(tx => {
        const txBlockNumber = parseInt(tx.blockNumber);
        return txBlockNumber >= monthStartBlock && txBlockNumber <= blockNumber;
      });
    } else {
      // Calculate current year's block range
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const daysFromStartOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const blocksFromStartOfYear = Math.floor(blocksPerDay * daysFromStartOfYear);
      const yearStartBlock = blockNumber - blocksFromStartOfYear;

      filteredTransactions = transactions.filter(tx => {
        const txBlockNumber = parseInt(tx.blockNumber);
        return txBlockNumber >= yearStartBlock && txBlockNumber <= blockNumber;
      });
    }

    let moneyIn = 0;
    let moneyOut = 0;

    filteredTransactions.forEach(tx => {
      // Process all assets in the transaction, not just QASH
      tx.assets.forEach(asset => {
        // Find the asset metadata to get the correct decimals
        const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
        if (assetMetadata) {
          const assetAmount = Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;

          if (tx.type === "Incoming" || tx.type === "Faucet") {
            moneyIn += assetAmount;
          } else if (tx.type === "Outgoing") {
            moneyOut += assetAmount;
          }
        }
      });
    });

    return {
      moneyIn,
      moneyOut,
    };
  }, [transactions, timePeriod, blockNumber, assets]);

  // Calculate percentage changes compared to previous period
  const { moneyInChange, moneyOutChange } = useMemo(() => {
    if (!blockNumber) {
      return { moneyInChange: 0, moneyOutChange: 0 };
    }

    const currentDate = new Date();
    const secondsPerDay = 24 * 60 * 60;
    const blocksPerDay = secondsPerDay / 5;

    let previousPeriodTransactions = [];

    if (timePeriod === "month") {
      // Calculate previous month's block range
      const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      const daysFromStartOfCurrentMonth = Math.floor(
        (currentDate.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysFromStartOfPreviousMonth = Math.floor(
        (startOfCurrentMonth.getTime() - startOfPreviousMonth.getTime()) / (1000 * 60 * 60 * 24),
      );

      const previousMonthEndBlock = blockNumber - Math.floor(blocksPerDay * daysFromStartOfCurrentMonth);
      const previousMonthStartBlock =
        blockNumber - Math.floor(blocksPerDay * (daysFromStartOfCurrentMonth + daysFromStartOfPreviousMonth));

      previousPeriodTransactions = transactions.filter(tx => {
        const txBlockNumber = parseInt(tx.blockNumber);
        return txBlockNumber >= previousMonthStartBlock && txBlockNumber <= previousMonthEndBlock;
      });
    } else {
      // Calculate previous year's block range
      const startOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);
      const startOfPreviousYear = new Date(currentDate.getFullYear() - 1, 0, 1);

      const daysFromStartOfCurrentYear = Math.floor(
        (currentDate.getTime() - startOfCurrentYear.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysInPreviousYear = Math.floor(
        (startOfCurrentYear.getTime() - startOfPreviousYear.getTime()) / (1000 * 60 * 60 * 24),
      );

      const previousYearEndBlock = blockNumber - Math.floor(blocksPerDay * daysFromStartOfCurrentYear);
      const previousYearStartBlock =
        blockNumber - Math.floor(blocksPerDay * (daysFromStartOfCurrentYear + daysInPreviousYear));

      previousPeriodTransactions = transactions.filter(tx => {
        const txBlockNumber = parseInt(tx.blockNumber);
        return txBlockNumber >= previousYearStartBlock && txBlockNumber <= previousYearEndBlock;
      });
    }

    let previousMoneyIn = 0;
    let previousMoneyOut = 0;

    previousPeriodTransactions.forEach(tx => {
      // Process all assets in the transaction, not just QASH
      tx.assets.forEach(asset => {
        // Find the asset metadata to get the correct decimals
        const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
        if (assetMetadata) {
          const assetAmount = Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;

          if (tx.type === "Incoming" || tx.type === "Faucet") {
            previousMoneyIn += assetAmount;
          } else if (tx.type === "Outgoing") {
            previousMoneyOut += assetAmount;
          }
        }
      });
    });

    const moneyInChange = previousMoneyIn > 0 ? ((moneyIn - previousMoneyIn) / previousMoneyIn) * 100 : 0;
    const moneyOutChange = previousMoneyOut > 0 ? ((moneyOut - previousMoneyOut) / previousMoneyOut) * 100 : 0;

    return { moneyInChange, moneyOutChange };
  }, [transactions, timePeriod, blockNumber, moneyIn, moneyOut]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background rounded-md p-3 border border-primary-divider">
          <div className="text-text-primary text-xs opacity-50 mb-2">{label}</div>
          <div className="flex flex-col gap-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex gap-1.5 items-center">
                <div className={`h-1.5 w-4 rounded`} style={{ backgroundColor: entry.color }}></div>
                <div className="text-text-primary text-sm">${entry.value?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="overflow-hidden relative flex-1 transition-all duration-300 p-3 px-4 flex flex-col justify-between gap-2 h-[250px] border-r border-primary-divider">
      {/* Header */}
      <div className="flex flex-row gap-1 items-center">
        <img src="/wallet-analytics/money-icon.gif" alt="money-icon" className="w-8 h-4" />
        <div className="flex-1">
          <span className="capitalize font-medium text-text-primary">Summary Stats</span>
        </div>
        <TimePeriodDropdown timePeriod={timePeriod} onTimePeriodChange={onTimePeriodChange} />
      </div>

      {/* Money In Section */}
      {timePeriod === "month" ? (
        <div className="flex flex-col gap-2 w-full border-t-2 border-primary-divider bg-background rounded-xl p-3">
          <div className="flex flex-col">
            <span className="font-medium text-text-secondary text-sm">Income</span>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1.5 items-center text-text-primary text-2xl uppercase">
                <span className="font-normal">${loading ? "..." : moneyIn.toLocaleString()}</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="font-medium text-[#02BE75] text-base">+${moneyInChange.toFixed(2)}</span>
                <Badge status={BadgeStatus.SUCCESS} text={`${moneyInChange.toFixed(2)}%`} />
              </div>
            </div>
          </div>

          {/* Money Out Section */}
          <div className="flex flex-row gap-5 items-end justify-end">
            <div className="flex-1">
              <span className="font-medium text-text-secondary text-sm">Expense</span>
              <div className="flex flex-col">
                <div className="flex flex-row items-center text-text-primary text-2xl uppercase">
                  <span className="font-normal">${loading ? "..." : moneyOut.toLocaleString()}</span>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <span className="font-medium text-[#FB3748] text-base">${moneyOutChange.toFixed(2)}</span>
                  <Badge status={BadgeStatus.FAIL} text={`${moneyOutChange.toFixed(2)}%`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Chart Legend */}
          <div className="flex gap-3 items-center">
            <div className="flex gap-1.5 items-center">
              <div className="h-2 w-4 bg-[#00E595] rounded"></div>
              <span className="text-text-primary text-xs opacity-50 tracking-[0.5px]">Income</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <div className="h-2 w-4 bg-[#fc2bad] rounded"></div>
              <span className="text-text-primary text-xs opacity-50 tracking-[0.5px]">Expense</span>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer
            width="100%"
            height="80%"
            className="bg-background rounded-xl border-t-2 border-primary-divider"
          >
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }} className="!outline-none">
              {/*
                    // Dotted grid 
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /> 
                  */}
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                tickMargin={8}
                interval={0}
                minTickGap={0}
              />

              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="moneyIn"
                stroke="#00E595"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 7, fill: "#00E595", stroke: "#ffffff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="moneyOut"
                stroke="#fc2bad"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 7, fill: "#fc2bad", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default GeneralStatistics;

// P1GdgFdflcnAwCCT
