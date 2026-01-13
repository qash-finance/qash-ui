"use client";
import React, { useState } from "react";
import { ValidatingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { PrimaryButton } from "../Common/PrimaryButton";

export function DepositModal({ isOpen, onClose, zIndex }: ModalProp<ValidatingModalProps>) {
  const [amount, setAmount] = useState("100,000.00");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [availableBalance] = useState("200,000");

  const handlePercentageClick = (percentage: number) => {
    const balanceNum = 200000;
    const calculatedAmount = Math.floor((balanceNum * percentage) / 100);
    setAmount(calculatedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-app-background rounded-2xl border border-primary-divider w-[480px] ">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex gap-3 items-center">
            <img src="/invoice/download-invoice-icon.svg" alt="deposit" className="w-6 h-6" />
            <h1 className="text-base">Deposit</h1>
          </div>

          <div className="flex gap-4 items-center">
            {/* Wallet Address Button */}
            <div className="bg-background border-t border-primary-divider rounded-lg flex gap-2 items-center px-4 py-1.5">
              <img src="/chain/miden.svg" alt="token" className="w-6 h-6 rounded-full bg-[#FFEDE4] p-0.5" />
              <span className=" text-sm">0x097...0fdb7</span>
            </div>

            {/* Close Button */}
            <div
              className=" w-[28px] h-[28px] bg-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer"
              onClick={onClose}
            >
              <img src="/misc/close-icon.svg" alt="close icon" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3 px-4 pb-4">
          {/* Deposit Info Section */}
          <div className="bg-background border-b border-primary-divider rounded-2xl p-5 space-y-2">
            {/* Amount Header */}
            <div className="flex items-center justify-between">
              <label className="  text-text-secondary text-sm">Amount</label>
              <button className="p-1 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                <img src="/modal/reset-icon.svg" alt="refresh" className="w-4 h-4" />
              </button>
            </div>

            {/* Amount Input with Token Selector */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="    text-2xl bg-transparent border-none outline-none"
              />

              {/* Token Selector */}
              <button className="bg-app-background rounded-full flex gap-2 items-center px-4 py-1.5">
                <img src="/token/qash.svg" className="w-6 h-6" />
                <span className="text-base">{selectedToken}</span>
                <img src="/arrow/chevron-down.svg" alt="dropdown" className="w-4 h-4" />
              </button>
            </div>

            {/* Balance Info and Percentage Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2 items-center flex-1">
                <img src="/modal/blue-wallet-icon.gif" alt="wallet" className="w-4 h-4" />
                <span className="  text-text-secondary text-xs">Available:</span>
                <span className="   text-text-primary text-xs">{availableBalance} USDT</span>
              </div>

              {/* Percentage Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePercentageClick(25)}
                  className="border border-primary-divider rounded-full px-3 py-1.5 text-xs"
                >
                  25%
                </button>
                <button
                  onClick={() => handlePercentageClick(50)}
                  className="border border-primary-divider rounded-full px-3 py-1.5 text-xs"
                >
                  50%
                </button>
                <button
                  onClick={() => handlePercentageClick(100)}
                  className="border border-primary-divider rounded-full px-3 py-1.5 text-xs"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Deposit Button */}
          <PrimaryButton text="Deposit" onClick={() => {}} containerClassName="w-full " />
        </div>
      </div>
    </BaseModal>
  );
}

export default DepositModal;
