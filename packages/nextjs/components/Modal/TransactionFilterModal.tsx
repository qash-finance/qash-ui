"use client";
import React, { useEffect, useState } from "react";
import { TransactionFilterModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { formatAddress } from "@/services/utils/miden/address";
import { QASH_TOKEN_DECIMALS, QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { useAccount } from "@/hooks/web3/useAccount";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import toast from "react-hot-toast";

export function TransactionFilterModal({ isOpen, onClose, zIndex, hash }: ModalProp<TransactionFilterModalProps>) {
  const { accountId } = useAccount();
  const transactions = useTransactionStore(state => state.transactions);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  useEffect(() => {
    if (hash && transactions.length > 0) {
      const filtered = transactions.filter(transaction => {
        const hashLower = hash.toLowerCase();

        // Priority order: id, sender, recipient
        if (transaction.id.toLowerCase().includes(hashLower)) return true;
        if (transaction.sender.toLowerCase().includes(hashLower)) return true;
        if (transaction.recipient.toLowerCase().includes(hashLower)) return true;

        return false;
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [hash, transactions, isOpen]);

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

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Filter"
      icon="/wallet-analytics/tx-history-icon.gif"
      zIndex={zIndex}
    >
      <div className="bg-[#1e1e1e] flex flex-col gap-1 flex-1 items-start min-h-px min-w-px overflow-hidden rounded-b-lg w-[900px]">
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

        <div className="px-2 w-full overflow-y-auto max-h-96">
          {/* Transaction Rows */}
          {filteredTransactions.map((transaction, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2.5 items-center px-2 py-0 rounded-lg w-full h-15 hover:bg-[#292929]"
            >
              {/* Transaction Hash */}
              <div className="col-span-2 flex items-center justify-center h-full gap-2">
                <span className="font-medium text-white text-sm">{formatAddress(transaction.id)}</span>
                <img
                  src="/copy-icon.svg"
                  alt="copy"
                  className="w-4 h-4 cursor-pointer"
                  style={{ filter: "invert(1) brightness(50%)" }}
                  onClick={() => {
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
                    onClick={() => {
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
                    onClick={() => {
                      navigator.clipboard.writeText(transaction.recipient);
                      toast.success("Copied to clipboard");
                    }}
                  />
                )}
              </div>

              {/* Value */}
              <div className="col-span-1 flex items-center justify-center h-full gap-2">
                <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
                <span className="font-medium text-white text-sm">
                  {Number(transaction.amount) / 10 ** QASH_TOKEN_DECIMALS}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}

export default TransactionFilterModal;
