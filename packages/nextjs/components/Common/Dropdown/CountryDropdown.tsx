"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

const COUNTRY = [
  // North America / Europe
  { value: "US", label: "United States", icon: "/flag/us.svg" },
  { value: "UK", label: "United Kingdom", icon: "/flag/uk.svg" },

  // Southeast Asia (SEA)
  { value: "VN", label: "Vietnam", icon: "/flag/vn.svg" },
  { value: "SG", label: "Singapore", icon: "/flag/sg.svg" },
  { value: "MY", label: "Malaysia", icon: "/flag/my.svg" },
  { value: "ID", label: "Indonesia", icon: "/flag/id.svg" },
  { value: "PH", label: "Philippines", icon: "/flag/ph.svg" },
  { value: "TH", label: "Thailand", icon: "/flag/th.svg" },

  // Latin America (LATAM)
  { value: "MX", label: "Mexico", icon: "/flag/mx.svg" },
  { value: "BR", label: "Brazil", icon: "/flag/br.svg" },
  { value: "AR", label: "Argentina", icon: "/flag/ar.svg" },
  { value: "CO", label: "Colombia", icon: "/flag/co.svg" },
  { value: "CL", label: "Chile", icon: "/flag/cl.svg" },

  // Africa
  { value: "ZA", label: "South Africa", icon: "/flag/za.svg" },
  { value: "NG", label: "Nigeria", icon: "/flag/ng.svg" },
  { value: "KE", label: "Kenya", icon: "/flag/ke.svg" },
  { value: "GH", label: "Ghana", icon: "/flag/gh.svg" },
  { value: "EG", label: "Egypt", icon: "/flag/eg.svg" },
];

interface CountryDropdownProps {
  selectedCountry?: string;
  onCountrySelect: (country: string) => void;
  disabled?: boolean;
  variant?: "outlined" | "filled";
  size?: "default" | "compact";
}

export const CountryDropdown = ({
  selectedCountry,
  onCountrySelect,
  disabled = false,
  variant = "outlined",
  size = "default",
}: CountryDropdownProps) => {
  const containerStyle = useMemo(() => {
    const baseStyle = variant === "outlined"
      ? "border border-primary-divider rounded-xl bg-transparent"
      : "bg-app-background border-b-2 border-primary-divider rounded-xl";
    const heightStyle = size === "compact" ? "h-[52px]" : "h-[64px]";
    return `${baseStyle} ${heightStyle}`;
  }, [variant, size]);

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
        className={`flex items-center gap-2 px-4 py-2 w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-between ${containerStyle}`}
        disabled={disabled}
      >
        <div className="flex flex-row items-center gap-2">
          {selectedCountry && (
            <img
              src={COUNTRY.find(c => c.label === selectedCountry)?.icon || ""}
              alt={selectedCountry}
              className={`${size === "compact" ? "w-5 h-5" : "w-6 h-6"} flex-shrink-0`}
            />
          )}
          <div className="flex flex-col justify-center">
            <span className={`text-text-secondary ${size === "compact" ? "text-[12px]" : "text-[14px]"}`}>
              Select country
            </span>
            {selectedCountry && (
              <p className={`text-text-primary font-semibold ${size === "compact" ? "text-[14px]" : "text-[16px]"}`}>
                {selectedCountry}
              </p>
            )}
          </div>
        </div>

        <img
          src="/arrow/chevron-down.svg"
          alt="dropdown"
          className={`w-6 h-6 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
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
