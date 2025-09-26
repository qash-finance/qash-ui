"use client";
import * as React from "react";
import { TransactionItem } from "./TransactionItem";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "../Common/ActionButton";
import { BatchTransaction, useBatchTransactions } from "@/services/store/batchTransactions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

interface BatchTransactionContainerProps {
  isLoading: boolean;
  onRemoveTransaction?: (id: string) => void;
  onConfirm?: () => void;
}

export const EmptyBatch = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full h-full bg-[#292929] rounded-b-2xl mb-3">
      <img src="/sidebar/gift.gif" alt="empty-batch" className="w-16 h-16 grayscale" />
      <span className="text-base leading-5 text-[#93989F]">No transactions found</span>
    </div>
  );
};

export function BatchTransactionContainer({
  isLoading,
  onRemoveTransaction,
  onConfirm,
}: BatchTransactionContainerProps) {
  // **************** Custom Hooks *******************
  const { walletAddress, isConnected } = useWalletConnect();
  const { removeTransaction } = useBatchTransactions();
  const { openModal } = useModal();

  // Subscribe directly to the store state for automatic reactivity
  const allTransactions = useBatchTransactions(state => state.transactions);
  const transactions = React.useMemo(() => {
    if (walletAddress && isConnected && allTransactions[walletAddress]) {
      return allTransactions[walletAddress].map(tx => ({
        ...tx,
        createdAt: new Date(tx.createdAt),
      }));
    }
    return [];
  }, [walletAddress, isConnected, allTransactions]);

  const handleRemoveTransaction = (transactionId: string) => {
    if (!walletAddress) return;
    removeTransaction(walletAddress, transactionId);
    onRemoveTransaction?.(transactionId);
  };

  return (
    <main className="flex flex-col gap-1 items-start p-2 rounded-2xl bg-[#1B1B1B] w-[600px] h-[600px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[503px] max-sm:p-1.5 max-sm:w-full max-sm:rounded-2xl">
      <div className="flex bg-[#292929] flex-col items-center self-stretch rounded-2xl h-full w-full">
        {/* Header */}
        <header className="box-border flex relative justify-between items-center py-2.5 pr-4 pl-4 w-full bg-[#3D3D3D] max-md:flex-col max-md:gap-2.5 max-md:p-4 max-sm:p-3 rounded-t-2xl">
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
        </header>

        {/* Transaction list - Now with fixed height and scrollable */}
        {transactions.length > 0 ? (
          <div className="max-h-[470px] mt-2 flex-1 w-full overflow-hidden">
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
        ) : (
          <EmptyBatch />
        )}
      </div>
      {/* Footer */}
      {isConnected ? (
        <ActionButton
          text="Confirm & Sign"
          buttonType="submit"
          className="mt-2 w-full h-10"
          onClick={onConfirm}
          loading={isLoading}
          disabled={transactions.length === 0}
        />
      ) : (
        <ActionButton
          text="Connect Wallet"
          buttonType="submit"
          className="mt-1 w-full h-10"
          onClick={() => {
            openModal(MODAL_IDS.CONNECT_WALLET);
          }}
        />
      )}
    </main>
  );
}

export default BatchTransactionContainer;
