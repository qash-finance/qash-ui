"use client";
import React from "react";

export const FloatingFooter = ({
  selectedCount,
  actionButtons,
}: {
  selectedCount: number;
  actionButtons: React.ReactNode;
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-[15px] bg-primary-blue flex items-center justify-between pl-5 pr-2 py-2 rounded-full w-[500px]">
        {/* Selected count */}
        <div className="flex items-center">
          <span className="text-white text-sm font-medium tracking-[-0.56px]">Selected ({selectedCount})</span>
        </div>

        {actionButtons}
      </div>
    </div>
  );
};
