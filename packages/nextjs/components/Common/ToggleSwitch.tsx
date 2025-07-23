"use client";
import * as React from "react";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      className={`${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } flex flex-col items-start w-10 rounded-md border-2 border-solid shadow-sm transition-colors ${
        enabled ? "bg-blue-500 border-blue-400" : "bg-zinc-100 border-zinc-300"
      }`}
      aria-pressed={enabled}
      role="switch"
    >
      <div
        className={`flex shrink-0 gap-1 w-5 h-4 rounded-md shadow transition-transform ${
          enabled ? "bg-white translate-x-4" : "bg-zinc-400 translate-x-0"
        }`}
      />
    </button>
  );
};
