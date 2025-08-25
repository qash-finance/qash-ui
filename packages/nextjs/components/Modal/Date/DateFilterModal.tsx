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
    <BaseModal isOpen={isOpen} onClose={onClose} title="Choose date" icon="/modal/coin-icon.gif" zIndex={zIndex}>
      <div className="flex flex-col gap-1 p-1.5 bg-[#1E1E1E] rounded-b-2xl ">
        <DateFilter
          defaultSelected={selected}
          onRangeChange={range => {
            setSelected(range);
          }}
        />
        {/* Date Range Display */}
        <div className="flex items-center gap-1 w-full my-1">
          <div className="flex-1 bg-[#3d3d3d] flex items-center gap-[5px] h-10 px-2 py-2.5 rounded-lg">
            <div className="flex-1 flex items-center justify-between text-sm leading-5">
              <span className="text-[#989898]">Start date</span>
              <span className="text-white">{selected?.from ? formatDate(selected.from) : "Select date"}</span>
            </div>
          </div>

          <div className="flex-shrink-0 w-3">
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
              <path d="M0 1L12 1" stroke="#1E8FFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex-1 bg-[#3d3d3d] flex items-center gap-[5px] h-10 px-3 py-2.5 rounded-lg">
            <div className="flex-1 flex items-center justify-between text-sm leading-5">
              <span className="text-[#989898]">End date</span>
              <span className="text-white">
                {selected?.to && selected.to !== selected.from ? formatDate(selected.to) : "Select date"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center h-8 gap-1">
          <ActionButton onClick={onClose} text="Cancel" type="neutral" className="flex-1 h-full" />
          <ActionButton onClick={handleApply} text="Confirm" className="flex-3 h-full" />
        </div>
      </div>
    </BaseModal>
  );
}

export default DateFilterModal;
