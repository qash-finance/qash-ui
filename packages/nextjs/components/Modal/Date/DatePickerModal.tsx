"use client";
import React from "react";
import { DatePickerModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import DatePicker from "../../Date/DatePicker";

export function DatePickerModal({ isOpen, onClose, defaultSelected, onSelect }: ModalProp<DatePickerModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-2 p-1.5 bg-background border border-primary-divider rounded-2xl ">
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
