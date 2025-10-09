"use client";
import React, { useMemo } from "react";
import { BatchTransactionsModalProps, MODAL_IDS } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { TransactionItem } from "../../Batch/TransactionItem";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useBatchTransactions } from "@/services/store/batchTransactions";
// import BaseModal from "./BatchTransactionOverview/BaseModal";
import BaseModal from "../BaseModal";

export function BatchTransactionsModal({ isOpen, onClose }: ModalProp<BatchTransactionsModalProps>) {
  const { removeTransaction } = useBatchTransactions();
  const { walletAddress } = useWalletConnect();
  const { openModal } = useModal();

  // Subscribe directly to the store state for automatic reactivity
  const allTransactions = useBatchTransactions(state => state.transactions);
  const transactions = useMemo(() => {
    if (walletAddress && allTransactions[walletAddress]) {
      return allTransactions[walletAddress].map(tx => ({
        ...tx,
        createdAt: new Date(tx.createdAt),
      }));
    }
    return [];
  }, [walletAddress, allTransactions]);

  const handleRemoveTransaction = (transactionId: string) => {
    if (!walletAddress) return;
    removeTransaction(walletAddress, transactionId);
  };

  const handleBackToOverview = () => {
    onClose();
    // Reopen the batch transaction overview modal with current transactions
    openModal(MODAL_IDS.BATCH_TRANSACTION_OVERVIEW, {
      sender: walletAddress,
      transactions: transactions,
    });
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Back to batch transaction overview"
      icon="/arrow/chevron-left.svg"
    >
      <div className="bg-[#1E1E1E] py-2 flex flex-col gap-1 items-center self-stretch h-full w-[600px]">
        <div className="flex-1 w-full overflow-hidden rounded-xl">
          {transactions.length === 0 ? (
            <div className="h-[400px]">{/* <EmptyBatch /> */}</div>
          ) : (
            <section className="h-[400px] flex flex-col gap-1.5 items-start self-stretch px-1.5 overflow-y-auto bg-[#292929] pt-2">
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
          )}
        </div>
      </div>

      <div className="box-border flex relative justify-between items-center py-2.5 pr-4 pl-4 w-full bg-[#292929] max-md:flex-col max-md:gap-2.5 max-md:p-4 max-sm:p-3 rounded-b-2xl">
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
          <span className="text-base font-medium tracking-tight leading-5 text-white">
            {transactions.length === 1 ? "Transaction" : "Transactions"}
          </span>
        </div>
      </div>
    </BaseModal>
  );
}

export default BatchTransactionsModal;
