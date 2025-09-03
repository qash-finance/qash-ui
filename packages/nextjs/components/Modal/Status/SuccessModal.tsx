"use client";
import React from "react";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

export function SuccessModal({ isOpen, onClose, zIndex }: ModalProp<SelectTokenModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Success" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="bg-[#292929] flex flex-col gap-4 h-[280px] items-center justify-center px-0 py-3 w-[504px] relative">
        <img alt="" className="scale-100 relative z-10" src="/green-check.svg" />
        <div className="flex flex-col gap-2 items-center justify-start leading-[0] px-20 py-0 text-center w-full">
          <div className="font-medium relative text-[#ffffff] text-[24px] tracking-[0.12px] w-full">
            <p className="block leading-[26px]">Payment Successful</p>
          </div>
          <div className="font-normal relative text-[#989898] text-[14px] tracking-[0.07px] w-full">
            <p className="block leading-[20px]">
              You’ve sent <span className="text-white">0.005 BTC</span> to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#1E1E1E] flex flex-row items-center justify-center p-3 rounded-b-xl gap-2">
        <ActionButton
          text="Check on Explorer"
          type="neutral"
          onClick={() => {
            window.open("https://t.me/+GR5eFRAAoNAyMjZl", "_blank");
          }}
          className="flex-1"
        />
        <ActionButton text="Back to Overview" onClick={onClose} className="flex-1" />
      </div>
    </BaseModal>
  );
}

export default SuccessModal;
