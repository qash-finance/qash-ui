"use client";
import React from "react";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { SecondaryButton } from "@/components/Common/SecondaryButton";

interface PayrollTransaction {
  id: string;
  type: "Pay";
  description: string;
  transactionCount: number;
  tokens: string[];
  status: "pending" | "completed";
  completionCount?: number;
  totalConfirmations?: number;
  dateTime: string;
}

interface TransactionRowProps {
  transaction: PayrollTransaction;
  onApprove?: (transactionId: string) => void;
  onDeny?: (transactionId: string) => void;
}

export function TransactionRow({ transaction, onApprove, onDeny }: TransactionRowProps) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg border-b border-primary-divider last:border-b-0 hover:bg-app-background`}
    >
      {/* Icon & Type */}
      <div className="flex items-center gap-3 w-28 flex-shrink-0">
        <img src="/transaction/pay-icon.svg" alt="Pay" className="w-6" />
        <span className="text-sm font-medium text-text-primary whitespace-nowrap">{transaction.type}</span>
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{transaction.description}</p>
      </div>

      {/* Transaction Count */}
      <div className="flex-shrink-0 w-32">
        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-sm font-semibold text-blue-600">{transaction.transactionCount} transactions</span>
        </div>
      </div>

      {/* Token Icons */}
      <div className="flex-shrink-0 w-32 flex items-center justify-center">
        <div className="flex items-center -space-x-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-background"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0 w-32 flex items-center justify-center">
        {transaction.status === "pending" ? (
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border border-yellow-400 bg-yellow-50">
            <span className="text-sm font-semibold text-yellow-700">
              {transaction.completionCount} out of {transaction.totalConfirmations}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-green-400 bg-green-50">
            <span className="text-sm font-semibold text-green-700">Completed</span>
          </div>
        )}
      </div>

      {/* DateTime */}
      <div className="flex-shrink-0 w-36 text-center">
        <p className="text-sm font-medium text-text-secondary whitespace-nowrap">{transaction.dateTime}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2">
        <SecondaryButton text="Deny" variant="dark" buttonClassName="px-7" onClick={() => onDeny?.(transaction.id)} />
        <PrimaryButton text="Approve" buttonClassName="px-4" onClick={() => onApprove?.(transaction.id)} />
      </div>
    </div>
  );
}
