"use client";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import DateFilter from "../../Date/DateFilter";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import toast from "react-hot-toast";
import { DateFilterModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import _ from "lodash";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { PrimaryButton } from "@/components/Common/PrimaryButton";

const formatDate = (date: Date | undefined) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
export function DateFilterModal({
  isOpen,
  onClose,
  onSelect,
  defaultSelected,
  zIndex,
}: ModalProp<DateFilterModalProps>) {
  const [selected, setSelected] = useState<DateRange | undefined>(defaultSelected);

  const handleApply = () => {
    if (selected?.from && selected?.to && selected.from < selected.to && onSelect) {
      onSelect({
        from: selected.from,
        to: selected.to,
      });
      onClose();
    } else {
      toast.error("Start date must be before end date");
      return;
    }
  };

  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="flex flex-col gap-2 p-1.5 bg-background border border-primary-divider rounded-2xl ">
        <DateFilter
          defaultSelected={selected}
          onRangeChange={range => {
            setSelected(range);
          }}
        />
        {/* Date Range Display */}
        <div className="flex items-center gap-1 w-full my-1">
          <div className="flex-1 bg-app-background flex items-center gap-[5px] h-10 px-2 py-2.5 rounded-lg">
            <div className="flex-1 flex items-center justify-between text-sm leading-5">
              <span className="text-text-secondary">Start date</span>
              <span className="text-text-primary">{selected?.from ? formatDate(selected.from) : "Select date"}</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-3">
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
              <path d="M0 1L12 1" stroke="#1E8FFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex-1 bg-app-background flex items-center gap-[5px] h-10 px-3 py-2.5 rounded-lg">
            <div className="flex-1 flex items-center justify-between text-sm leading-5">
              <span className="text-text-secondary">End date</span>
              <span className="text-text-primary">
                {selected?.to && selected.to !== selected.from ? formatDate(selected.to) : "Select date"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-1">
          <SecondaryButton onClick={onClose} text="Cancel" buttonClassName="flex-1" variant="light" />
          <PrimaryButton onClick={handleApply} text="Confirm" containerClassName="flex-1" />
        </div>
      </div>
    </BaseModal>
  );
}

export default DateFilterModal;
