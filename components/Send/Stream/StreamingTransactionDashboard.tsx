"use client";

import React from "react";

import { TransactionRow } from "./TransactionRow";

interface Transaction {
  id: string;
  timeRemaining: string;
  rate: string;
  currentAmount: string;
  totalAmount: string;
  toAddress: string;
  progressPercentage: number;
}

interface StreamingTransactionDashboardProps {
  title?: string;
  description?: string;
  transactions?: Transaction[];
  onCancelTransaction?: (transactionId: string) => void;
}

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    timeRemaining: "29D:23H:59M:59",
    rate: "0.0001",
    currentAmount: "20,000",
    totalAmount: "120,000",
    toAddress: "0xd..ajs3",
    progressPercentage: 15,
  },
  {
    id: "2",
    timeRemaining: "17D:21H:30M:08",
    rate: "0.0001",
    currentAmount: "90,000",
    totalAmount: "120,000",
    toAddress: "0xd..ajs3",
    progressPercentage: 63,
  },
  {
    id: "3",
    timeRemaining: "2D:21H:30M:08",
    rate: "0.0001",
    currentAmount: "90,000",
    totalAmount: "120,000",
    toAddress: "0xd..ajs3",
    progressPercentage: 63,
  },
  {
    id: "4",
    timeRemaining: "17D:21H:30M:08",
    rate: "0.0001",
    currentAmount: "90,000",
    totalAmount: "120,000",
    toAddress: "0xd..ajs3",
    progressPercentage: 63,
  },
  {
    id: "5",
    timeRemaining: "2D:21H:30M:08",
    rate: "0.0001",
    currentAmount: "90,000",
    totalAmount: "120,000",
    toAddress: "0xd..ajs3",
    progressPercentage: 63,
  },
  {
    id: "6",
    timeRemaining: "29D:23H:59M:59",
    rate: "0.0001",
    currentAmount: "20,000",
    totalAmount: "120,000",
    toAddress: "0xd..ajs3",
    progressPercentage: 15,
  },
];

export const StreamingTransactionDashboard: React.FC<StreamingTransactionDashboardProps> = ({
  title = "Streaming transaction",
  description = "This is a list of requests you have accepted.",
  transactions = defaultTransactions,
  onCancelTransaction,
}) => {
  const handleCancelTransaction = (transactionId: string) => {
    if (onCancelTransaction) {
      onCancelTransaction(transactionId);
    }
  };

  return (
    <section className="overflow-hidden self-stretch p-5 rounded-xl bg-stone-900">
      <header className="flex flex-col justify-center w-full">
        <h1 className="self-start text-lg font-medium leading-none text-center text-white">{title}</h1>
        <p className="mt-2 text-base tracking-tight leading-none text-neutral-500">{description}</p>
      </header>
      <div className="mt-3.5 w-full max-md:max-w-full">
        {transactions.map((transaction, index) => (
          <div key={transaction.id} className={index > 0 ? "mt-1.5" : ""}>
            <TransactionRow
              timeRemaining={transaction.timeRemaining}
              rate={transaction.rate}
              currentAmount={transaction.currentAmount}
              totalAmount={transaction.totalAmount}
              toAddress={transaction.toAddress}
              progressPercentage={transaction.progressPercentage}
              onCancel={() => handleCancelTransaction(transaction.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StreamingTransactionDashboard;
