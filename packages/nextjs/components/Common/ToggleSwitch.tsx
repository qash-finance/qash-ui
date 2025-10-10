"use client";
import React, { useState, useEffect } from "react";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled }) => {
  const [value, setValue] = useState(enabled);

  // Sync internal state with prop changes
  useEffect(() => {
    setValue(enabled);
  }, [enabled]);

  return (
    <button
      type="button"
      className="w-10 h-6 cursor-pointer relative"
      onClick={() => {
        setValue(!value);
        onChange(!value);
      }}
      disabled={disabled}
    >
      <div
        className={`absolute inset-0 ${value ? "bg-primary-blue" : "bg-background border border-primary-divider"} rounded-xl`}
      />
      <div
        className={`absolute top-0 w-6 h-6 transition-all duration-200 ${value ? "translate-x-4" : "translate-x-0"}`}
      >
        <div
          className={`absolute inset-0 ${
            value ? "bg-white border border-primary-blue" : "bg-background border border-primary-divider"
          } rounded-full`}
        />
      </div>
    </button>
  );
};
