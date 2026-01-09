"use client";
import React from "react";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { PaymentLink, PaymentLinkStatus } from "@/types/payment-link";

interface PaymentLinkActionsTooltipProps {
  link: PaymentLink;
  onEdit?: () => void;
  onToggleStatus?: (isActive: boolean) => void;
  onRemove?: () => void;
}

const TooltipItem = ({
  children,
  onClick,
  className = "",
  isFirst = false,
  isLast = false,
  isActive = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
  isActive?: boolean;
}) => (
  <div
    className={`
      flex items-center gap-2 px-3 py-3 w-full cursor-pointer 
      transition-colors duration-200
      ${isFirst ? "rounded-t-2xl" : ""}
      ${isLast ? "rounded-b-2xl" : ""}
      ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
);

export const PaymentLinkActionsTooltip = ({
  link,
  onEdit,
  onToggleStatus,
  onRemove,
}: PaymentLinkActionsTooltipProps) => {
  const isActive = link.status === PaymentLinkStatus.ACTIVE;

  return (
    <div className="bg-background border border-primary-divider rounded-2xl shadow-lg w-[200px]">
      {/* Edit Button */}
      <TooltipItem onClick={onEdit} isFirst>
        <img src="/misc/edit-icon.svg" alt="edit" className="w-5 h-5" />
        <span className="text-sm text-text-primary">Edit payment link</span>
      </TooltipItem>

      {/* Toggle Status */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <img src="/misc/lightning-bolt-icon.svg" alt="toggle" className="w-5 h-5" />
          <span className="text-sm text-text-primary">Active</span>
        </div>
        <ToggleSwitch enabled={isActive} onChange={enabled => onToggleStatus?.(enabled)} />
      </div>

      {/* Remove Button */}
      <div className="border-t w-full border-primary-divider">
        <TooltipItem onClick={onRemove} isLast>
          <img src="/misc/trashcan-icon.svg" alt="trash" className="w-5 h-5" />
          <span className="text-sm text-[#E93544]">Remove</span>
        </TooltipItem>
      </div>
    </div>
  );
};
