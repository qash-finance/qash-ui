"use client";
import React from "react";
import { DatePickerModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import DatePicker from "../Common/DatePicker";

export function DatePickerModal({ isOpen, onClose, defaultSelected, onSelect }: ModalProp<DatePickerModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Choose date" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-1 p-1.5 bg-[#1E1E1E] rounded-b-2xl ">
        <DatePicker
          defaultSelected={defaultSelected}
          onSelect={date => {
            onSelect?.(date);
            if (date) onClose();
          }}
        />
      </div>
    </BaseModal>
  );
}

export default DatePickerModal;
