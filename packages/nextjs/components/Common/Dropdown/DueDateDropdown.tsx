"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS, DatePickerModalProps } from "@/types/modal";

const QUICK_DUE_DATES = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
];

interface DueDateDropdownProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  disabled?: boolean;
  variant?: "outlined" | "filled";
  placeholder?: string;
}

export const DueDateDropdown = ({
  selectedDate,
  onDateSelect,
  disabled = false,
  variant = "outlined",
  placeholder = "Select date",
}: DueDateDropdownProps) => {
  const containerStyle = useMemo(() => {
    switch (variant) {
      case "outlined":
        return "border border-primary-divider rounded-xl bg-transparent";
      case "filled":
        return "bg-app-background border-b-2 border-primary-divider rounded-xl";
    }
  }, [variant]);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModal();

  // Format date from string (YYYY-MM-DD) to Date object
  const getDateObject = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Format Date object to string (YYYY-MM-DD)
  const formatDateString = (date: Date | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format string (YYYY-MM-DD) to display format (dd/mm/yyyy)
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return placeholder;
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0);
    return formatDateString(date);
  };

  const handleQuickDateSelect = (days: number) => {
    const newDate = calculateDate(days);
    onDateSelect(newDate);
    setIsOpen(false);
  };

  const handleOpenCustomDatePicker = () => {
    openModal<DatePickerModalProps>(MODAL_IDS.DATE_PICKER, {
      defaultSelected: selectedDate ? getDateObject(selectedDate) : undefined,
      onSelect: (date: Date | undefined) => {
        if (date) {
          const formattedDate = formatDateString(date);
          onDateSelect(formattedDate);
          setIsOpen(false);
        }
      },
    });
  };

  // Get the quick date label for display
  const getQuickDateLabel = (): string | null => {
    if (!selectedDate) return null;
    const matchingQuickDate = QUICK_DUE_DATES.find(quickDate => selectedDate === calculateDate(quickDate.days));
    return matchingQuickDate?.label || null;
  };

  // Format date for display (e.g., "Dec 08, 2025")
  const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return "";
    const date = getDateObject(dateString);
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 h-full w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-between ${containerStyle}`}
        disabled={disabled}
      >
        <div className="flex flex-col h-15 justify-center">
          {selectedDate ? (
            <>
              <span className="text-text-secondary text-sm">Due in</span>
              <div className="flex gap-1.5 items-center">
                <p className="text-text-primary font-semibold">
                  {getQuickDateLabel() || formatDisplayDate(selectedDate)}
                </p>
                {getQuickDateLabel() && (
                  <p className="text-primary-blue font-medium">{formatDateForDisplay(selectedDate)}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-text-secondary text-sm">Due in</span>
              <p className="text-text-primary font-semibold">{placeholder}</p>
            </>
          )}
        </div>

        <img
          src="/arrow/chevron-down.svg"
          alt="dropdown"
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 shadow-lg bg-background border-2 border-primary-divider rounded-xl z-50 overflow-hidden">
          <div className="flex flex-col">
            {QUICK_DUE_DATES.map(quickDate => (
              <button
                key={quickDate.label}
                type="button"
                onClick={() => handleQuickDateSelect(quickDate.days)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-app-background transition-colors cursor-pointer text-left border-b border-primary-divider last:border-b-0 ${
                  selectedDate === calculateDate(quickDate.days) ? "bg-app-background" : ""
                }`}
              >
                <span className="text-text-primary font-semibold">{quickDate.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Date Picker Button */}
          <button
            type="button"
            onClick={handleOpenCustomDatePicker}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-app-background transition-colors cursor-pointer text-left border-t border-primary-divider"
          >
            <span className="text-text-secondary font-semibold text-sm">Click here to custom due day</span>
          </button>
        </div>
      )}
    </div>
  );
};
