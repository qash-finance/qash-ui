"use client";
import { useTitle } from "@/contexts/TitleProvider";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { SecondaryButton } from "../Common/SecondaryButton";

const InvoiceItem = ({ invoiceId = "INV00001", name = "Ken", amount = "1,000 USDT", amountUsd = "$1,000" }) => {
  return (
    <div className="grid grid-cols-[120px_120px_120px_1fr_120px] gap-10 items-center w-full border-b border-primary-divider px-4 py-3 bg-background rounded-xl">
      {/* Invoice ID Column */}
      <span className="text-sm font-medium text-text-primary">{invoiceId}</span>

      {/* Name Column */}
      <span className="text-sm font-medium text-text-primary">{name}</span>

      {/* Employee Badge Column */}
      <div className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-100 rounded-full">
        <span className="text-sm font-medium text-primary-blue">Employee</span>
      </div>

      {/* Amount Column */}
      <div className="flex items-end flex-col gap-2">
        <div className="flex flex-row gap-1 items-center">
          <img src="/token/usdt.svg" alt="USDT" className="w-5" />
          <span className=" font-medium text-text-primary leading-none">{amount}</span>
        </div>
        <span className="text-sm text-text-secondary leading-none">{amountUsd}</span>
      </div>

      {/* View Button Column */}
      <button className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-text-primary hover:bg-gray-200 transition-colors">
        View
      </button>
    </div>
  );
};

const TokenItem = () => {
  return (
    <div className="flex justify-start items-center gap-2">
      <img src="/token/usdt.svg" alt="USDT" className="w-10" />

      <div className="flex items-start flex-col gap-0.5">
        <div className="text-[18px] leading-none">2,500 USDT</div>
        <div className="text-[16px] text-text-secondary leading-none">$2500</div>
      </div>
    </div>
  );
};

const BillReviewContainer = () => {
  const router = useRouter();
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();

  useEffect(() => {
    const handleBack = () => {
      router.back();
    };

    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Bills /</span>
        <span className="text-text-primary">Review and propose</span>
      </div>,
    );
    setShowBackArrow(true);
    setOnBackClick(() => handleBack);

    return () => {
      // clean up when component unmounts
      setOnBackClick(undefined);
      setShowBackArrow(false);
    };
  }, [router]);

  return (
    <div className="flex flex-col w-full h-full justify-start items-start p-7 gap-5">
      <div className="flex flex-row gap-3">
        <img src="/misc/flag-icon.svg" alt="Bill Placeholder" className="w-6" />
        <span className="font-bold text-2xl">Review and propose</span>
      </div>

      <div className="flex flex-row w-full h-full">
        {/* Left Side - Bill Details */}
        <div className="flex-1 border-r-0 border border-primary-divider rounded-l-2xl p-5 bg-app-background flex flex-col gap-5 h-full overflow-auto">
          <div className=" flex flex-row justify-between w-full items-center">
            <span className="font-semibold text-lg">Invoice list</span>
            <span className="text-lg text-text-secondary">
              Number of invoices
              <span className="text-primary-blue"> 50</span>
            </span>
            <div className="bg-[#E7E7E7] border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
              <div className="flex flex-row gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Search by name"
                  className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
                />
              </div>
              <button
                type="submit"
                className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
              >
                <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
              </button>
            </div>
          </div>
          <InvoiceItem />
          {/* Bill details content goes here */}
        </div>

        {/* Right Side - Review Summary - Edit the code here */}
        <div className="w-150 border-l-0 border border-primary-divider rounded-r-2xl bg-[#E7E7E7] h-full flex flex-col gap-4">
          <div className="flex flex-col h-full justify-between px-7 py-4">
            <div className=" flex flex-col gap-2 justify-between">
              <span className="font-bold text-3xl">Create Payment Proposal</span>
              <span className="text-text-secondary ">
                You’re about to propose a payout for invoices. Review the details and select a multisig account to send
                the proposal to.
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-lg">Total by token</span>
              <TokenItem />
              <TokenItem />
            </div>
          </div>

          <div className="flex w-full px-7 py-4 border-t-1 border-[#DBDCDE] justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-text-secondary leading-none">Total amount</span>
              <span className="font-bold text-3xl leading-none">$1500</span>
            </div>
            <SecondaryButton text="Connect Wallet" buttonClassName="w-40 !rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillReviewContainer;
