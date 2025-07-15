"use client";
import * as React from "react";
import { TransactionItem } from "./TransactionItem";
import { TabContainer } from "../Common/TabContainer";

interface PaymentContainerProps {
  groups: string[];
}

export const PaymentContainer: React.FC<PaymentContainerProps> = ({ groups }) => {
  return (
    <div className="overflow-hidden flex-1 shrink p-4 rounded-2xl basis-0 bg-zinc-800 min-w-60 max-md:max-w-full h-full">
      <TabContainer tabs={groups.map(group => ({ id: group, label: group }))} className="w-full" />

      <div className="flex gap-4 items-center mt-4 w-full max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink justify-center self-stretch my-auto w-full basis-0 min-h-8 min-w-60 max-md:max-w-full">
          <h2 className="self-start text-lg font-medium leading-none text-center text-white">Paying Progress</h2>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-500 max-md:max-w-full">
            Below is the list of addresses that have paid the split amount.
          </p>
        </div>
      </div>

      <section className="mt-4 w-full max-md:max-w-full">
        <div className="flex flex-col justify-center items-start w-full text-base leading-none text-center text-white max-md:max-w-full">
          <time className="text-white">June, 26, 2025</time>
        </div>
        <div className="mt-1.5 w-full whitespace-nowrap max-md:max-w-full">
          <TransactionItem amount="1,400" fromAddress="Dannyxs" status="pending" isNamedUser={true} />
          <div className="mt-1">
            <TransactionItem amount="1,400" fromAddress="0xd3...1d4f" status="paid" />
          </div>
          <div className="mt-1">
            <TransactionItem amount="1,400" fromAddress="0xd3...1d4f" status="pending" />
          </div>
        </div>
      </section>

      <section className="mt-4 w-full max-md:max-w-full">
        <div className="flex flex-col justify-center items-start w-full text-base leading-none text-center text-white max-md:max-w-full">
          <time className="text-white">June, 15 2025</time>
        </div>
        <div className="mt-1.5 w-full whitespace-nowrap max-md:max-w-full">
          <TransactionItem amount="500" fromAddress="Dannyxs" status="pending" isNamedUser={true} />
          <div className="mt-1">
            <TransactionItem amount="500" fromAddress="0xd3...1d4f" status="pending" />
          </div>
          <div className="mt-1">
            <TransactionItem amount="500" fromAddress="0xd3...1d4f" status="pending" />
          </div>
        </div>
      </section>
    </div>
  );
};
