"use client";
import React from "react";
import { CancelPaymentProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

export function CancelPayment({ isOpen, onClose, zIndex, onCancel }: ModalProp<CancelPaymentProps>) {
  const handleCancel = async () => {
    onClose();
    await onCancel?.();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Cancel payment" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="bg-[#292929] flex flex-col gap-4 h-[280px] items-center justify-center px-0 py-3 w-[504px]">
        <img alt="" className="scale-100 z-10" src="/schedule-payment/cancel-payment.svg" />
        <div className="flex flex-col gap-2 items -center justify-start leading-[0] px-20 py-0 text-center w-full">
          <div className="font-medium  text-[#ffffff] text-[24px] tracking-[0.12px] w-full">
            <p className="block leading-[26px]">Cancel payment?</p>
          </div>
          <div className="font-normal  text-[#989898] text-[14px] tracking-[0.07px] w-full">
            <p className="block leading-[20px]">
              If you cancel, this transaction won’t be processed and the amount will be refunded.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#1E1E1E] flex flex-row items-center justify-center p-3 rounded-b-xl gap-2">
        <ActionButton
          text="Keep"
          type="neutral"
          onClick={() => {
            onClose();
          }}
          className="flex-1 h-9"
        />
        <ActionButton text="Cancel payment" onClick={handleCancel} className="flex-1 h-9" />
      </div>
    </BaseModal>
  );
}

export default CancelPayment;
