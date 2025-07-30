"use client";
import React from "react";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { TransactionItem } from "../Batch/TransactionItem";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useBatchTransactions } from "@/services/store/batchTransactions";

export function BatchTransactionsModal({ isOpen, onClose }: ModalProp<SelectTokenModalProps>) {
  const { getBatchTransactions, removeTransaction } = useBatchTransactions();
  const { handleConnect, walletAddress, isConnected } = useWalletConnect();

  const transactions = walletAddress ? getBatchTransactions(walletAddress) : [];

  const handleRemoveTransaction = (transactionId: string) => {
    if (!walletAddress) return;
    removeTransaction(walletAddress, transactionId);
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Back to batch transaction overview"
      icon="/arrow/chevron-left.svg"
    >
      <div className="flex flex-col gap-1 items-center self-stretch rounded-2xl h-full w-[600px]">
        {transactions.length > 0 && (
          <div className="flex-1 w-full overflow-hidden">
            <section className="flex flex-col gap-1.5 items-start self-stretch px-1.5 py-0 max-sm:px-1 max-sm:py-0 h-full overflow-y-auto">
              {transactions.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  amount={`${transaction.amount} ${transaction.tokenMetadata?.symbol}`}
                  recipient={transaction.recipient}
                  isPrivate={transaction.isPrivate}
                  isAddress={true}
                  onRemove={() => handleRemoveTransaction(transaction.id)}
                />
              ))}
            </section>
          </div>
        )}

        <div className="box-border flex relative justify-between items-center py-2.5 pr-4 pl-4 w-full bg-[#3D3D3D] max-md:flex-col max-md:gap-2.5 max-md:p-4 max-sm:p-3 rounded-b-2xl">
          <h1 className="leading-4 text-white capitalize max-md:text-center text-xl">Total Batch</h1>
          <div
            className={`flex gap-1 justify-center items-center py-1.5 pr-3 pl-1.5 rounded-xl max-md:self-center`}
            style={{
              background: transactions.length > 0 ? "#066EFF" : "#7C7C7C",
            }}
          >
            <div className="flex gap-1 justify-center items-center px-2  rounded-xl bg-neutral-950">
              <span className="text-xs tracking-tight leading-5 text-white">
                {transactions.length.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-base font-medium tracking-tight leading-5 text-white">Transactions</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default BatchTransactionsModal;
