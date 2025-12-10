"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

const COUNTRY = [
  { value: "US", label: "United States", icon: "/flag/us.svg" },
  { value: "UK", label: "United Kingdom", icon: "/flag/uk.svg" },
  { value: "VN", label: "Vietnam", icon: "/flag/vn.svg" },
  { value: "SG", label: "Singapore", icon: "/flag/sg.svg" },
  { value: "MY", label: "Malaysia", icon: "/flag/my.svg" },
];

interface CountryDropdownProps {
  selectedCountry?: string;
  onCountrySelect: (country: string) => void;
  disabled?: boolean;
}

export const CountryDropdown = ({ selectedCountry, onCountrySelect, disabled = false }: CountryDropdownProps) => {
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

  const handleCountryClick = (country: string) => {
    onCountrySelect(country);
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
          {selectedCountry ? (
            <div className="flex flex-row justify-center items-center gap-1">
              <img
                src={COUNTRY.find(c => c.label === selectedCountry)?.icon || ""}
                alt={selectedCountry}
                className="w-6 h-6 mr-2"
              />

              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Select your country</span>
                <p className="text-text-primary font-semibold">{selectedCountry}</p>
              </div>
            </div>
          ) : (
            <span className="text-text-primary text-[16px]">Select your country</span>
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
            <p className="text-text-secondary text-xs">Select country</p>
          </div>

          <div className="flex flex-col">
            {COUNTRY.map((country, index) => (
              <button
                key={country.value}
                type="button"
                onClick={() => handleCountryClick(country.label)}
                className={`w-full flex items-center gap-1 p-2 rounded-lg hover:bg-app-background transition-colors cursor-pointer ${
                  selectedCountry === country.label ? "bg-app-background" : ""
                }`}
              >
                <img src={country.icon} alt={country.label} className="w-5 h-5 mr-2" />
                <span className="text-text-primary font-semibold">{country.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
