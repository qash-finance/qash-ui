"use client";
import React from "react";
import { CancelScheduleProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

export function CancelSchedule({ isOpen, onClose, zIndex, onCancel }: ModalProp<CancelScheduleProps>) {
  const handleCancel = async () => {
    onClose();
    await onCancel?.();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Cancel schedule" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="bg-[#292929] flex flex-col gap-4 h-[280px] items-center justify-center px-0 py-3 w-[504px]">
        <img alt="" className="scale-100 z-10" src="/schedule-payment/cancel-schedule.svg" />
        <div className="flex flex-col gap-2 items -center justify-start leading-[0] px-20 py-0 text-center w-full">
          <div className="font-medium  text-[#ffffff] text-[24px] tracking-[0.12px] w-full">
            <p className="block leading-[26px]">Cancel schedule?</p>
          </div>
          <div className="font-normal  text-[#989898] text-[14px] tracking-[0.07px] w-full">
            <p className="block leading-[20px]">
              All upcoming transactions in this schedule will be canceled and refunded once you confirmed
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#1E1E1E] flex flex-row items-center justify-center p-3 rounded-b-xl gap-2">
        <ActionButton
          text="No, keep it"
          type="neutral"
          onClick={() => {
            onClose();
          }}
          className="flex-1 h-9"
        />
        <ActionButton text="Yes, cancel" onClick={handleCancel} className="flex-1 h-9" type="deny" />
      </div>
    </BaseModal>
  );
}

export default CancelSchedule;
