"use client";
import React from "react";
import { FailModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

export function FailModal({ isOpen, onClose, zIndex, tryAgain }: ModalProp<FailModalProps>) {
  const handleTryAgain = async () => {
    onClose();
    await tryAgain?.();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Failed" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="bg-[#292929] flex flex-col gap-4 h-[280px] items-center justify-center px-0 py-3 w-[504px]">
        <img alt="" className="scale-100 z-10" src="/red-cross.svg" />
        <div className="flex flex-col gap-2 items-center justify-start leading-[0] px-20 py-0 text-center w-full">
          <div className="font-medium  text-[#ffffff] text-[24px] tracking-[0.12px] w-full">
            <p className="block leading-[26px]">Oops, something went wrong.</p>
          </div>
          <div className="font-normal  text-[#989898] text-[14px] tracking-[0.07px] w-full">
            <p className="block leading-[20px]">Please try again in a moment or contact our team</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1E1E1E] flex flex-row items-center justify-center p-3 rounded-b-xl gap-2">
        <ActionButton
          text="Contact support"
          type="neutral"
          onClick={() => {
            window.open("https://t.me/+GR5eFRAAoNAyMjZl", "_blank");
          }}
          className="flex-1"
        />
        <ActionButton text="Try again" onClick={handleTryAgain} className="flex-1" />
      </div>
    </BaseModal>
  );
}

export default FailModal;
