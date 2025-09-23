"use client";

import React, { useState, useRef, useEffect } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterButtonProps {
  options: FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export function FilterButton({ options, value, onChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const filterRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    if (selectedValue === optionValue) {
      // If clicking the same option, unselect it
      setSelectedValue("");
      onChange?.("");
    } else {
      // Select the new option
      setSelectedValue(optionValue);
      onChange?.(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={filterRef}>
      <img
        src="/misc/blue-filter-icon.svg"
        alt="Filter"
        className={`w-6 h-6 cursor-pointer ${!selectedValue && "grayscale"}`}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-background border border-primary-divider rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-[200px]">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-white first:rounded-t-lg last:rounded-b-lg hover:bg-app-background flex items-center gap-2 cursor-pointer ${
                selectedValue === option.value ? "bg-app-background" : ""
              }`}
            >
              <span className="text-text-primary">{option.label}</span>
              {selectedValue === option.value && (
                <img src="/misc/blue-check-icon.svg" alt="Selected" className="w-5 h-5 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
