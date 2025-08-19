"use client";

import React, { useState, useEffect } from "react";
import { LoadingBar } from "../Common/LoadingBar";
import StatusCircle from "./StatusCircle";
import SchedulePaymentTooltip from "./SchedulePaymentTooltip";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";

const PADDING = "40px";

export interface SchedulePaymentItemProps {
  recipient: {
    address: string;
    avatar?: string;
    name?: string;
  };
  totalAmount: string;
  claimedAmount: string;
  currency: string;
  progress: number; // 0-100
  transactions: Array<{
    id: string;
    date: string;
    status: "completed" | "current" | "pending";
    label: string;
    progress?: number; // 0-100, for current status circle
  }>;
  onClick?: () => void;
  onHover?: () => void;
}

// Optimized class constants
const CLASSES = {
  barlowMedium: "font-['Barlow:Medium',_sans-serif]",
  barlowRegular: "font-['Barlow:Regular',_sans-serif]",
  text14: "text-[14px]",
  textGray: "text-[#989898]",
  textWhite: "text-white",
  flexCenter: "flex items-center justify-center",
  statusIconBase: "rounded-full w-10 h-10 flex items-center justify-center",
  blurBg: "backdrop-blur-[30px] bg-[rgba(83,83,83,0.45)]",
} as const;

const StatusIcon: React.FC<{
  status: "completed" | "current" | "pending";
  progress?: number;
  transaction: any;
  onClick: (id: string | null, e?: React.MouseEvent) => void;
  isActive: boolean;
  currency: string;
}> = ({ status, progress, transaction, onClick, isActive, currency }) => {
  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "Completed";
      case "current":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const getSentText = () => {
    // Calculate based on progress and total amount
    const totalAmount = 100; // This should come from props
    const sentAmount = Math.round(((progress || 0) / 100) * totalAmount);
    return `${sentAmount} ${currency}`;
  };

  const getBalanceText = () => {
    const totalAmount = 100; // This should come from props
    const sentAmount = progress || 0;
    const remaining = totalAmount - sentAmount;
    return `${remaining} ${currency}`;
  };

  return (
    <div className="relative z-0 cursor-pointer" onClick={e => onClick(transaction.id, e)}>
      {/* Status Circle */}
      <div className="relative z-0">
        {status === "completed" && <StatusCircle progress={100} />}
        {status === "current" && <StatusCircle progress={progress || 60} />}
        {status === "pending" && <StatusCircle progress={0} />}
      </div>
    </div>
  );
};

const TransactionInfo: React.FC<{
  date: string;
  status: "completed" | "current" | "pending";
  label: string;
}> = ({ date, status, label }) => {
  const statusColors = {
    completed: "text-[#1e8fff]",
    current: "text-[#ffd71b]",
    pending: "text-[#7c7c7c]",
  } as const;

  return (
    <div className="flex flex-col items-center gap-0.5 w-[122px]">
      <div className={CLASSES.flexCenter}>
        <div className={`${CLASSES.barlowMedium} ${CLASSES.text14} leading-[17px] ${statusColors[status]}`}>
          {label}
        </div>
      </div>
      <div className={`${CLASSES.barlowMedium} ${CLASSES.text14} ${CLASSES.textGray} text-center leading-[normal]`}>
        {date}
      </div>
    </div>
  );
};

export const SchedulePaymentItem: React.FC<SchedulePaymentItemProps> = ({
  recipient,
  totalAmount,
  claimedAmount,
  currency,
  progress,
  transactions,
  onClick,
  onHover,
}) => {
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const { openModal } = useModal();

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click target is inside the tooltip
      const tooltipElement = document.querySelector('[data-tooltip="true"]');
      if (tooltipElement && tooltipElement.contains(event.target as Node)) {
        return; // Don't close if clicking inside tooltip
      }

      if (activeTransactionId) {
        setActiveTransactionId(null);
      }
    };

    if (activeTransactionId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTransactionId]);

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-5)}`;
  };

  // Calculate spacing for transactions to align with progress bar
  const calculateTransactionSpacing = () => {
    if (transactions.length <= 1) return { gap: 0, containerWidth: 122 };

    const minSpacing = 380; // Minimum 215px between transactions
    const totalSpacing = (transactions.length - 1) * minSpacing;
    const containerWidth = totalSpacing + 122; // Add width for the last transaction

    return {
      gap: minSpacing,
      containerWidth,
    };
  };

  const { gap: transactionGap, containerWidth } = calculateTransactionSpacing();

  const handleStatusIconClick = (transactionId: string | null, e?: React.MouseEvent) => {
    if (transactionId && e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
    // Toggle tooltip - if same transaction is clicked again, hide it
    setActiveTransactionId(activeTransactionId === transactionId ? null : transactionId);
  };

  return (
    <div
      className="bg-[#1e1e1e] rounded-2xl transition-colors duration-200 flex flex-col gap-3 rounded-t-2xl"
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {/* Header Section */}
      <div className="bg-[#292929] px-10 py-2 border-b border-[#3d3d3d] rounded-t-2xl">
        <div className="flex items-center justify-between w-full">
          {/* Recipient Info */}
          <div className="flex items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-[32px] bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {recipient.avatar ? (
                    <img
                      src={recipient.avatar}
                      alt={recipient.name || "Recipient"}
                      className="w-full h-full rounded-[32px] object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  )}
                </div>

                {/* Recipient Details */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`${CLASSES.barlowRegular} ${CLASSES.text14} ${CLASSES.textGray} leading-[20px] tracking-[0.07px]`}
                  >
                    Recipient
                  </div>
                  <div className={`${CLASSES.barlowMedium} ${CLASSES.text14} ${CLASSES.textWhite} leading-[20px]`}>
                    {formatAddress(recipient.address)}
                  </div>
                </div>
              </div>

              {/* Arrow Icon */}
              <img
                src="/schedule-payment/gear.svg"
                alt="gear"
                className="w-full h-full cursor-pointer"
                onClick={() => openModal(MODAL_IDS.SCHEDULE_PAYMENT_SIDEBAR)}
              />
            </div>
          </div>

          {/* Progress Section */}
          <div className="flex flex-col gap-2 w-[264px]">
            <div className="flex items-center justify-between">
              <div
                className={`${CLASSES.barlowRegular} ${CLASSES.text14} ${CLASSES.textGray} leading-[20px] tracking-[0.07px]`}
              >
                Claimed
              </div>
              <div
                className={`flex items-center gap-0.5 ${CLASSES.barlowMedium} ${CLASSES.text14} leading-[20px] tracking-[0.07px]`}
              >
                <span className={CLASSES.textWhite}>{claimedAmount}</span>
                <span className={CLASSES.textGray}>/</span>
                <span className={CLASSES.textGray}>
                  {totalAmount} {currency}
                </span>
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="bg-[#0c0c0c] h-6 rounded p-[6px] flex items-center overflow-hidden">
              <div
                className="bg-gradient-to-l from-[#caffef] to-[#416af9] via-[#6fb2f1] h-full rounded relative transition-all duration-300 ease-out"
                style={{ width: `${Math.max(1, progress)}%` }}
              >
                <div
                  className="absolute bg-[#b5e0ff] blur-[6px] h-10 w-[7.373px] rounded-[32px] -top-1"
                  style={{ right: "-3.686px" }}
                />
                <div
                  className="absolute bg-[#cefffb] h-10 w-[3px] rounded-[32px] top-1/2 -translate-y-1/2"
                  style={{ right: "-1.5px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="flex flex-col items-end w-full overflow-hidden">
        {/* Combined Transaction Info and Status Icons - Horizontal Scrollable */}
        <div className="overflow-x-auto w-full hide-scrollbar" style={{ overflowY: "visible" }}>
          <div className="flex flex-col min-w-fit">
            {/* Transaction Info Row */}
            <div
              className="flex items-center py-0"
              style={{
                paddingLeft: PADDING,
                paddingRight: PADDING,
                justifyContent: transactions.length > 1 ? "space-between" : "flex-start",
                width: `${containerWidth + 80}px`, // Add padding to total width (40px * 2)
              }}
            >
              {transactions.map((transaction, index) => (
                <div key={`info-${transaction.id}`} className="flex-shrink-0 w-[122px] flex justify-center">
                  <TransactionInfo date={transaction.date} status={transaction.status} label={transaction.label} />
                </div>
              ))}
            </div>

            {/* Progress Bar with Status Icons Row */}
            <div
              className="flex items-center py-4 relative"
              style={{
                paddingLeft: PADDING,
                paddingRight: PADDING,
                justifyContent: transactions.length > 1 ? "space-between" : "flex-start",
                width: `${containerWidth + 80}px`, // Add padding to total width (40px * 2)
              }}
            >
              {/* Background Progress Line */}
              <div
                className="absolute h-6 bg-[#292929] rounded-full top-1/2 -translate-y-1/2"
                style={{
                  left: "101px", // Start from center of first transaction (40px + 61px)
                  width: `${containerWidth - 122}px`, // Span to center of last transaction
                }}
              >
                <div className="absolute inset-0 p-[2px] rounded-full">
                  <div
                    className="bg-gradient-to-r from-[#003699] via-[#0059ff] to-[#508dff] h-full rounded-full shadow-[4px_1px_8.1px_0px_rgba(0,0,0,0.61)] transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(5, progress)}%` }}
                  >
                    <div
                      className="absolute inset-0 rounded-full shadow-[0px_-2px_3px_0px_inset_#011d82,0px_2px_5.9px_0px_inset_#73c5ff]"
                      style={{ width: `${Math.max(5, progress)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Icons */}
              {transactions.map((transaction, index) => (
                <div
                  key={`status-${transaction.id}`}
                  className="flex-shrink-0 relative z-10 w-[122px] flex justify-center"
                >
                  <StatusIcon
                    status={transaction.status}
                    progress={transaction.progress}
                    transaction={transaction}
                    onClick={handleStatusIconClick}
                    isActive={activeTransactionId === transaction.id}
                    currency={currency}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Tooltip Overlay - Rendered outside scrollable area */}
      {activeTransactionId && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
        >
          {/* Upward Arrow pointing to StatusIcon */}
          <div
            className="absolute w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#292929]"
            style={{
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />

          <div className="pointer-events-auto" onMouseDown={e => e.stopPropagation()} data-tooltip="true">
            <SchedulePaymentTooltip
              statusText={activeTransactionId ? "In Progress" : "Pending"}
              sentText={`${progress} ${currency}`}
              dateTimeText={transactions.find(t => t.id === activeTransactionId)?.date || ""}
              balanceText={`${100 - progress} ${currency}`}
              remainingTimeText="00:00:00"
              onCancel={() => {
                openModal(MODAL_IDS.CANCEL_PAYMENT);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
