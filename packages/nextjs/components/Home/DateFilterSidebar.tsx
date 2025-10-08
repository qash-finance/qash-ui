"use client";

import React, { useState, useEffect } from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { DateFilterModalProps } from "@/types/modal";
import { DateRange } from "react-day-picker";
import DateFilter from "../Date/DateFilter";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";
import { toast } from "react-hot-toast";

interface FilterItemProps {
  text: string;
  icon?: string;
  isSelected: boolean;
  onClick: () => void;
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const FilterItem = ({ text, icon, isSelected, onClick }: FilterItemProps) => {
  return (
    <div
      className={`flex flex-row gap-1 w-fit justify-center items-center bg-app-background rounded-full px-3 py-2 cursor-pointer ${
        isSelected ? "outline outline-primary-blue" : "outline-none"
      }`}
      onClick={onClick}
    >
      {icon && <img src={icon} alt="icon" className="w-4 h-4" />}
      <span className="text-text-primary leading-none">{text}</span>
    </div>
  );
};

const DateFilterSidebar = ({ isOpen, onClose, defaultSelected, onSelect }: ModalProp<DateFilterModalProps>) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selected, setSelected] = useState<DateRange | undefined>(defaultSelected);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the element is rendered before animation starts
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => onClose(), 300);
  };

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
    <div className="portfolio fixed inset-0 flex items-center justify-end z-[150] pointer-events-auto">
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out
        ${isAnimating ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"}
      `}
        style={{ zIndex: 1 }}
        onClick={handleClose}
      />
      {/* Modal */}
      <main
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-app-background h-full w-[420px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[425px] max-sm:p-1 max-sm:w-full max-sm:h-screen transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 2 }}
      >
        <div className="flex flex-col w-full h-full justify-between items-start p-2">
          <div className="flex relative flex-col gap-2 items-start h-full w-full ">
            {/* Header */}
            <div className="flex flex-row gap-2 items-center w-full justify-between">
              <div className="flex flex-row gap-3 items-center justify-start">
                <span className="text-text-primary text-2xl">Filter</span>
                <img
                  src="/portfolio/loading-icon.svg"
                  alt="loading"
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => handleClose()}
                />
              </div>
              <img
                src="/misc/close-icon.svg"
                alt="close"
                className="w-5 h-5 opacity-50 cursor-pointer"
                onClick={handleClose}
              />
            </div>

            <div className="flex flex-col gap-2 w-full justify-center items-center bg-background rounded-2xl pb-3">
              <DateFilter
                defaultSelected={selected}
                onRangeChange={range => {
                  setSelected(range);
                }}
              />
              {/* Date Range Display */}
              <div className="flex items-center gap-1 w-full px-3">
                <div className="flex-1 bg-app-background flex items-center gap-[5px] h-10 px-2 py-2.5 rounded-lg">
                  <div className="flex-1 flex items-center justify-between text-sm leading-5">
                    <span className="text-text-secondary">Start date</span>
                    <span className="text-text-primary">
                      {selected?.from ? formatDate(selected.from) : "Select date"}
                    </span>
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
            </div>

            <div className="flex flex-row gap-2 w-full justify-start items-center bg-background rounded-2xl p-3">
              <FilterItem text="Incoming" isSelected={false} onClick={() => {}} />
              <FilterItem text="Outgoing" isSelected={false} onClick={() => {}} />
              <FilterItem text="Faucet" isSelected={false} onClick={() => {}} />
            </div>
          </div>

          <div className="flex flex-row gap-2 w-full justify-center items-center">
            <SecondaryButton text="Cancel" onClick={handleClose} variant="light" />
            <PrimaryButton text="Confirm" onClick={handleApply} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DateFilterSidebar;
