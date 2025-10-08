"use client";
import React from "react";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { PaymentLinkRecord, PaymentLink, PaymentLinkStatus } from "@/types/payment-link";
import { MIDEN_EXPLORER_URL } from "@/services/utils/constant";

interface PaymentLinkActionsTooltipProps {
  link: PaymentLinkRecord;
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

export const ViewOnExplorerTooltip = ({ link }: PaymentLinkActionsTooltipProps) => {
  return (
    <div className="bg-background border border-primary-divider rounded-2xl shadow-lg w-[200px]">
      {/* View on Explorer Button */}
      <TooltipItem
        onClick={() => {
          if (link.txid) {
            window.open(`${MIDEN_EXPLORER_URL}/tx/${link.txid}`, "_blank");
          }
        }}
        isFirst
        isLast
        className={!link.txid ? "opacity-50 cursor-not-allowed" : ""}
      >
        <img src="/misc/globe.svg" alt="explorer" className="w-5 h-5" />
        <span className="text-sm text-text-primary">{link.txid ? "View on Explorer" : "No transaction hash"}</span>
      </TooltipItem>
    </div>
  );
};
