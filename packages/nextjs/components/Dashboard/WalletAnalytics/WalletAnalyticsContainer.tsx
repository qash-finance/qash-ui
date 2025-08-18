"use client";

import React, { useState } from "react";
import { ActionButton } from "../../Common/ActionButton";
import toast from "react-hot-toast";
import TransactionDetail from "./TransactionDetail";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";

const ANIMATION_DURATION = 300;

interface GeneralStatisticsProps {
  timePeriod: "month" | "year";
  onTimePeriodChange: (period: "month" | "year") => void;
}

interface TopInteractedAddress {
  address: string;
  points: number;
  rank: number;
  avatar: string;
}

interface Transaction {
  hash: string;
  type: "Transfer" | "Buy" | "Sell" | "Mint";
  timestamp: string;
  from: string;
  to: string;
  value: string;
}

const transactions: Transaction[] = [
  {
    hash: "0x097...0fdb7",
    type: "Transfer",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Buy",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Sell",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Mint",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Transfer",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Buy",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Sell",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Mint",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Transfer",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Buy",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Sell",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
  {
    hash: "0x097...0fdb7",
    type: "Mint",
    timestamp: "2024-12-04 08:00:00",
    from: "0x097...0fdb7",
    to: "0x097...0fdb7",
    value: "0.000245 BTC",
  },
];

const addresses: TopInteractedAddress[] = [
  { address: "0x097...0fdb7", points: 4789000, rank: 1, avatar: blo(turnBechToHex("0x097...0fdb7")) },
  { address: "0x097...0fdb7", points: 3456000, rank: 2, avatar: blo(turnBechToHex("0x097...0fdb7")) },
  { address: "0x097...0fdb7", points: 1234000, rank: 3, avatar: blo(turnBechToHex("0x097...0fdb7")) },
];

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
          className="bg-[#1E1E1E] flex items-center justify-between gap-2 h-8 px-2.5 py-1.5 rounded-lg text-white min-w-[100px]"
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
              className="w-full text-left text-white text-sm tracking-[-0.42px] p-2 rounded-lg hover:bg-[#3a3a3a] transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TimeRangeDropdown: React.FC<{ timeRange: string; onTimeRangeChange: (range: string) => void }> = ({
  timeRange,
  onTimeRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const timeRangeOptions = [
    {
      value: timeRange === "Last 5 days" ? "Last 7 days" : "Last 5 days",
      label: timeRange === "Last 5 days" ? "Last 7 days" : "Last 5 days",
    },
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
          className="bg-[#1E1E1E] flex items-center justify-between gap-2 h-8 px-2.5 py-1.5 rounded-lg text-white min-w-[120px]"
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
              className="w-full text-left text-white text-sm tracking-[-0.42px] p-2 rounded-lg hover:bg-[#3a3a3a] transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GeneralStatistics: React.FC<GeneralStatisticsProps> = ({ timePeriod, onTimePeriodChange }) => {
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
              <span className="font-medium tracking-[-0.72px]">5,254,217,052</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <span className="font-medium text-[#7cff96] text-base">+$126.40</span>
              <div className="bg-white flex items-center px-[7px] py-[5px] rounded-full">
                <span className="font-semibold text-[#059022] text-sm leading-[12px]">1.25%</span>
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
                <span className="font-medium">144,217,05</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="font-medium text-[#fc2bad] text-base">-$2,126.40</span>
                <div className="bg-white flex items-center px-[7px] py-[5px] rounded-full">
                  <span className="font-semibold text-[#ff2323] text-sm leading-[12px]">4.58%</span>
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

const TopInteractedAddresses: React.FC = () => {
  return (
    <div
      className="flex flex-col gap-6 h-[250px] items-center pb-2 pt-4 px-2 relative rounded-xl overflow-hidden flex-1"
      style={{
        background: "linear-gradient(180deg, #06ffb4 0%, #04AED9 100%)",
      }}
    >
      <div className="flex flex-col gap-4 flex-1 w-full relative">
        {/* Header */}
        <div className="flex flex-row gap-1 items-center w-full">
          <img src="/wallet-analytics/trophy-icon.gif" alt="trophy" className="w-5 h-5" />
          <span className="capitalize font-medium text-[#292929] text-base">top interacted address</span>
        </div>

        {/* Addresses List */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="bg-white cursor-pointer flex flex-col gap-1 items-center justify-center p-2 rounded-[10px] shadow-[0px_0px_0px_1px_#0059ff,0px_1px_3px_0px_rgba(9,65,143,0.2)] w-full h-full">
            <div className="flex items-center justify-center w-full">
              <div className=" w-full">
                {addresses.map((address, index) => (
                  <div key={index} className="flex flex-row gap-3 items-center px-2 py-1.5 rounded-lg w-full">
                    <img src={address.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="font-medium h-5 flex items-center text-[#292929] text-sm tracking-[-0.2px] w-full">
                        <span className="block leading-[20px]">{address.address}</span>
                      </div>
                      <div className="flex flex-row gap-1 items-center">
                        <img src="/wallet-analytics/coin-icon.gif" alt="coin" className="w-4 h-4" />
                        <span className="font-semibold text-[#066eff] text-sm tracking-[-0.2px]">
                          {address.points.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {address.rank === 1 ? (
                      <img src="/wallet-analytics/medal.svg" alt="medal" className="w-7 h-7" />
                    ) : (
                      <div className="font-medium text-[#464646] text-sm tracking-[-0.2px]">#{address.rank}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpendingAverageChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState("Last 5 days");

  const chartData = [
    { day: "Mon", income: 64, expense: 32, opacity: 0.3 },
    { day: "Tue", income: 51, expense: 21, opacity: 0.3 },
    { day: "Wed", income: 93, expense: 59, opacity: 1 },
    { day: "Thu", income: 44, expense: 23, opacity: 0.3 },
    { day: "Fri", income: 48, expense: 22, opacity: 0.3 },
  ];

  return (
    <div className="h-full overflow-hidden relative rounded-xl bg-[#1e1e1e] flex-1 flex justify-center items-start">
      {/* Header */}
      <div className="flex flex-row items-start justify-between p-4 w-full">
        <div className="flex flex-col gap-1 items-start justify-start w-[177.047px]">
          <div className="flex flex-row gap-1 items-center justify-start w-full">
            <img src="/wallet-analytics/bar-chart-icon.gif" alt="chart" className="w-8 h-8" />
            <span className="font-normal text-white text-sm">Spending Average</span>
          </div>
          <div className="flex flex-row gap-3 ml-2">
            <div className="flex flex-row gap-1.5 items-center">
              <div className="h-[7.715px] w-[16.023px] bg-[#00e595] rounded-full" />
              <span className="font-normal opacity-50 text-white text-xs tracking-[0.5px]">Income</span>
            </div>
            <div className="flex flex-row gap-1.5 items-center">
              <div className="bg-[#fc2bad] h-[7.715px] rounded-[20px] w-[16.023px]" />
              <span className="font-normal opacity-50 text-white text-xs tracking-[0.5px]">Expense</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <TimeRangeDropdown timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      </div>

      {/* Chart */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-row gap-2.5 items-center justify-center pb-4 pt-0 px-3 top-[62px] w-[345px]">
        <div className="flex flex-col gap-0.5 flex-1 h-full items-start justify-center">
          <div className="flex flex-row grow items-end justify-between w-full">
            {chartData.map((data, index) => (
              <div
                key={index}
                className="flex flex-row gap-1 items-end justify-start w-[42px]"
                style={{ opacity: data.opacity }}
              >
                <div
                  className="flex-1 bg-[#00e595] min-h-px min-w-px relative rounded-[3px]"
                  style={{ height: `${data.income}px` }}
                >
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_-6px_7.8px_0px_inset_#78ff91,0px_4px_15px_0px_inset_#bbf7c6]" />
                </div>
                <div
                  className="flex-1 bg-[#ff009f] min-h-px min-w-px relative rounded-[3px]"
                  style={{ height: `${data.expense}px` }}
                >
                  <div className="absolute inset-0 pointer-events-none shadow-[0px_4px_15px_0px_inset_#fec6e9,0px_-17px_13px_0px_inset_#ff009f]" />
                </div>
              </div>
            ))}

            {/* Chart Legend */}
            <div className="absolute bg-[#0c0c0c] flex flex-col gap-4 items-start justify-center left-[189px] p-3 rounded-md top-[5px] w-28">
              <span className="font-normal opacity-50 text-white text-xs tracking-[0.5px]">Wednesday</span>
              <div className="flex flex-col gap-2 items-start">
                <div className="flex flex-row gap-1.5 items-center">
                  <div className="h-1.5 w-[16.023px] bg-[#00e595]" />
                  <span className="font-normal text-white text-sm tracking-[0.5px]">$12,565</span>
                </div>
                <div className="flex flex-row gap-1.5 items-center">
                  <div className="bg-[#fc2bad] h-1.5 rounded-[20px] w-[16.023px]" />
                  <span className="font-normal text-white text-sm tracking-[0.5px]">$5,879</span>
                </div>
              </div>
            </div>
          </div>

          {/* Day Labels */}
          <div className="flex flex-row font-medium items-end justify-between text-white text-xs text-center tracking-[-0.24px] w-full">
            {chartData.map((data, index) => (
              <div key={index} className={`h-[21.936px] w-[39.906px] ${data.opacity === 1 ? "" : "opacity-30"}`}>
                <span className="block leading-[20px]">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionHistory: React.FC<{ onTransactionClick: (transaction: Transaction) => void }> = ({
  onTransactionClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { openModal } = useModal();
  const getTypeColor = (type: string) => {
    return "text-[#48b3ff]";
  };

  return (
    <div className="bg-[#1e1e1e] flex flex-col gap-1 flex-1 items-start min-h-px min-w-px overflow-hidden rounded-lg w-full">
      {/* Header */}
      <div className="bg-[#292929] flex flex-row items-center justify-between pl-3 pr-2 py-2 w-full">
        <div aria-hidden="true" className="absolute border-[#131313] border-b inset-0 pointer-events-none" />
        <div className="flex flex-row gap-1.5 items-center">
          <div className="bg-[#121213] overflow-hidden rounded-[5px] w-5 h-5 flex items-center justify-center">
            <img src="/wallet-analytics/tx-history-icon.gif" alt="pie-chart" className="w-4 h-4" />
          </div>
          <span className="font-medium text-white text-base tracking-[-0.32px]">Transaction history</span>
        </div>

        <div className="flex flex-row gap-6 items-center">
          {/* Search Bar */}
          <div className="flex flex-row gap-2 items-center">
            <div className="bg-[#3d3d3d] flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
              <div className="flex flex-row gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Search by hash or address"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="font-medium text-sm text-[rgba(255,255,255,0.4)] bg-transparent border-none outline-none w-full"
                />
              </div>
              <div className="bg-white flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer">
                <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
              </div>
            </div>

            {/* Filter Button */}
            <div
              className="bg-[#3d3d3d] overflow-hidden rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer"
              onClick={() => openModal(MODAL_IDS.DATE_FILTER, { defaultSelected: new Date(), onSelect: () => {} })}
            >
              <img src="/wallet-analytics/setting-icon.gif" alt="filter" className="w-5 h-5" />
            </div>
          </div>

          {/* Export Button */}
          <ActionButton
            text="Export CSV"
            icon="/wallet-analytics/download-icon.svg"
            onClick={() => {}}
            type="neutral"
            className="h-9"
          />
        </div>
      </div>

      {/* Table Headers */}
      <div className="flex flex-col gap-2.5 items-start p-2 w-full">
        <div className="bg-[#0c0c0c] grid grid-cols-6 gap-2.5 h-11 items-center rounded-lg w-full">
          {["Transaction Hash", "Type", "Timestamp", "From", "To", "Value"].map((header, index) => (
            <div key={index} className="flex h-full items-center justify-center">
              <span className="font-medium text-white text-sm">{header}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-2 w-full cursor-pointer overflow-y-auto">
        {/* Transaction Rows */}
        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="grid grid-cols-6 gap-2.5 items-center px-2 py-0 rounded-lg w-full h-15 hover:bg-[#292929]"
            onClick={() => onTransactionClick(transaction)}
          >
            {/* Transaction Hash */}
            <div className="flex items-center justify-center h-full gap-2">
              <span className="font-medium text-white text-sm">{transaction.hash}</span>
              <img
                src="/copy-icon.svg"
                alt="copy"
                className="w-4 h-4 cursor-pointer"
                style={{ filter: "invert(1) brightness(50%)" }}
                onClick={e => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(transaction.hash);
                  toast.success("Copied to clipboard");
                }}
              />
            </div>

            {/* Type */}
            <div className="flex items-center justify-center h-full">
              <span className={`font-medium text-sm tracking-[-0.084px] ${getTypeColor(transaction.type)}`}>
                {transaction.type}
              </span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-center h-full">
              <span className="font-medium text-white text-sm">{transaction.timestamp}</span>
            </div>

            {/* From */}
            <div className="flex items-center justify-center h-full gap-2">
              <div className="flex h-[24.085px] items-center w-[24.085px]">
                <img src={blo(turnBechToHex(transaction.from))} alt="avatar" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-white text-sm">{transaction.from}</span>
              <img
                src="/copy-icon.svg"
                alt="copy"
                className="w-4 h-4 cursor-pointer"
                style={{ filter: "invert(1) brightness(50%)" }}
                onClick={e => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(transaction.from);
                  toast.success("Copied to clipboard");
                }}
              />
            </div>

            {/* To */}
            <div className="flex items-center justify-center h-full gap-2">
              <div className="flex h-[24.085px] items-center w-[24.085px]">
                <img src={blo(turnBechToHex(transaction.to))} alt="avatar" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-white text-sm">{transaction.to}</span>
              <img
                src="/copy-icon.svg"
                alt="copy"
                className="w-4 h-4 cursor-pointer"
                style={{ filter: "invert(1) brightness(50%)" }}
                onClick={e => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(transaction.to);
                  toast.success("Copied to clipboard");
                }}
              />
            </div>

            {/* Value */}
            <div className="flex items-center justify-center h-full gap-2">
              <img src="/token/qash.svg" alt="btc" className="w-5 h-5" />
              <span className="font-medium text-white text-sm">{transaction.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WalletAnalyticsContainer: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<"month" | "year">("year");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
    setIsAnimating(true);

    // Reset scroll position when switching to detail view
    const container = document.querySelector(".wallet-analytics-container");
    if (container) {
      container.scrollTop = 0;
    }

    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  };

  const handleBackToHistory = () => {
    setIsAnimating(true);
    setShowTransactionDetail(false);

    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setIsAnimating(false);
      setSelectedTransaction(null);
    }, ANIMATION_DURATION);
  };

  return (
    <div className="flex flex-col gap-2 items-start justify-start w-full h-full p-2 bg-black">
      {/* Top Row - Cards */}
      <div className="flex flex-row gap-[5px] h-[250px] items-start w-full">
        <GeneralStatistics timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
        <TopInteractedAddresses />
        <SpendingAverageChart />
      </div>

      {/* Bottom Row - Transaction History or Transaction Detail */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg">
        {/* Transaction History */}
        <div
          className={`transition-transform duration-[${ANIMATION_DURATION}ms] ease-in-out h-full ${
            showTransactionDetail ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="h-full overflow-y-auto">
            <TransactionHistory onTransactionClick={handleTransactionClick} />
          </div>
        </div>

        {/* Transaction Detail - Slides in from right */}
        <div
          className={`absolute inset-0 transition-transform duration-[${ANIMATION_DURATION}ms] ease-in-out h-full ${
            showTransactionDetail ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {(showTransactionDetail || isAnimating) && selectedTransaction && (
            <div className="h-full overflow-y-auto">
              <TransactionDetail transaction={selectedTransaction} onBack={handleBackToHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
