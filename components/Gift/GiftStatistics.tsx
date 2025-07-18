"use client";

import * as React from "react";
import { TransactionRow } from "./TransactionRow";

interface Transaction {
  id: string;
  amount: string;
  dateTime: string;
  link: string;
  isOpened?: boolean;
}

interface GiftStatisticsProps {
  totalValue?: string;
  giftOpenedCount?: string;
  transactions?: Transaction[];
  onCopyLink?: (link: string) => void;
}

export const GiftStatistics: React.FC<GiftStatisticsProps> = ({
  totalValue = "$720,000",
  giftOpenedCount = "06",
  transactions = [
    { id: "06", amount: "120,000", dateTime: "25/11/2024, 07:15", link: "http://q3x.io/redpacket", isOpened: false },
    { id: "05", amount: "120,000", dateTime: "25/11/2024, 07:15", link: "http://q3x.io/redpacket", isOpened: true },
    { id: "04", amount: "120,000", dateTime: "25/11/2024, 07:15", link: "http://q3x.io/redpacket", isOpened: true },
    { id: "03", amount: "120,000", dateTime: "25/11/2024, 07:15", link: "http://q3x.io/redpacket", isOpened: true },
    { id: "02", amount: "120,000", dateTime: "25/11/2024, 07:15", link: "http://q3x.io/redpacket", isOpened: true },
    { id: "01", amount: "120,000", dateTime: "25/11/2024, 07:15", link: "http://q3x.io/redpacket", isOpened: true },
  ],
  onCopyLink,
}) => {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-stone-900 flex-1">
      {/* Header */}
      <div className="flex flex-col gap-2.5 p-4 pb-0">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-white">Gift sent</h2>
          <p className="text-base text-neutral-500 leading-5">
            Once you accept, you're committing to send the amount to the request address
          </p>
        </div>

        {/* Stats Cards Container */}
        <div className="flex gap-1.5 h-32 md:flex-row flex-col md:gap-1.5 md:h-32">
          {/* Total gift value sent */}
          <div className="relative flex flex-col justify-between p-4 rounded-xl bg-zinc-800 flex-1 min-h-32 overflow-hidden">
            <h3 className="text-base text-neutral-500 leading-5">Total gift value sent</h3>
            <div className="text-5xl font-medium text-zinc-100 sm:text-5xl leading-tight">{totalValue}</div>
            {/* Decorative flowers */}
            <img
              src="/gift/flower.png"
              alt=""
              className="absolute rotate-[99deg] blur-[45px] sm:w-27 sm:h-27 w-20 h-20 sm:top-3 sm:right-10 top-2 right-10"
              aria-hidden="true"
            />
            <img
              src="/gift/flower.png"
              alt=""
              className="absolute rotate-[15deg] sm:w-27 sm:h-27 w-20 h-20 sm:top-3 sm:right-10 top-2 right-10"
              aria-hidden="true"
            />
          </div>

          {/* Gift opened */}
          <div
            className="relative flex flex-col justify-between items-left p-3 rounded-xl  md:w-30 w-full bg-fuchsia-600 min-h-32 overflow-hidden"
            style={{
              backgroundImage: "url('/gift/gift-opened-background.svg')",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <img
              src="/gift/gift-star-background.svg"
              alt=""
              className="absolute bottom-0 right-0 w-16 h-16"
              aria-hidden="true"
            />
            <h3 className="relative text-base text-white leading-5 z-10">Gift opened</h3>
            <div className="relative  font-medium text-white z-10 sm:text-4xl text-3xl">{giftOpenedCount}</div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="px-4">
        <div className="py-1 px-3.5  text-amber-500 bg-amber-900/30 rounded-md backdrop-blur-sm text-center sm:text-base text-sm leading-5">
          Anyone with the link can get the fund. Do not share it publicly, be careful!
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col  px-4 md:gap-1.5 gap-2">
        {transactions.map(transaction => (
          <TransactionRow
            key={transaction.id}
            id={transaction.id}
            amount={transaction.amount}
            dateTime={transaction.dateTime}
            link={transaction.link}
            isOpened={transaction.isOpened}
            onCopyLink={onCopyLink}
          />
        ))}
      </div>
    </div>
  );
};
