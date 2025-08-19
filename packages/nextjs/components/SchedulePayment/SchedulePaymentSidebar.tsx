"use client";

import React, { useState, useEffect } from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { PortfolioModalProps } from "@/types/modal";
import { ActionButton } from "../Common/ActionButton";

interface ScheduledTransactionItemProps {
  transactionNumber: number;
  status: "Claimed" | "Pending claim" | "Pending Send";
  amount: string;
  claimableDate: string;
  onCancel: () => void;
}

const ScheduledTransactionItem: React.FC<ScheduledTransactionItemProps> = ({
  transactionNumber,
  status,
  amount,
  claimableDate,
  onCancel,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Claimed":
        return "text-[#09de34]";
      case "Pending claim":
        return "text-[#1e8fff]";
      case "Pending Send":
        return "text-[#ffb700]";
      default:
        return "text-white";
    }
  };

  return (
    <div className="bg-[#1e1e1e] flex flex-col gap-1 items-start justify-center px-3 py-5 rounded-lg w-full relative">
      <div className="absolute inset-0 border-[#3d3d3d] border-b border-solid rounded-lg pointer-events-none" />
      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex gap-4 items-center">
            <div className="bg-[#066eff] w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src="/modal/coin-icon.gif"
                alt="qash"
                className="w-6 h-6"
                style={{ filter: "invert(1) brightness(1000%)" }}
              />
            </div>
            <div className="flex flex-col text-sm font-medium">
              <div className="text-white leading-5 tracking-[0.07px]">Transaction #{transactionNumber}</div>
              <div className={`leading-5 ${getStatusColor(status)}`}>{status}</div>
            </div>
          </div>
          <ActionButton text="Cancel" onClick={onCancel} type="neutral" />
        </div>
        <div className="flex gap-2 items-center justify-end">
          <div className="bg-[#3d3d3d] flex gap-2.5 items-center justify-center px-4 py-1.5 rounded-md">
            <div className="text-white text-sm font-medium tracking-[0.07px] leading-5">{amount}</div>
          </div>
          <div className="bg-[#3d3d3d] flex gap-2.5 items-center justify-center px-4 py-1.5 rounded-md">
            <div className="text-white text-sm font-medium tracking-[0.07px] leading-5">
              Claimable after {claimableDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchedulePaymentSidebar = ({ isOpen, onClose }: ModalProp<PortfolioModalProps>) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isOpen) return null;

  return (
    <div
      data-tour="portfolio-section"
      className="fixed inset-0 flex items-center justify-end z-[150] pointer-events-auto"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out
        ${isAnimating ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}
      `}
        style={{ zIndex: 1 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <main
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-[#1E1E1E] h-full w-[470px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[425px] max-sm:p-1 max-sm:w-full max-sm:h-screen transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2 }}
      >
        {/* Back Navigation */}
        <nav
          className="flex relative flex-col shrink-0 justify-center items-center self-stretch px-2 py-0 rounded-2xl bg-black w-[42px] cursor-pointer"
          onClick={handleClose}
        >
          <button className="flex absolute justify-center items-center w-7 h-7 top-1/2" aria-label="Close">
            <img src="/close-icon.svg" alt="close-icon" className="w-7 h-7" />
          </button>
        </nav>

        {/* Main Content */}
        <div className="bg-[#292929] flex flex-col gap-5 items-center justify-start overflow-clip pb-2 pt-10 px-2 rounded-2xl w-full h-full">
          {/* Recipient Section */}
          <div className="flex flex-col gap-2 items-center">
            <div
              className="w-20 h-20 rounded-[100px] bg-no-repeat bg-center bg-cover"
              style={{
                backgroundImage: `url('http://localhost:3845/assets/3120fc7b000d3423675d1f6a143be1245f6b09c0.png'), url('http://localhost:3845/assets/63fb8a94c931017c97173106ac42b6801edd5d1c.png')`,
              }}
            />
            <div className="flex flex-col gap-1.5 items-center text-center">
              <div className="text-[#989898] text-sm tracking-[0.07px] leading-5">Recipent</div>
              <div className="text-white text-xl tracking-[0.1px] leading-5 font-medium">0x23C...11g63</div>
            </div>
          </div>

          {/* Cancel Schedule Button */}
          <ActionButton text="Cancel Schedule" onClick={() => {}} type="neutral" className="h-9" />

          {/* Transactions Container */}
          <div className="bg-[#0c0c0c] flex flex-col gap-5 grow w-full rounded-2xl p-3">
            {/* Wallet Info Header */}
            <div className="flex gap-2 items-center justify-between w-full">
              <div className="flex gap-2 items-center grow">
                <div className="text-white text-sm text-center font-medium leading-[22px]">Total amount</div>
              </div>
              <div className="flex gap-2 items-center">
                <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
                <div className="flex flex-col justify-center text-white text-xl font-medium tracking-[-0.6px] uppercase leading-none">
                  3 000
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex flex-col gap-1 w-full">
              <ScheduledTransactionItem
                transactionNumber={1}
                status="Claimed"
                amount="1000 BTC"
                claimableDate="01/08/2025"
                onCancel={() => {}}
              />

              <ScheduledTransactionItem
                transactionNumber={2}
                status="Pending claim"
                amount="1000 BTC"
                claimableDate="01/09/2025"
                onCancel={() => {}}
              />

              <ScheduledTransactionItem
                transactionNumber={3}
                status="Pending Send"
                amount="1000 BTC"
                claimableDate="01/10/2025"
                onCancel={() => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchedulePaymentSidebar;
