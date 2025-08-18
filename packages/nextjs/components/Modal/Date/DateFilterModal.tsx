"use client";
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import DateFilter from "../../Date/DateFilter";
import BaseModal from "../BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dateRange: DateRange | undefined) => void;
  defaultSelected?: DateRange;
}

const DateFilterModal: React.FC<DateFilterModalProps> = ({ isOpen, onClose, onApply, defaultSelected }) => {
  const [selected, setSelected] = useState<DateRange | undefined>(defaultSelected);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleApply = () => {
    onApply(selected);
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Choose date" icon="/modal/coin-icon.gif">
      <div className="flex flex-col gap-1 p-1.5 bg-[#1E1E1E] rounded-b-2xl ">
        <DateFilter
          onSelect={date => {
            setSelected({ from: date, to: date });
          }}
        />
        {/* Date Range Display */}
        <div className="flex items-center gap-1 w-full my-1">
          <div className="flex-1 bg-[#3d3d3d] flex items-center gap-[5px] h-10 px-2 py-2.5 rounded-lg">
            <div className="flex-1 flex items-center justify-between text-sm leading-5">
              <div className="font-['Barlow:Regular',_sans-serif] text-[#989898]">
                <p className="adjustLetterSpacing">Start date</p>
              </div>
              <div className="font-['Barlow:SemiBold',_sans-serif] text-white">
                <p className="adjustLetterSpacing">{selected?.from ? formatDate(selected.from) : "Select date"}</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-3">
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
              <path d="M0 1L12 1" stroke="#1E8FFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex-1 bg-[#3d3d3d] flex items-center gap-[5px] h-10 px-3 py-2.5 rounded-lg">
            <div className="flex-1 flex items-center justify-between text-sm leading-5">
              <div className="font-['Barlow:Regular',_sans-serif] text-[#989898]">
                <p className="adjustLetterSpacing">End date</p>
              </div>
              <div className="font-['Barlow:SemiBold',_sans-serif] text-white">
                <p className="adjustLetterSpacing">{selected?.to ? formatDate(selected.to) : "Select date"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center h-8">
          <ActionButton onClick={onClose} text="Cancel" type="neutral" className="flex-1 h-full" />
          <ActionButton onClick={handleApply} text="Confirm" className="flex-3 h-full" />
        </div>
      </div>
    </BaseModal>
  );
};

export default DateFilterModal;
