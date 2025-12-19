"use client";
import React from "react";
import { CustomCheckbox } from "../Common/CustomCheckbox";

export const FloatingAction = ({
  selectedCount,
  actionButtons,
  onDeselectAll,
  allSelected = false,
}: {
  selectedCount: number;
  actionButtons: React.ReactNode;
  onDeselectAll?: () => void;
  allSelected?: boolean;
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="absolute bottom-1/9 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-[15px] bg-primary-blue flex items-center justify-between px-2 py-2 rounded-full  w-160">
        {/* Deselect all button */}
        <button
          onClick={onDeselectAll}
          className="bg-background rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer"
          style={{
            backgroundColor: "var(--bg-surface-white, #ffffff)",
            borderColor: "var(--stroke-sub-700, rgba(153,160,174,0.24))",
          }}
          aria-label="Deselect all"
        >
          <CustomCheckbox checked={allSelected} onChange={() => {}} />
          <span
            className="text-sm font-medium leading-5 tracking-[-0.56px] whitespace-nowrap"
            style={{
              color: "var(--text-strong-950, #1b1b1b)",
            }}
          >
            Deselect all ({selectedCount})
          </span>
        </button>

        {/* Total count */}
        <div className="text-xl text-white">Total ({selectedCount} transactions)</div>

        {/* Action buttons */}
        <div className="flex gap-2 items-center">{actionButtons}</div>
      </div>
    </div>
  );
};
