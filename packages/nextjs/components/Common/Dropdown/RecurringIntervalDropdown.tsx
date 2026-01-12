"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

const RECURRING_INTERVALS = ["Monthly", "Every 3 months", "Every 6 months", "Yearly"];

interface RecurringIntervalDropdownProps {
  selectedInterval?: string;
  onIntervalSelect: (interval: string) => void;
  disabled?: boolean;
  variant?: "outlined" | "filled";
}

export const RecurringIntervalDropdown = ({
  selectedInterval,
  onIntervalSelect,
  disabled = false,
  variant = "outlined",
}: RecurringIntervalDropdownProps) => {
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

  const handleIntervalClick = (interval: string) => {
    onIntervalSelect(interval);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 h-full w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-between ${containerStyle}`}
        disabled={disabled}
      >
        <div className="flex flex-col h-15 justify-center">
          {selectedInterval ? (
            <div>
              <span className="text-text-secondary text-sm">Recurring interval</span>
              <p className="text-text-primary font-semibold">{selectedInterval}</p>
            </div>
          ) : (
            <span className="text-text-primary text-[16px]">Select recurring interval</span>
          )}
        </div>

        <img
          src="/arrow/chevron-down.svg"
          alt="dropdown"
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 mb-5 shadow-lg bg-background border-2 border-primary-divider rounded-xl z-50 overflow-hidden p-2 h-auto max-h-[240px] overflow-y-auto">
          <div className="px-2 py-1">
            <p className="text-text-secondary text-xs">Select a recurring interval</p>
          </div>

          <div className="flex flex-col">
            {RECURRING_INTERVALS.map(interval => (
              <button
                key={interval}
                type="button"
                onClick={() => handleIntervalClick(interval)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-app-background transition-colors cursor-pointer ${
                  selectedInterval === interval ? "bg-app-background" : ""
                }`}
              >
                <span className="text-text-primary font-semibold">{interval}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
