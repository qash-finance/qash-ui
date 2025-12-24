"use client";
import React, { useEffect, useState, useRef } from "react";
import { InteractAccountTransactionModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { formatAddress } from "@/services/utils/miden/address";
import { QASH_TOKEN_DECIMALS, QASH_TOKEN_ADDRESS, NODE_ENDPOINT } from "@/services/utils/constant";
import { useAccount } from "@/hooks/web3/useAccount";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import toast from "react-hot-toast";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { useTransactionStore } from "@/contexts/TransactionProvider";

export function InteractAccountTransactionModal({
  isOpen,
  onClose,
  zIndex,
  address,
}: ModalProp<InteractAccountTransactionModalProps>) {
  const clientRef = useRef<any | null>(null);
  const [clientInitialized, setClientInitialized] = useState(false);
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  // const client = useMidenSdkStore(state => state.client);

  // const transactions = useTransactionStore(state => state.transactions);

  // Filter for transactions FROM this specific address TO the current user
  // Only show transactions where:
  // 1. transaction.type === "Incoming" (received funds by current user)
  // 2. transaction.sender === address (sent FROM this address)
  // 3. transaction.recipient === current user's address
  // const { accountId } = useAccount();
  // const incomingTransactions = transactions.filter(
  //   transaction =>
  //     transaction.type === "Incoming" && transaction.sender === address && transaction.recipient === accountId,
  // );

  const getTypeColor = (type: string) => {
    return "text-[#48b3ff]";
  };

  const renderSender = (sender: string) => {
    if (sender === QASH_TOKEN_ADDRESS) {
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
      title={`Transactions from ${formatAddress(address)} (0 transactions)`}
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
          {localLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-white">Loading transactions...</span>
            </div>
          ) : [].length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-white">No incoming transactions found for this address</span>
            </div>
          ) : (
            /* Transaction Rows */
            [].map((transaction: any, index: number) => (
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
                  {/* {transaction.sender !== accountId && (
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
                  )} */}
                </div>

                {/* To */}
                <div className="col-span-3 flex items-center justify-center h-full gap-2">
                  <div className="flex h-[24.085px] items-center w-[24.085px]">
                    <img
                      src={blo(turnBechToHex(transaction.recipient))}
                      alt="avatar"
                      className="w-6 h-6 rounded-full"
                    />
                  </div>
                  <span className="font-medium text-white text-sm">You</span>
                  {/* {transaction.recipient !== accountId && (
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
                  )} */}
                </div>

                {/* Value */}
                <div className="col-span-1 flex items-center justify-center h-full gap-2">
                  <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
                  <span className="font-medium text-white text-sm">
                    {transaction.assets && transaction.assets.length > 0
                      ? Number(transaction.assets[0].amount) / 10 ** QASH_TOKEN_DECIMALS
                      : "0"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
}

export default InteractAccountTransactionModal;
