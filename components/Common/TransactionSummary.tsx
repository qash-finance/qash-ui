"use client";

export enum TransactionType {
  SEND = "send",
  GIFT = "gift",
  BATCH = "batch",
  CLAIM = "claim",
  ADD = "add",
  REMOVE = "remove",
  THRESHOLD = "threshold",
}

export interface TransactionSummaryProps {
  type?: TransactionType;
  date?: string;
}

const splitter = <span className="h-9 w-px bg-black self-stretch" aria-hidden="true" />;

export function TransactionSummary({ type, date }: TransactionSummaryProps) {
  return (
    <section className="flex gap-0 items-start self-stretch rounded-lg bg-[#292929] max-md:flex-wrap text-white text-center text-sm">
      <div className="flex-1 mt-2">Gift</div>
      {splitter}

      <div className="flex-1/14 mt-2">Token</div>
      {splitter}

      <div className="flex-1 mt-2">Musk</div>
      {splitter}

      <div className="flex-1 mt-2">0x...s78</div>
      {splitter}

      <div className="flex-1/16 mt-2">25/11/2024, 07:15</div>
    </section>
  );
}
