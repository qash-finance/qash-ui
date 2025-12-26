"use client";

import React, { useState, useMemo } from "react";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { UITransaction } from "@/services/store/transaction";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { Tooltip } from "react-tooltip";
import { useAccountContext } from "@/contexts/AccountProvider";

const COLUMN_GAP = 10; // Gap between chart columns in pixels

const TimeRangeDropdown: React.FC<{ timeRange: string; onTimeRangeChange: (range: string) => void }> = ({
  timeRange,
  onTimeRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeRangeOptions = [
    { value: "Last 5 days", label: "Last 5 days" },
    { value: "Last 7 days", label: "Last 7 days" },
  ];

  const handleSelect = (range: string) => {
    onTimeRangeChange(range);
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
          <span className="text-sm leading-none">{timeRange === "Last 5 days" ? "Last 5 days" : "Last 7 days"}</span>
          <img
            src="/arrow/chevron-down.svg"
            alt="Toggle dropdown"
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 top-full w-full bg-background border border-primary-divider rounded-b-lg p-0.5 shadow-lg">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              role="option"
              aria-selected={option.value === timeRange}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(option.value as string)}
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

const SpendingAverageChart = () => {
  const { assets } = useAccountContext();
  const [timeRange, setTimeRange] = useState("Last 5 days");
  const transactions = useTransactionStore(state => state.transactions);
  const blockNumber = 0;

  // Calculate transaction statistics based on time range and block numbers
  const transactionStats = useMemo(() => {
    if (!blockNumber) {
      return {
        totalIncoming: 0,
        totalExpense: 0,
        avgIncoming: 0,
        avgExpense: 0,
        incomingCount: 0,
        expenseCount: 0,
        totalTransactions: 0,
        dailyData: [],
      };
    }

    const now = new Date();
    let daysAgo: number;

    switch (timeRange) {
      case "Last 5 days":
        daysAgo = 5;
        break;
      case "Last 7 days":
        daysAgo = 7;
        break;
      default:
        daysAgo = 5;
    }

    // Use local timezone calendar day boundaries by converting day start/end timestamps
    // to approximate block numbers based on 5s average block time
    const secondsPerBlock = 5;
    const msPerBlock = secondsPerBlock * 1000;
    const blockAtTime = (timeMs: number) => blockNumber - Math.floor((now.getTime() - timeMs) / msPerBlock);

    // Start of the earliest day in range (local timezone)
    const rangeStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysAgo - 1), 0, 0, 0, 0);
    const cutoffBlockNumber = blockAtTime(rangeStartDate.getTime());

    // Filter transactions by block number range
    const filteredTransactions = transactions.filter(transaction => {
      const txBlockNumber = parseInt(transaction.blockNumber);
      return txBlockNumber >= cutoffBlockNumber && txBlockNumber <= blockNumber;
    });

    // Calculate daily breakdown
    const dailyData: Array<{
      date: Date;
      day: string;
      income: number;
      expense: number;
      incomingCount: number;
      expenseCount: number;
    }> = [];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = daysAgo - 1; i >= 0; i--) {
      // Start/end of the calendar day in user's local timezone
      const dayStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
      const dayEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1, 0, 0, 0, 0);

      // Calculate block range for this specific day based on timestamps
      const dayStartBlock = blockAtTime(dayStartDate.getTime());
      const dayEndBlock = blockAtTime(dayEndDate.getTime());

      // Filter transactions for this day
      const dayTransactions = filteredTransactions.filter(transaction => {
        const txBlockNumber = parseInt(transaction.blockNumber);
        return txBlockNumber >= dayStartBlock && txBlockNumber < dayEndBlock;
      });

      let dayIncoming = 0;
      let dayExpense = 0;
      let dayIncomingCount = 0;
      let dayExpenseCount = 0;

      dayTransactions.forEach(transaction => {
        // Process all assets in the transaction, not just QASH
        transaction.assets.forEach(asset => {
          // Find the asset metadata to get the correct decimals
          const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
          if (assetMetadata) {
            const assetAmount = Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;

            if (transaction.type === "Incoming" || transaction.type === "Faucet") {
              dayIncoming += assetAmount;
              dayIncomingCount++;
            } else if (transaction.type === "Outgoing") {
              dayExpense += assetAmount;
              dayExpenseCount++;
            }
          }
        });
      });

      dailyData.push({
        date: dayStartDate,
        day: dayNames[dayStartDate.getDay()],
        income: dayIncoming,
        expense: dayExpense,
        incomingCount: dayIncomingCount,
        expenseCount: dayExpenseCount,
      });
    }

    // Calculate totals and averages
    const totalIncoming = dailyData.reduce((sum, day) => sum + day.income, 0);
    const totalExpense = dailyData.reduce((sum, day) => sum + day.expense, 0);
    const totalIncomingCount = dailyData.reduce((sum, day) => sum + day.incomingCount, 0);
    const totalExpenseCount = dailyData.reduce((sum, day) => sum + day.expenseCount, 0);

    const avgIncoming = totalIncomingCount > 0 ? totalIncoming / totalIncomingCount : 0;
    const avgExpense = totalExpenseCount > 0 ? totalExpense / totalExpenseCount : 0;

    return {
      totalIncoming,
      totalExpense,
      avgIncoming,
      avgExpense,
      incomingCount: totalIncomingCount,
      expenseCount: totalExpenseCount,
      totalTransactions: filteredTransactions.length,
      dailyData,
    };
  }, [transactions, timeRange, blockNumber, assets]);

  // Generate chart data based on daily transaction data
  const chartData = useMemo(() => {
    if (!transactionStats.dailyData.length) {
      return [];
    }

    // Find the maximum value across all days for proper scaling
    const maxIncome = Math.max(...transactionStats.dailyData.map(day => day.income));
    const maxExpense = Math.max(...transactionStats.dailyData.map(day => day.expense));
    const maxValue = Math.max(maxIncome, maxExpense);
    const scaleFactor = maxValue > 0 ? 100 / maxValue : 1; // Scale to max 100px height

    return transactionStats.dailyData.map((dayData, index) => ({
      date: dayData.date,
      day: dayData.day,
      income: Math.min(100, dayData.income * scaleFactor),
      expense: Math.min(100, dayData.expense * scaleFactor),
      rawIncome: dayData.income, // Keep raw values for tooltip
      rawExpense: dayData.expense,
    }));
  }, [transactionStats]);

  const columnWidth = timeRange === "Last 5 days" ? "60px" : "42px";
  const chartContainerStyle = { gap: `${COLUMN_GAP}px` };

  return (
    <div className="h-[250px] overflow-hidden relative flex-1 flex items-start flex-col px-4 pt-4 pb-2 gap-2">
      {/* Header */}
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col gap-1 items-start w-[177px]">
          <div className="flex items-center gap-1 w-full">
            <img src="/wallet-analytics/bar-chart-icon.gif" alt="chart" className="w-5 h-5" />
            <span className="font-normal text-text-primary text-sm">Spending Average</span>
          </div>
          <div className="flex gap-3 ml-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 bg-[#00e595] rounded-full" />
              <span className="font-normal opacity-50 text-text-primary text-xs tracking-[0.5px]">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-[#fc2bad] h-2 rounded-full w-4" />
              <span className="font-normal opacity-50 text-text-primary text-xs tracking-[0.5px]">Expense</span>
            </div>
          </div>
        </div>

        <TimeRangeDropdown timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      </div>

      {/* Chart */}
      <div className="flex-1 flex justify-around w-full">
        <div className="flex flex-col h-full items-center justify-center bg-background border-t-2 border-primary-divider rounded-xl w-full">
          <div className="flex grow items-end justify-center w-full" style={chartContainerStyle}>
            {chartData.map((data, index) => (
              <div
                key={index}
                className="flex gap-1 items-end relative cursor-pointer group"
                style={{
                  width: columnWidth,
                }}
                data-tooltip-id={`chart-tooltip-${index}`}
                data-tooltip-content={`${data.day}, ${data.date?.toLocaleDateString("en-GB")}`}
              >
                <div
                  className="flex-1 bg-[#00e595] min-h-px min-w-px relative rounded-[3px] transition-all duration-200 opacity-30 group-hover:opacity-100 group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(0,229,149,0.5)]"
                  style={{
                    height: `${data.income}px`,
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_-6px_7.8px_0px_inset_#78ff91,0px_4px_15px_0px_inset_#bbf7c6]" />
                </div>
                <div
                  className="flex-1 bg-[#ff009f] min-h-px min-w-px relative rounded-[3px] transition-all duration-200 opacity-30 group-hover:opacity-100 group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(255,0,159,0.5)]"
                  style={{
                    height: `${data.expense}px`,
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_4px_15px_0px_inset_#fec6e9,0px_-17px_13px_0px_inset_#ff009f]" />
                </div>
              </div>
            ))}
          </div>

          {/* Day Labels */}
          <div className="flex text-text-primary text-xs text-center w-full justify-center" style={chartContainerStyle}>
            {chartData.map((data, index) => (
              <div
                key={index}
                className="h-[22px] flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  width: columnWidth,
                }}
              >
                <span className="block leading-[20px]">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltips for each chart column */}
      {chartData.map((data, index) => (
        <Tooltip
          key={index}
          id={`chart-tooltip-${index}`}
          className="bg-background text-text-primary p-3 rounded-md border border-primary-divider max-w-[200px] z-50"
          style={{
            borderRadius: "12px",
            padding: "12px",
            backgroundColor: "background",
            color: "text-text-primary",
            border: "1px solid #000000",
            maxWidth: "200px",
            zIndex: 50,
          }}
          render={({ content }) => (
            <div className="flex flex-col gap-4 items-start justify-center">
              <span className="font-normal opacity-50 text-text-primary text-xs tracking-[0.5px]">{content}</span>
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-4 bg-[#00e595] rounded-full" />
                  <span className="font-normal text-text-primary text-sm tracking-[0.5px]">
                    ${data.rawIncome.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-[#fc2bad] h-1.5 rounded-full w-4" />
                  <span className="font-normal text-text-primary text-sm tracking-[0.5px]">
                    ${data.rawExpense.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        />
      ))}
    </div>
  );
};

export default SpendingAverageChart;
