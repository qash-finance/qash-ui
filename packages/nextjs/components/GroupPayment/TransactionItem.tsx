"use client";
import * as React from "react";

interface TransactionItemProps {
  amount: string;
  fromAddress: string;
  status: "pending" | "paid";
  isNamedUser?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  amount,
  fromAddress,
  status,
  isNamedUser = false,
}) => {
  const statusStyles =
    status === "paid" ? "text-[#6CFF85] bg-[#304B36] bg-opacity-20" : "text-white bg-[#4D4D4D] bg-opacity-20";

  return (
    <div className="flex flex-col justify-center px-3 py-1.5 w-full leading-tight rounded-xl bg-neutral-700 max-md:max-w-full">
      <div className="flex flex-wrap gap-10 justify-between items-center py-0.5 w-full max-md:max-w-full">
        <div className="flex gap-3 items-center self-stretch my-auto w-[220px]">
          <div className="flex gap-1 items-center self-stretch my-auto text-base font-medium text-white">
            <img src="/token/usdt.svg" className="flex shrink-0 self-stretch my-auto w-6 h-6" />
            <div className="flex flex-col justify-center self-stretch my-auto">
              <span>{amount}</span>
            </div>
          </div>
          <div className="flex gap-1 items-center self-stretch my-auto">
            <span className="self-stretch my-auto text-sm text-neutral-500">From</span>
            {isNamedUser ? (
              <div className="flex gap-1 justify-center items-center self-stretch px-2  my-auto text-sm tracking-tight leading-loose text-white rounded-full bg-neutral-500">
                <span className="self-stretch my-auto text-white">{fromAddress}</span>
              </div>
            ) : (
              <span className="self-stretch my-auto text-base font-medium text-white">{fromAddress}</span>
            )}
          </div>
        </div>
        <div
          className={`flex overflow-hidden gap-0.5 justify-center items-center self-stretch px-2 py-1 my-auto text-xs font-medium tracking-tight rounded-2xl w-[60px] ${statusStyles}`}
        >
          <span className="self-stretch my-auto">{status === "paid" ? "Paid" : "Pending"}</span>
        </div>
      </div>
    </div>
  );
};
