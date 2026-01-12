"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import DatePicker from "@/components/Date/DatePicker";

interface DatePickerDropdownProps {
  label?: string;
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  disabled?: boolean;
  variant?: "outlined" | "filled";
  placeholder?: string;
}

export const DatePickerDropdown = ({
  label,
  selectedDate,
  onDateSelect,
  disabled = false,
  variant = "outlined",
  placeholder = "Select date",
}: DatePickerDropdownProps) => {
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

  // Format date from string (YYYY-MM-DD) to Date object
  const getDateObject = (dateString?: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    // Ensure it's start of day
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
    if (!dateString) return "dd/mm/yyyy";
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateString(date);
      onDateSelect(formattedDate);
      setIsOpen(false);
    }
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
              <span className="text-text-secondary text-sm">Set the invoice to start at</span>
              <p className="text-text-primary font-semibold">{formatDisplayDate(selectedDate)}</p>
            </>
          ) : (
            <>
              <span className="text-text-secondary text-sm">Set the invoice to start at</span>
              <p className="text-text-primary font-semibold">dd/mm/yyyy</p>
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
        <div className="absolute top-full left-0 right-0 mt-2 shadow-lg bg-background border-2 border-primary-divider rounded-xl z-50 p-4">
          <DatePicker defaultSelected={getDateObject(selectedDate)} onSelect={handleDateSelect} />
        </div>
      )}
    </div>
  );
};
