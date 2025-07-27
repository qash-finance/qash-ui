"use client";
import * as React from "react";
import { TransactionItem } from "./TransactionItem";
import { EmptyBatch } from "./EmptyBatch";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "../Common/ActionButton";
import { useBatchTransactions } from "@/services/store/batchTransactions";

interface BatchTransactionContainerProps {
  isLoading: boolean;
  onRemoveTransaction?: (id: string) => void;
  onConfirm?: () => void;
}

export function BatchTransactionContainer({
  isLoading,
  onRemoveTransaction,
  onConfirm,
}: BatchTransactionContainerProps) {
  // **************** Custom Hooks *******************
  const { handleConnect, walletAddress, isConnected } = useWalletConnect();
  const { getBatchTransactions, removeTransaction } = useBatchTransactions();

  const transactions = walletAddress ? getBatchTransactions(walletAddress) : [];

  const handleRemoveTransaction = (transactionId: string) => {
    if (!walletAddress) return;
    removeTransaction(walletAddress, transactionId);
    onRemoveTransaction?.(transactionId);
  };

  return (
    <main className="flex flex-col gap-1 items-start p-2 rounded-2xl bg-zinc-900 w-[600px] h-[600px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[503px] max-sm:p-1.5 max-sm:w-full max-sm:rounded-2xl">
      <div className="flex flex-col gap-1.5 items-center self-stretch rounded-2xl bg-zinc-800 h-full">
        {/* Header */}
        <header className="box-border flex relative justify-between items-center py-2.5 pr-4 pl-4 w-full bg-[#3D3D3D] max-md:flex-col max-md:gap-2.5 max-md:p-4 max-sm:p-3 rounded-t-2xl">
          <h1 className="leading-4 text-white capitalize max-md:text-center text-xl">Total Batch</h1>
          <div className="flex gap-1 justify-center items-center py-1.5 pr-3 pl-1.5 bg-[#7C7C7C] rounded-xl max-md:self-center">
            <div className="flex gap-1 justify-center items-center px-2  rounded-xl bg-neutral-950">
              <span className="text-xs tracking-tight leading-5 text-white">
                {transactions.length.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-base font-medium tracking-tight leading-5 text-white">Transactions</span>
          </div>
        </header>

        {/* Transaction list - Now with fixed height and scrollable */}
        <div className="flex-1 w-full overflow-hidden">
          {transactions.length > 0 ? (
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
          ) : (
            <div className="h-full">
              <EmptyBatch />
            </div>
          )}
        </div>

        {/* Footer */}
        {isConnected ? (
          <footer className="flex gap-2 items-start self-stretch p-2 bg-zinc-800 rounded-b-2xl">
            <ActionButton
              text="Confirm & Sign"
              buttonType="submit"
              className="w-full h-10"
              onClick={onConfirm}
              disabled={transactions.length === 0 || isLoading}
            />
          </footer>
        ) : (
          <div className="relative w-full p-2 bg-zinc-800 rounded-b-2xl">
            <ActionButton text="Connect Wallet" buttonType="submit" className="w-full h-10" onClick={handleConnect} />
          </div>
        )}
      </div>
    </main>
  );
}

export default BatchTransactionContainer;
