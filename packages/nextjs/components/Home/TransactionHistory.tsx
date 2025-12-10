"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useModal } from "@/contexts/ModalManagerProvider";
import { DateFilterModalProps, MODAL_IDS } from "@/types/modal";
import { DateRange } from "react-day-picker";
import { ActionButton } from "@/components/Common/ActionButton";
import { Table } from "@/components/Common/Table";
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
import { BaseContainer } from "../Common/BaseContainer";
import { SecondaryButton } from "../Common/SecondaryButton";

type SearchFormData = {
  searchQuery: string;
};

export const TransactionHistory = ({
  onTransactionClick,
}: {
  onTransactionClick?: (transaction: UITransaction) => void;
}) => {
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
      <div className="flex items-center gap-2 justify-center">
        {firstAssetId === QASH_TOKEN_ADDRESS ? (
          <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
        ) : (
          <img src={blo(turnBechToHex(firstAssetId))} alt="asset" className="w-5 h-5 rounded-full" />
        )}
        <span className="font-medium text-sm">{displayValue}</span>
      </div>
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

  const formatDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) {
      return "Filter";
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <span>
        {" "}
        <span className="text-primary-blue font-semibold">
          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
        </span>
      </span>
    );
  };

  // Prepare table data
  const tableHeaders = ["Transaction Hash", "Type", "Block", "From", "To", "Value"];

  const tableData = filteredTransactions.map(transaction => ({
    "Transaction Hash": (
      <div className="flex items-center gap-2 justify-center">
        <span className="font-medium text-sm">{formatAddress(transaction.id)}</span>
        <img
          src="/misc/copy-icon.svg"
          alt="copy"
          className="w-4 h-4 cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            navigator.clipboard.writeText(transaction.id);
            toast.success("Copied to clipboard");
          }}
        />
      </div>
    ),
    Type: (
      <span className={`font-medium text-sm tracking-[-0.084px] ${getTypeColor(transaction.type)}`}>
        {transaction.type}
      </span>
    ),
    Block: <span className="font-medium text-sm">{transaction.blockNumber}</span>,
    From: (
      <div className="flex items-center gap-2 justify-center">
        <div className="flex h-[24.085px] items-center w-[24.085px]">
          {transaction.sender === QASH_TOKEN_ADDRESS ? (
            <img src="/token/qash.svg" alt="avatar" className="w-6 h-6 rounded-full" />
          ) : (
            <img src={blo(turnBechToHex(transaction.sender))} alt="avatar" className="w-6 h-6 rounded-full" />
          )}
        </div>
        <span className="font-medium text-sm">{renderSender(transaction.sender)}</span>
        {transaction.sender !== accountId && (
          <img
            src="/misc/copy-icon.svg"
            alt="copy"
            className="w-4 h-4 cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              navigator.clipboard.writeText(transaction.sender);
              toast.success("Copied to clipboard");
            }}
          />
        )}
      </div>
    ),
    To: (
      <div className="flex items-center gap-2 justify-center">
        <div className="flex h-[24.085px] items-center w-[24.085px]">
          <img src={blo(turnBechToHex(transaction.recipient))} alt="avatar" className="w-6 h-6 rounded-full" />
        </div>
        <span className="font-medium text-sm">
          {transaction.recipient === accountId ? "You" : `${formatAddress(transaction.recipient)} (Note)`}
        </span>
        {transaction.recipient !== accountId && (
          <img
            src="/misc/copy-icon.svg"
            alt="copy"
            className="w-4 h-4 cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              navigator.clipboard.writeText(transaction.recipient);
              toast.success("Copied to clipboard");
            }}
          />
        )}
      </div>
    ),
    Value: renderValue(transaction),
  }));

  return (
    <div className="w-full">
      <BaseContainer
        header={
          <div className="flex w-full justify-between items-center p-5">
            <span className="text-text-primary text-xl leading-none">Transaction History</span>
          </div>
        }
      >
        <div className="pb-5 h-[570px] overflow-y-auto">
          {/* Search and Filter Controls */}
          <div className="flex flex-row gap-4 items-center w-full justify-between p-3 bg-background rounded-t-3xl">
            {/* Search Bar */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row gap-2 items-center">
              <div className="bg-app-background border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
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
                    className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
                >
                  <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
                </button>
              </div>
            </form>
            <div className="flex flex-row gap-2 items-center">
              {/* Filter Button */}
              <div className="flex items-center gap-2">
                <SecondaryButton
                  text="Filter"
                  icon="/wallet-analytics/setting-icon.gif"
                  onClick={() =>
                    openModal<DateFilterModalProps>(MODAL_IDS.DATE_FILTER, {
                      defaultSelected: selectedDateRange,
                      onSelect: handleDateRangeSelect,
                    })
                  }
                  iconPosition="left"
                  variant="light"
                  buttonClassName={`px-2 ${selectedDateRange?.from && selectedDateRange?.to ? "outline-2 outline-primary-blue" : ""}`}
                  closeIcon={selectedDateRange?.from && selectedDateRange?.to ? true : false}
                  onCloseIconClick={clearDateFilter}
                />
              </div>
              {/* Export Button */}
              <SecondaryButton
                text="Export CSV"
                icon="/misc/download-icon.svg"
                onClick={() => {}}
                variant="light"
                iconPosition="left"
                buttonClassName="px-2"
                disabled={true}
              />
            </div>
          </div>
          <Table
            headerClassName="!rounded-none"
            headers={tableHeaders}
            data={tableData}
            columnWidths={{
              "0": "10%",
            }}
            rowClassName={(rowData, index) =>
              onTransactionClick ? "cursor-pointer hover:bg-[var(--color-table-row-background-hover)]" : ""
            }
          />
        </div>
      </BaseContainer>
    </div>
  );
};
