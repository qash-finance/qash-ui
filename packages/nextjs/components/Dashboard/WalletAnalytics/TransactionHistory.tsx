"use client";
import { useModal } from "@/contexts/ModalManagerProvider";
import React, { useState } from "react";
import { DateFilterModalProps, MODAL_IDS, TransactionFilterModalProps } from "@/types/modal";
import { DateRange } from "react-day-picker";
import { ActionButton } from "@/components/Common/ActionButton";
import toast from "react-hot-toast";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { UITransaction } from "@/services/store/transaction";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { formatAddress } from "@/services/utils/miden/address";
import { QASH_TOKEN_DECIMALS } from "@/services/utils/constant";
import { useAccount } from "@/hooks/web3/useAccount";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";

const TransactionHistory = ({ onTransactionClick }: { onTransactionClick: (transaction: UITransaction) => void }) => {
  const { accountId } = useAccount();
  const transactions = useTransactionStore(state => state.transactions);
  const [searchQuery, setSearchQuery] = useState("");
  const { openModal } = useModal();
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
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      openModal<TransactionFilterModalProps>(MODAL_IDS.TRANSACTION_FILTER, {
                        hash: searchQuery,
                      });
                      setSearchQuery("");
                    }
                  }}
                />
              </div>
              <div
                className="bg-white flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
                onClick={() => {
                  openModal<TransactionFilterModalProps>(MODAL_IDS.TRANSACTION_FILTER, {
                    hash: searchQuery,
                  });
                  setSearchQuery("");
                }}
              >
                <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
              </div>
            </div>

            {/* Filter Button */}
            <div
              className="bg-[#3d3d3d] overflow-hidden rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer"
              onClick={() =>
                openModal<DateFilterModalProps>(MODAL_IDS.DATE_FILTER, {
                  onSelect: (date: DateRange | undefined) => {
                    console.log(date);
                  },
                })
              }
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

      <div className="px-2 w-full cursor-pointer overflow-y-auto">
        {/* Transaction Rows */}
        {transactions.map((transaction, index) => (
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
            <div className="col-span-1 flex items-center justify-center h-full gap-2">
              <img src="/token/qash.svg" alt="btc" className="w-5 h-5" />
              <span className="font-medium text-white text-sm">
                {Number(transaction.amount) / 10 ** QASH_TOKEN_DECIMALS}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
