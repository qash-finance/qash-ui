"use client";

import React, { useState, useMemo } from "react";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { UITransaction } from "@/services/store/transaction";
import { QASH_TOKEN_DECIMALS, QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";

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
        className={`bg-[#0C0C0C] flex items-center justify-between rounded-t-lg p-0.5 text-white min-w-[120px] ${isOpen ? "" : "rounded-b-lg"}`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(o => !o)}
          className="bg-[#1E1E1E] flex items-center justify-between gap-2 h-8 px-2.5 py-1.5 rounded-lg text-white min-w-[120px] cursor-pointer"
        >
          <span className="text-sm leading-none truncate">{timeRange}</span>
          <img
            src="/arrow/chevron-down.svg"
            alt="Toggle dropdown"
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 top-full w-full bg-[#0c0c0c] rounded-b-lg p-0.5 shadow-lg">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              role="option"
              aria-selected={option.value === timeRange}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(option.value)}
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

const SpendingAverageChart = () => {
  const [timeRange, setTimeRange] = useState("Last 5 days");
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const transactions = useTransactionStore(state => state.transactions);
  const blockNumber = useMidenSdkStore(state => state.blockNum);

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

    // Calculate block range based on 5-second average block time
    const secondsPerDay = 24 * 60 * 60; // 86400 seconds per day
    const blocksPerDay = secondsPerDay / 5; // 17280 blocks per day (assuming 5 second block time)
    const blocksInTimeRange = Math.floor(blocksPerDay * daysAgo);
    const cutoffBlockNumber = blockNumber - blocksInTimeRange;

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
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      // Calculate block range for this specific day
      const dayStartBlock = blockNumber - Math.floor(blocksPerDay * (i + 1));
      const dayEndBlock = blockNumber - Math.floor(blocksPerDay * i);

      // Filter transactions for this day
      const dayTransactions = filteredTransactions.filter(transaction => {
        const txBlockNumber = parseInt(transaction.blockNumber);
        return txBlockNumber >= dayStartBlock && txBlockNumber < dayEndBlock;
      });

      let dayIncoming = BigInt(0);
      let dayExpense = BigInt(0);
      let dayIncomingCount = 0;
      let dayExpenseCount = 0;

      dayTransactions.forEach(transaction => {
        const assets = transaction.assets.filter(asset => asset.assetId === QASH_TOKEN_ADDRESS);
        const assetAmount = assets.reduce((acc, asset) => acc + asset.amount, BigInt(0));

        if (transaction.type === "Incoming" || transaction.type === "Faucet") {
          dayIncoming += assetAmount;
          dayIncomingCount++;
        } else if (transaction.type === "Outgoing") {
          dayExpense += assetAmount;
          dayExpenseCount++;
        }
      });

      dailyData.push({
        date,
        day: dayNames[date.getDay()],
        income: Number(dayIncoming) / 10 ** QASH_TOKEN_DECIMALS,
        expense: Number(dayExpense) / 10 ** QASH_TOKEN_DECIMALS,
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
  }, [transactions, timeRange, blockNumber]);

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
      opacity: hoveredColumn === index ? 1 : 0.3, // Highlight hovered column
    }));
  }, [transactionStats, hoveredColumn]);

  const handleColumnHover = (index: number, event: React.MouseEvent) => {
    setHoveredColumn(index);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleColumnLeave = () => {
    setHoveredColumn(null);
  };

  const columnWidth = timeRange === "Last 5 days" ? "60px" : "42px";
  const chartContainerStyle = { gap: `${COLUMN_GAP}px` };

  return (
    <div className="h-full overflow-hidden relative rounded-xl bg-[#1e1e1e] flex-1 flex justify-center items-start">
      {/* Header */}
      <div className="flex items-start justify-between p-4 w-full">
        <div className="flex flex-col gap-1 items-start w-[177px]">
          <div className="flex items-center gap-1 w-full">
            <img src="/wallet-analytics/bar-chart-icon.gif" alt="chart" className="w-5 h-5" />
            <span className="font-normal text-white text-sm">Spending Average</span>
          </div>
          <div className="flex gap-3 ml-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 bg-[#00e595] rounded-full" />
              <span className="font-normal opacity-50 text-white text-xs tracking-[0.5px]">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-[#fc2bad] h-2 rounded-full w-4" />
              <span className="font-normal opacity-50 text-white text-xs tracking-[0.5px]">Expense</span>
            </div>
          </div>
        </div>

        <TimeRangeDropdown timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      </div>

      {/* Chart */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center pb-4 pt-0 px-3 top-[62px] w-[345px]">
        <div className="flex flex-col gap-0.5 flex-1 h-full items-start justify-center">
          <div className="flex grow items-end w-full" style={chartContainerStyle}>
            {chartData.map((data, index) => (
              <div
                key={index}
                className="flex gap-1 items-end relative cursor-pointer"
                style={{
                  width: columnWidth,
                  opacity: data.opacity,
                }}
                onMouseEnter={e => handleColumnHover(index, e)}
                onMouseLeave={handleColumnLeave}
              >
                <div
                  className="flex-1 bg-[#00e595] min-h-px min-w-px relative rounded-[3px] transition-all duration-200"
                  style={{
                    height: `${data.income}px`,
                    transform: hoveredColumn === index ? "scale(1.05)" : "scale(1)",
                    boxShadow: hoveredColumn === index ? "0 0 10px rgba(0, 229, 149, 0.5)" : "none",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_-6px_7.8px_0px_inset_#78ff91,0px_4px_15px_0px_inset_#bbf7c6]" />
                </div>
                <div
                  className="flex-1 bg-[#ff009f] min-h-px min-w-px relative rounded-[3px] transition-all duration-200"
                  style={{
                    height: `${data.expense}px`,
                    transform: hoveredColumn === index ? "scale(1.05)" : "scale(1)",
                    boxShadow: hoveredColumn === index ? "0 0 10px rgba(255, 0, 159, 0.5)" : "none",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_4px_15px_0px_inset_#fec6e9,0px_-17px_13px_0px_inset_#ff009f]" />
                </div>
              </div>
            ))}
          </div>

          {/* Day Labels */}
          <div
            className="flex font-medium items-end text-white text-xs text-center tracking-[-0.24px] w-full"
            style={chartContainerStyle}
          >
            {chartData.map((data, index) => (
              <div
                key={index}
                className="h-[22px] flex items-center justify-center"
                style={{
                  width: columnWidth,
                  opacity: data.opacity === 1 ? 1 : 0.3,
                }}
              >
                <span className="block leading-[20px]">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Legend - Follows mouse position */}
      {hoveredColumn !== null && chartData[hoveredColumn] && (
        <div
          className="fixed bg-[#0c0c0c] flex flex-col gap-4 items-start justify-center p-3 rounded-md w-35 z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 80,
          }}
        >
          <span className="font-normal opacity-50 text-white text-xs tracking-[0.5px]">
            {chartData[hoveredColumn]?.day}, {chartData[hoveredColumn]?.date?.toLocaleDateString("en-GB")}
          </span>
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-4 bg-[#00e595] rounded-full" />
              <span className="font-normal text-white text-sm tracking-[0.5px]">
                {(chartData[hoveredColumn]?.rawIncome || 0).toFixed(2)} QASH
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-[#fc2bad] h-1.5 rounded-full w-4" />
              <span className="font-normal text-white text-sm tracking-[0.5px]">
                {(chartData[hoveredColumn]?.rawExpense || 0).toFixed(2)} QASH
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingAverageChart;
