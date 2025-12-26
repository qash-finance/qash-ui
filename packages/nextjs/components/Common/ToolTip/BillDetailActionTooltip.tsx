"use client";
import React from "react";

export interface BatchActionTooltipProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  showDelete?: boolean;
}

const itemStyles = "flex items-center gap-2 px-3 py-3 w-full cursor-pointer hover:bg-app-background transition-colors";

const BillDetailActionTooltip: React.FC<BatchActionTooltipProps> = ({
  onEdit,
  onDuplicate,
  onRemove,
  showDelete = true,
}) => {
  return (
    <div className="bg-background relative rounded-2xl w-50 shadow-sm border border-primary-divider flex flex-col">
      {/* Edit Transaction Button */}
      {/* <button className={`${itemStyles} rounded-t-2xl`} onClick={onEdit}>
        <img src="/misc/copy-icon.svg" alt="edit" className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Copy invoice link</span>
      </button> */}

      {/* Duplicate Transaction Button */}
      {/* <button className={`${itemStyles} ${!showDelete ? "rounded-b-2xl" : ""}`} onClick={onDuplicate}>
        <img src="/misc/download-icon.svg" alt="duplicate" className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Download PDF</span>
      </button> */}

      {/* Remove Transaction Button - Only show if showDelete is true */}
      {showDelete && (
        <button className={`${itemStyles} rounded-b-2xl`} onClick={onRemove}>
          <img src="/misc/trashcan-icon.svg" alt="remove" className="w-5 h-5" />
          <span className="font-medium text-sm text-red-500 whitespace-nowrap">Delete invoice</span>
        </button>
      )}
    </div>
  );
};

export default BillDetailActionTooltip;
