"use client";
import React, { useState } from "react";
import { DatePickerModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import DatePicker from "../../Date/DatePicker";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { PrimaryButton } from "@/components/Common/PrimaryButton";

export function DatePickerModal({ isOpen, onClose, defaultSelected, onSelect }: ModalProp<DatePickerModalProps>) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultSelected || undefined);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect?.(selectedDate);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-2 p-1.5 bg-background border border-primary-divider rounded-2xl ">
        <DatePicker defaultSelected={defaultSelected} onSelect={setSelectedDate} />

        <div className="flex flex-row gap-2">
          <SecondaryButton onClick={onClose} text="Cancel" variant="light" />
          <PrimaryButton onClick={handleConfirm} text="Select" />
        </div>
      </div>
    </BaseModal>
  );
}

export default DatePickerModal;
