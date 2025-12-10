"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

const COMPANY_TYPE = [
  "Sole Proprietorship",
  "Partnership",
  "LLP – Limited Liability Partnership",
  "LLC – Limited Liability Company",
  "Private Limited Company (Ltd / Pte Ltd)",
  "Corporation (Inc. / Corp.)",
  "Public Limited Company (PLC)",
  "Non-Profit Organization",
];

interface CompanyTypeDropdownProps {
  selectedCompanyType?: string;
  onCompanyTypeSelect: (companyType: string) => void;
  disabled?: boolean;
}

export const CompanyTypeDropdown = ({
  selectedCompanyType,
  onCompanyTypeSelect,
  disabled = false,
}: CompanyTypeDropdownProps) => {
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

  const handleCompanyTypeClick = (companyType: string) => {
    onCompanyTypeSelect(companyType);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-full w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-between border border-primary-divider rounded-xl bg-transparent"
        disabled={disabled}
      >
        <div className="flex flex-col h-15 justify-center">
          {selectedCompanyType ? (
            <div>
              <span className="text-text-secondary text-sm">Select your company type</span>
              <p className="text-text-primary font-semibold">{selectedCompanyType}</p>
            </div>
          ) : (
            <span className="text-text-primary text-[16px]">Select your company type</span>
          )}
        </div>

        <img
          src="/arrow/chevron-down.svg"
          alt="dropdown"
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mb-5 shadow-lg bg-background border-2 border-primary-divider rounded-xl z-50 overflow-hidden p-2 h-[240px] overflow-y-auto">
          <div className="px-2 py-1">
            <p className="text-text-secondary text-xs">Select a company type</p>
          </div>

          <div className="flex flex-col">
            {COMPANY_TYPE.map((companyType, index) => (
              <button
                key={companyType}
                type="button"
                onClick={() => handleCompanyTypeClick(companyType)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-app-background transition-colors cursor-pointer ${
                  selectedCompanyType === companyType ? "bg-app-background" : ""
                }`}
              >
                <span className="text-text-primary font-semibold">{companyType}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
