"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export function Select({ label, options, value, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-1 bg-background border border-primary-divider rounded-lg outline-none cursor-pointer"
      >
        <div className="flex items-center gap-1 flex-1">
          <p className="text-text-primary">
            <span>{label}: </span>
            <span className="text-primary-blue">{selectedOption ? selectedOption.label : "All"}</span>
          </p>
        </div>
        <img
          src="/arrow/chevron-down.svg"
          alt="Toggle dropdown"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-primary-divider rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-[185px]">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-white first:rounded-t-lg last:rounded-b-lg hover:bg-app-background flex items-center gap-2 cursor-pointer ${
                selectedValue === option.value ? "bg-app-background" : ""
              }`}
            >
              {option.icon && <img src={option.icon} alt="" className="w-5 h-5" />}
              <span className="text-text-primary">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
