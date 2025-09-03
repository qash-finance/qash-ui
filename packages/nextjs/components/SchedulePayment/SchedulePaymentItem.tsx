"use client";

import React, { useState, useEffect, useRef } from "react";
import { LoadingBar } from "../Common/LoadingBar";
import StatusCircle from "./StatusCircle";
import SchedulePaymentTooltip from "./SchedulePaymentTooltip";
import { CancelPaymentProps, MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { RecallableNoteType, TransactionStatus } from "@/types/transaction";
import { consumeNoteByID } from "@/services/utils/miden/note";
import { useAccountContext } from "@/contexts/AccountProvider";
import toast from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import { useRecallBatch } from "@/services/api/transaction";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import _ from "lodash";

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
  claimProgress: number; // 0-100, calculated from claimedAmount/totalAmount
  transactions: Array<{
    id: string;
    date: string;
    noteId?: string;
    status: TransactionStatus | "ready_to_claim";
    label: string;
    progress?: number; // 0-100, for current status circle
    amount?: string;
    timelockHeight?: number; // Block height when transaction becomes claimable
    recallableTime?: string;
    createdAt?: string;
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

// Function to calculate remaining time until 12:00 AM of the next day
const calculateRemainingTime = (scheduledDate: string): string => {
  try {
    // Parse the scheduled date (format: DD/MM/YYYY)
    const [day, month, year] = scheduledDate.split("/").map(Number);
    if (!day || !month || !year) return "00:00:00";

    // Create date object for the scheduled date at 12:00 AM
    const scheduledDateTime = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Get current date/time
    const now = new Date();

    // Calculate time difference
    const timeDiff = scheduledDateTime.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return "00:00:00"; // Already past the scheduled time
    }

    // Convert to hours, minutes, seconds
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error calculating remaining time:", error);
    return "00:00:00";
  }
};

// Function to format remaining time in a user-friendly way
const formatRemainingTime = (scheduledDate: string): string => {
  try {
    const [day, month, year] = scheduledDate.split("/").map(Number);
    if (!day || !month || !year) return "00:00:00";

    const scheduledDateTime = new Date(year, month - 1, day, 0, 0, 0, 0);
    const now = new Date();
    const timeDiff = scheduledDateTime.getTime() - now.getTime();

    if (timeDiff <= 0) return "00:00:00";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  } catch (error) {
    return "00:00:00";
  }
};

// Function to get the next claimable date for pending transactions
const getNextClaimableDate = (
  transactions: Array<{ id: string; date: string; status: string }>,
  activeId: string | null,
): string => {
  if (!activeId) return "";

  const activeTransaction = transactions.find(t => t.id === activeId);
  if (!activeTransaction || activeTransaction.status !== "pending") return "";

  return activeTransaction.date;
};

// Function to calculate balance: total of all transaction amounts minus consumed ones
const calculateRemainingBalance = (transactions: Array<any>): string => {
  if (!transactions || transactions.length === 0) return "0";

  const totalAmount = transactions.reduce((sum, tx) => {
    const amount = tx.assets?.[0]?.amount || tx.amount || "0";
    return sum + parseFloat(amount);
  }, 0);

  const consumedAmount = transactions.reduce((sum, tx) => {
    if (tx.status === TransactionStatus.CONSUMED) {
      const amount = tx.assets?.[0]?.amount || tx.amount || "0";
      return sum + parseFloat(amount);
    }
    return sum;
  }, 0);

  const balance = totalAmount - consumedAmount;
  return balance.toString();
};

const getStatusText = (status: TransactionStatus | "ready_to_claim") => {
  switch (status) {
    case TransactionStatus.CONSUMED:
      return "Completed";
    case TransactionStatus.PENDING:
      return "In Progress";
    case TransactionStatus.RECALLED:
      return "Cancelled";
    case "ready_to_claim":
      return "Pending Claim";
    default:
      return "Unknown";
  }
};

const StatusIcon: React.FC<{
  status: TransactionStatus | "ready_to_claim";
  progress?: number;
  transaction: any;
  isActive: boolean;
  currency: string;
  id: string;
}> = ({ status, progress, transaction, isActive, currency, id }) => {
  const isClickable = transaction.id !== "creation"; // Create transactions are not clickable

  return (
    <div
      className={`relative z-0 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
      id={id}
      data-tooltip-id="schedule-payment-tooltip"
      data-tooltip-content={transaction.id}
    >
      {/* Status Circle */}
      <div className="relative z-0">
        {status === TransactionStatus.CONSUMED && <StatusCircle progress={100} showCheckIcon={true} />}
        {(status === TransactionStatus.PENDING || status === "ready_to_claim") && (
          <StatusCircle progress={progress || 0} showCheckIcon={false} />
        )}
        {status === TransactionStatus.RECALLED && (
          <img src="/schedule-payment/recalled-status-icon.svg" alt="recalled" className="scale-120" />
        )}
      </div>
    </div>
  );
};

const TransactionInfo: React.FC<{
  date: string;
  status: TransactionStatus | "ready_to_claim";
  label: string;
}> = ({ date, status, label }) => {
  const statusColors = {
    [TransactionStatus.CONSUMED]: "text-[#1e8fff]",
    [TransactionStatus.PENDING]: "text-[#ffd71b]",
    [TransactionStatus.RECALLED]: "text-white",
    ready_to_claim: "text-white",
  };

  const badge = () => {
    if (status === TransactionStatus.RECALLED) {
      return (
        <div className="bg-[#192E4B] rounded-full px-2 py-1 leading-[15px] flex items-center justify-center">
          <span className="text-[#48B3FF]">Cancelled</span>
        </div>
      );
    }
    if (status === TransactionStatus.CONSUMED && label !== "Create") {
      return (
        <div className="bg-[#213E27] rounded-full px-2 py-1 leading-[15px] flex items-center justify-center">
          <span className="text-[#33F55A]">Claimed</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-0.5 w-[125px]">
      <div className={`${CLASSES.flexCenter} w-full gap-1`}>
        <div className={`${CLASSES.barlowMedium} ${CLASSES.text14} leading-[15px] text-white`}>{label}</div>
        {badge()}
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
  claimProgress,
  transactions,
  onClick,
  onHover,
}) => {
  const { accountId } = useAccountContext();
  const { openModal } = useModal();
  const { mutateAsync: recallBatch } = useRecallBatch();
  const blockNum = useMidenSdkStore(state => state.blockNum);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate claim progress if not provided
  const calculatedClaimProgress =
    claimProgress ??
    (() => {
      const claimed = parseFloat(claimedAmount);
      const total = parseFloat(totalAmount);
      return total > 0 ? Math.min(100, (claimed / total) * 100) : 0;
    })();

  // Update remaining time every second
  // useEffect(() => {
  //   const updateRemainingTime = () => {
  //     // Find the first pending transaction to show remaining time
  //     const pendingTransaction = transactions.find(t => t.status === "pending");
  //     if (pendingTransaction?.date) {
  //       setRemainingTime(formatRemainingTime(pendingTransaction.date));
  //     } else {
  //       setRemainingTime("00:00:00");
  //     }
  //   };

  //   // Initial update
  //   updateRemainingTime();

  //   // Update every second
  //   const intervalId = setInterval(updateRemainingTime, 1000);

  //   return () => clearInterval(intervalId);
  // }, [transactions]);

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

  return (
    <div
      ref={containerRef}
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
                onClick={() =>
                  openModal(MODAL_IDS.SCHEDULE_PAYMENT_SIDEBAR, {
                    schedulePaymentData: {
                      recipient,
                      totalAmount,
                      claimedAmount,
                      currency,
                      progress,
                      claimProgress: calculatedClaimProgress,
                      transactions,
                    },
                  })
                }
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
                style={{ width: `${Math.max(1, calculatedClaimProgress)}%` }}
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
                <TransactionInfo date={transaction.date} status={transaction.status} label={transaction.label} />
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
                    id={`status-${transaction.id}`}
                    status={transaction.status}
                    progress={transaction.progress}
                    transaction={transaction}
                    isActive={false}
                    currency={currency}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tooltip
        id="schedule-payment-tooltip"
        clickable
        style={{
          zIndex: 20,
          borderRadius: "12px",
          padding: "0",
        }}
        border="none"
        opacity={1}
        render={({ content }) => {
          if (!content) return null;
          const transactionId = content;
          const transaction = transactions.find(t => t.id === transactionId);
          if (!transaction) return null;

          // Check if cancel should be disabled due to timelock
          // Transaction is timelocked if current time is before recallableTime
          const isTimelocked: boolean = Date.now() < new Date(transaction.recallableTime!).getTime();

          const disabledCancel =
            transaction.status === TransactionStatus.CONSUMED ||
            transaction.status === TransactionStatus.RECALLED ||
            isTimelocked;

          return (
            <SchedulePaymentTooltip
              statusText={getStatusText(transaction.status)}
              sentText={transaction.amount ? `${transaction.amount} ${currency}` : ""}
              dateTimeText={transaction.date || ""}
              balanceText={`${calculateRemainingBalance(transactions)} ${currency}`}
              remainingTimeText={formatRemainingTime(transaction.date || "")}
              disabledCancel={disabledCancel}
              onCancel={() => {
                openModal<CancelPaymentProps>(MODAL_IDS.CANCEL_PAYMENT, {
                  onCancel: async () => {
                    toast.loading("Cancelling payment...");
                    try {
                      const recallingNote = transaction;

                      if (!recallingNote || !recallingNote.noteId) throw new Error("Recalling note not found");
                      console.log("CONSUME BY ID", recallingNote.noteId, accountId);
                      const txId = await consumeNoteByID(accountId, recallingNote.noteId);
                      // recall on server
                      await recallBatch({
                        items: [
                          {
                            type: RecallableNoteType.SCHEDULE_PAYMENT,
                            id: Number(recallingNote?.id),
                          },
                        ],
                        txId: txId,
                      });

                      toast.dismiss();
                      toast.success("Payment cancelled successfully");
                    } catch (error) {
                      console.error("Error cancelling payment:", error);
                      toast.dismiss();
                      toast.error("Failed to cancel payment");
                    }
                  },
                });
              }}
            />
          );
        }}
      />
    </div>
  );
};
