"use client";
import React from "react";
import { RemoveSchedulePaymentProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

export function RemoveSchedulePayment({ isOpen, onClose, zIndex, onConfirm }: ModalProp<RemoveSchedulePaymentProps>) {
  const handleCancel = async () => {
    await onConfirm?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Cancel schedule" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="bg-[#292929] flex flex-col gap-4 h-[280px] items-center justify-center px-0 py-3 w-[504px]">
        <img alt="" className="scale-100 z-10" src="/trashcan-icon.svg" />
        <div className="flex flex-col gap-2 items -center justify-start leading-[0] px-20 py-0 text-center w-full">
          <div className="font-medium  text-[#ffffff] text-[24px] tracking-[0.12px] w-full">
            <p className="block leading-[26px]">Remove scheduled payment?</p>
          </div>
          <div className="font-normal  text-[#989898] text-[14px] tracking-[0.07px] w-full">
            <p className="block leading-[20px]">This payment will no longer be processed automatically.</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1E1E1E] flex flex-row items-center justify-center p-3 rounded-b-xl gap-2">
        <ActionButton
          text="Cancel"
          type="neutral"
          onClick={() => {
            onClose();
          }}
          className="flex-1 h-9"
        />
        <ActionButton text="Remove" onClick={handleCancel} className="flex-3 h-9" type="deny" />
      </div>
    </BaseModal>
  );
}

export default RemoveSchedulePayment;
