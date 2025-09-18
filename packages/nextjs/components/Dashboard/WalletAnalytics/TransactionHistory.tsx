"use client";
import { useModal } from "@/contexts/ModalManagerProvider";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DateFilterModalProps, MODAL_IDS } from "@/types/modal";
import { DateRange } from "react-day-picker";
import { ActionButton } from "@/components/Common/ActionButton";
import toast from "react-hot-toast";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { UITransaction } from "@/services/store/transaction";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { formatAddress } from "@/services/utils/miden/address";
import { QASH_TOKEN_DECIMALS } from "@/services/utils/constant";
import { useAccount } from "@/hooks/web3/useAccount";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";

type SearchFormData = {
  searchQuery: string;
};

const TransactionHistory = ({ onTransactionClick }: { onTransactionClick: (transaction: UITransaction) => void }) => {
  const { accountId, assets } = useAccount();
  const transactions = useTransactionStore(state => state.transactions);
  const blockNumber = useMidenSdkStore(state => state.blockNum);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { openModal } = useModal();

  const { register, handleSubmit, setValue } = useForm<SearchFormData>({
    defaultValues: {
      searchQuery: "",
    },
  });

  // Filter transactions by date range and search query
  const processedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply date filter if date range is selected and blockNumber is available
    if (selectedDateRange?.from && selectedDateRange?.to && blockNumber) {
      const secondsPerDay = 24 * 60 * 60;
      const blocksPerDay = secondsPerDay / 5; // 5-second block time
      const currentDate = new Date();

      // Use the same date calculation logic as the chart
      // Convert selected dates to "days ago" from current date
      const startDate = selectedDateRange.from;
      const endDate = selectedDateRange.to;

      // Calculate how many days ago each date is from current date
      const daysAgoStartDate = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysAgoEndDate = Math.floor((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate block numbers using the same logic as the chart
      // For each day, calculate the block range
      const startBlockNumber = blockNumber - Math.floor(blocksPerDay * (daysAgoStartDate + 1));
      const endBlockNumber = blockNumber - Math.floor(blocksPerDay * daysAgoEndDate);

      filtered = filtered.filter(transaction => {
        const txBlockNumber = parseInt(transaction.blockNumber);
        const isInRange = txBlockNumber >= startBlockNumber && txBlockNumber <= endBlockNumber;

        return isInRange;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => {
        if (transaction.id.toLowerCase().includes(queryLower)) return true;
        if (transaction.sender.toLowerCase().includes(queryLower)) return true;
        if (transaction.recipient.toLowerCase().includes(queryLower)) return true;
        return false;
      });
    }

    return filtered;
  }, [transactions, selectedDateRange, searchQuery, blockNumber]);

  // Update filteredTransactions when processedTransactions changes
  useEffect(() => {
    setFilteredTransactions(processedTransactions);
  }, [processedTransactions]);

  const getTypeColor = (type: string) => {
    return "text-[#48b3ff]";
  };

  const renderSender = (sender: string) => {
    if (sender === accountId) {
      return "You";
    } else if (sender === QASH_TOKEN_ADDRESS) {
      return "QASH Faucet";
    } else {
      return `${formatAddress(sender)}`;
    }
  };

  const renderValue = (transaction: UITransaction) => {
    // Get unique asset IDs from the transaction
    const uniqueAssetIds = [...new Set(transaction.assets.map(asset => asset.assetId))];
    const firstAssetId = uniqueAssetIds[0];

    // Find all matching assets and calculate total values
    const assetValues = uniqueAssetIds
      .map(assetId => {
        const asset = assets.find(asset => asset.faucetId === assetId);
        if (asset) {
          // Calculate the total amount for this asset type in the transaction
          const assetTransactions = transaction.assets.filter(txAsset => txAsset.assetId === assetId);
          const totalAmount = assetTransactions.reduce((sum, txAsset) => sum + txAsset.amount, BigInt(0));
          const formattedAmount = Number(totalAmount) / Math.pow(10, asset.metadata.decimals);
          // Remove trailing zeros for cleaner display
          const cleanAmount = parseFloat(formattedAmount.toFixed(asset.metadata.decimals));
          return `${cleanAmount}`;
        }
        return null;
      })
      .filter(Boolean);

    const displayValue =
      assetValues.length > 0 ? assetValues.join(", ") : `${Number(transaction.assets[0]?.amount || BigInt(0))} (raw)`;

    // Return JSX with icon and value
    return (
      <>
        {firstAssetId === QASH_TOKEN_ADDRESS ? (
          <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
        ) : (
          <img src={blo(turnBechToHex(firstAssetId))} alt="asset" className="w-5 h-5 rounded-full" />
        )}
        <span className="font-medium text-white text-sm">{displayValue}</span>
      </>
    );
  };

  const onSubmit = (data: SearchFormData) => {
    setSearchQuery(data.searchQuery);
  };

  const handleDateRangeSelect = (dateRange: DateRange | undefined) => {
    setSelectedDateRange(dateRange);
    if (dateRange?.from && dateRange?.to) {
      toast.success(
        `Filter applied: ${dateRange.from.toLocaleDateString("en-GB")} - ${dateRange.to.toLocaleDateString("en-GB")}`,
      );
    }
  };

  const clearDateFilter = () => {
    setSelectedDateRange({ from: undefined, to: undefined });
    toast.success("Date filter cleared");
  };

  return (
    <div
      className={`bg-[#1e1e1e] flex flex-col gap-1 flex-1 items-center min-h-px min-w-px overflow-hidden rounded-lg w-full pb-2 ${
        transactions.length === 0 ? "h-full" : ""
      }`}
    >
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-2 items-center">
              <div className="bg-[#3d3d3d] flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
                <div className="flex flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Search by hash or address"
                    {...register("searchQuery", {
                      onChange: e => {
                        const value = e.target.value;
                        // Start filtering immediately as user types
                        setSearchQuery(value);
                      },
                    })}
                    className="font-medium text-sm text-[rgba(255,255,255,0.4)] bg-transparent border-none outline-none w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
                >
                  <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Filter Button */}
            <div className="flex items-center gap-2">
              <div
                className={`overflow-hidden rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer bg-[#3d3d3d]`}
                onClick={() =>
                  openModal<DateFilterModalProps>(MODAL_IDS.DATE_FILTER, {
                    defaultSelected: selectedDateRange,
                    onSelect: handleDateRangeSelect,
                  })
                }
              >
                <img src="/wallet-analytics/setting-icon.gif" alt="filter" className="w-5 h-5" />
              </div>

              {/* Clear Filter Button - only show when date filter is active */}
              {selectedDateRange?.from && selectedDateRange?.to && (
                <button
                  onClick={clearDateFilter}
                  className=" text-[#ff6b6b] hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Export Button */}
          <ActionButton
            text="Export CSV"
            icon="/wallet-analytics/download-icon.svg"
            onClick={() => {}}
            type="neutral"
            className="h-9 !cursor-not-allowed"
          />
        </div>
      </div>

      {/* Table Headers */}
      <div className="flex flex-col gap-2.5 items-start p-2 w-full">
        <div className="bg-[#0c0c0c] grid grid-cols-12 gap-2.5 h-11 items-center rounded-lg w-full">
          <div className="col-span-2 flex h-full items-center justify-center">
            <span className="font-medium text-white text-sm">Transaction Hash</span>
          </div>
          <div className="col-span-1 flex h-full items-center justify-center">
            <span className="font-medium text-white text-sm">Type</span>
          </div>
          <div className="col-span-2 flex h-full items-center justify-center">
            <span className="font-medium text-white text-sm">Block</span>
          </div>
          <div className="col-span-3 flex h-full items-center justify-center">
            <span className="font-medium text-white text-sm">From</span>
          </div>
          <div className="col-span-3 flex h-full items-center justify-center">
            <span className="font-medium text-white text-sm">To</span>
          </div>
          <div className="col-span-1 flex h-full items-center justify-center">
            <span className="font-medium text-white text-sm">Value</span>
          </div>
        </div>
      </div>

      <div className="px-2 w-full cursor-pointer overflow-y-auto h-full">
        {/* Transaction Rows */}
        {filteredTransactions.map((transaction, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2.5 items-center px-2 py-0 rounded-lg w-full h-15 hover:bg-[#292929]"
            onClick={() => onTransactionClick(transaction)}
          >
            {/* Transaction Hash */}
            <div className="col-span-2 flex items-center justify-center h-full gap-2">
              <span className="font-medium text-white text-sm">{formatAddress(transaction.id)}</span>
              <img
                src="/copy-icon.svg"
                alt="copy"
                className="w-4 h-4 cursor-pointer"
                style={{ filter: "invert(1) brightness(50%)" }}
                onClick={e => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(transaction.id);
                  toast.success("Copied to clipboard");
                }}
              />
            </div>

            {/* Type */}
            <div className="col-span-1 flex items-center justify-center h-full">
              <span className={`font-medium text-sm tracking-[-0.084px] ${getTypeColor(transaction.type)}`}>
                {transaction.type}
              </span>
            </div>

            {/* Timestamp */}
            <div className="col-span-2 flex items-center justify-center h-full">
              <span className="font-medium text-white text-sm">{transaction.blockNumber}</span>
            </div>

            {/* From */}
            <div className="col-span-3 flex items-center justify-center h-full gap-2">
              <div className="flex h-[24.085px] items-center w-[24.085px]">
                {transaction.sender === QASH_TOKEN_ADDRESS ? (
                  <img src="/token/qash.svg" alt="avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <img src={blo(turnBechToHex(transaction.sender))} alt="avatar" className="w-6 h-6 rounded-full" />
                )}
              </div>
              <span className="font-medium text-white text-sm">{renderSender(transaction.sender)}</span>
              {transaction.sender !== accountId && (
                <img
                  src="/copy-icon.svg"
                  alt="copy"
                  className="w-4 h-4 cursor-pointer"
                  style={{ filter: "invert(1) brightness(50%)" }}
                  onClick={e => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(transaction.sender);
                    toast.success("Copied to clipboard");
                  }}
                />
              )}
            </div>

            {/* To */}
            <div className="col-span-3 flex items-center justify-center h-full gap-2">
              <div className="flex h-[24.085px] items-center w-[24.085px]">
                <img src={blo(turnBechToHex(transaction.recipient))} alt="avatar" className="w-6 h-6 rounded-full" />
              </div>
              <span className="font-medium text-white text-sm">
                {transaction.recipient === accountId ? "You" : `${formatAddress(transaction.recipient)} (Note)`}
              </span>
              {transaction.recipient !== accountId && (
                <img
                  src="/copy-icon.svg"
                  alt="copy"
                  className="w-4 h-4 cursor-pointer"
                  style={{ filter: "invert(1) brightness(50%)" }}
                  onClick={e => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(transaction.recipient);
                    toast.success("Copied to clipboard");
                  }}
                />
              )}
            </div>

            {/* Value */}
            <div className="col-span-1 flex items-center justify-center h-full gap-2">{renderValue(transaction)}</div>
          </div>
        ))}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <img src="/schedule-payment/empty-schedule-payment-icon.svg" alt="Empty State" className="scale-100" />
            <span className="text-white">You haven’t created any transactions yet.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
