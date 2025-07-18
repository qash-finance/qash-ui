"use client";
import * as React from "react";
import { TransactionItem } from "./TransactionItem";
import { EmptyBatch } from "./EmptyBatch";

interface Transaction {
  id: string;
  badgeType: "P2ID-R" | "P2ID";
  amount: string;
  recipient: string;
  isPrivate?: boolean;
  isAddress?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

interface BatchTransactionContainerProps {
  transactions?: Transaction[];
  onRemoveTransaction?: (id: string) => void;
  onConfirm?: () => void;
}

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    badgeType: "P2ID-R",
    amount: "37,800.45 USDT",
    recipient: "Danny Kang",
    isPrivate: true,
  },
  {
    id: "2",
    badgeType: "P2ID-R",
    amount: "0.57 BTC",
    recipient: "Alex Dang",
  },
  {
    id: "3",
    badgeType: "P2ID",
    amount: "0.57 BTC",
    recipient: "0xd...s78",
    isAddress: true,
  },
  {
    id: "4",
    badgeType: "P2ID",
    amount: "37,800.45 USDT",
    recipient: "Danny Kang",
    isPrivate: true,
  },
  {
    id: "5",
    badgeType: "P2ID-R",
    amount: "0.57 BTC",
    recipient: "Jullie",
  },
  {
    id: "6",
    badgeType: "P2ID",
    amount: "37,800.45 USDT",
    recipient: "0xd...s78",
    isAddress: true,
    isPrivate: true,
  },
  {
    id: "7",
    badgeType: "P2ID-R",
    amount: "37,800.45 ETH",
    recipient: "Danny Kang",
    isPrivate: true,
    hasError: true,
    errorMessage: "Insufficient Balance",
  },
];

export function BatchTransactionContainer({
  transactions = defaultTransactions,
  onRemoveTransaction,
  onConfirm,
}: BatchTransactionContainerProps) {
  return (
    <main className="flex flex-col gap-1 items-start p-2 rounded-2xl bg-zinc-900 w-[600px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[503px] max-sm:p-1.5 max-sm:w-full max-sm:rounded-2xl">
      <div className="flex flex-col gap-1.5 items-center self-stretch rounded-2xl bg-zinc-800">
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

        {/* Transaction list */}
        {/* <section className="flex flex-col gap-1.5 items-start self-stretch px-1.5 py-0 max-sm:px-1 max-sm:py-0">
          {transactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              badgeType={transaction.badgeType}
              amount={transaction.amount}
              recipient={transaction.recipient}
              isPrivate={transaction.isPrivate}
              isAddress={transaction.isAddress}
              hasError={transaction.hasError}
              errorMessage={transaction.errorMessage}
              onRemove={() => onRemoveTransaction?.(transaction.id)}
            />
          ))}
        </section> */}
        <EmptyBatch />
      </div>

      {/* Footer */}
      <footer className="flex gap-2 items-start self-stretch pt-2">
        <button
          className="flex gap-1.5 justify-center items-center px-4 pt-3 pb-3.5 bg-blue-500 rounded-xl shadow flex-[1_0_0] max-sm:px-4 max-sm:pt-3.5 max-sm:pb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onConfirm}
          disabled={false}
        >
          <span className="text-base font-medium tracking-normal leading-4 text-white">Confirm &amp; Sign</span>
        </button>
      </footer>
    </main>
  );
}

export default BatchTransactionContainer;
