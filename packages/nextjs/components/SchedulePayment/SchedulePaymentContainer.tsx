"use client";

import React, { useState } from "react";
import { SchedulePaymentItem, SchedulePaymentItemProps } from "./SchedulePaymentItem";
import StatusCircle from "./StatusCircle";
import { useGetSchedulePayments } from "@/services/api/schedule-payment";
import { SchedulePaymentStatus, SchedulePayment } from "@/types/schedule-payment";
import { useAccountContext } from "@/contexts/AccountProvider";
import { calculateClaimableTime } from "@/services/utils/claimableTime";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { ConsumableNote, TransactionStatus } from "@/types/transaction";

const UpcomingPaymentHeader = () => {
  return (
    <div className="flex flex-col justify-center items-center flex-1 h-fit">
      <article
        className="relative flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60 w-full"
        style={{
          backgroundImage: "url('/schedule-payment/upcoming-payment-background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "0px -10px",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex text-lg font-normal font-['Barlow'] rounded-tl-xl w-[45%] justify-center items-center"
          style={{
            backgroundImage: "url('/schedule-payment/header-container.svg')",
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="text-black font-normal">Next upcoming payment</span>
        </div>
        <div
          className="rounded-[10px] flex justify-center items-center h-[90px] m-2 bg-black"
          style={{
            backgroundImage: "url('/schedule-payment/header-inner-background.svg')",
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Scheduled Payment Card */}
          <div className="flex items-center justify-between overflow-hidden px-4 rounded-[10px] h-full w-full relative">
            {/* Recipient Section */}
            <div className="flex items-center gap-3 z-10">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full bg-center bg-cover"
                style={{
                  backgroundImage: `url('/gift/flower.png')`,
                  backgroundColor: "#06ffb4",
                }}
              />

              {/* Recipient Info */}
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-['Barlow'] text-[#989898] leading-5">Recipient</span>
                <span className="font-['Barlow'] font-medium text-white leading-5">0x23C...11g63</span>
              </div>
            </div>

            {/* Amount and Date Section */}
            <div className="flex flex-col gap-2 items-end z-10">
              {/* Amount */}
              <div className="flex items-center gap-2">
                <img alt="QASH" className="w-5 h-5" src="/token/qash.svg" />
                <span className="font-repetition-scrolling text-white text-2xl tracking-[2.16px]">5,045.09</span>
              </div>

              {/* Date Badge */}
              <div className="bg-[#06ffb4] flex items-center px-3 py-0.5 rounded shadow-[1px_1px_0px_0px_#ffffff]">
                <span className="font-['Barlow'] font-medium text-[#292929] text-xs leading-[18px]">
                  01/08/2025, 09:41
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

const LockedAmountHeader = ({ schedulePayments }: { schedulePayments: any[] | undefined }) => {
  // Calculate total locked amount
  const calculateLockedAmount = () => {
    if (!schedulePayments || schedulePayments.length === 0) return 0;

    return schedulePayments.reduce((total, payment) => {
      if (!payment.transactions || payment.transactions.length === 0) return total;

      const transactionTotal = payment.transactions
        .filter((transaction: any) => transaction.status !== "recalled")
        .reduce((sum: number, transaction: any) => {
          const amount = parseFloat(transaction.assets?.[0]?.amount) || 0;
          return sum + amount;
        }, 0);

      return total + transactionTotal;
    }, 0);
  };

  const lockedAmount = calculateLockedAmount();

  return (
    <div className="flex flex-col justify-center items-center flex-1 h-fit">
      <article
        className="relative flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60 w-full"
        style={{
          backgroundImage: "url('/schedule-payment/locked-amount-background.svg')",
          backgroundSize: "cover",
          backgroundPosition: "0px -10px",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex text-Grey-50 text-lg font-normal font-['Barlow'] rounded-tl-xl w-[40%] justify-center items-center h-fit"
          style={{
            backgroundImage: "url('/schedule-payment/header-container.svg')",
            backgroundSize: "100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="text-black text-lg font-normal">Locked Amount</span>
        </div>
        <div
          className="rounded-[10px]  flex justify-center items-center h-[90px] m-2 bg-black"
          style={{
            backgroundImage: "url('/schedule-payment/header-inner-background.svg')",
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
          }}
        >
          <span className="font-repetition-scrolling text-white text-4xl tracking-[2.16px] flex items-center justify-center gap-2">
            <img alt="QASH" className="w-8 h-8" src="/token/qash.svg" />
            {lockedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </article>
    </div>
  );
};

export const SchedulePaymentContainer = () => {
  const { accountId } = useAccountContext();
  const { data: schedulePayments } = useGetSchedulePayments({
    payer: accountId,
    status: SchedulePaymentStatus.ACTIVE,
  }) as { data: any[] | undefined };
  const blockNum = useMidenSdkStore(state => state.blockNum);

  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [claimableDates, setClaimableDates] = useState<{ [key: string]: string }>({});

  // Calculate progress based on schedule payment creation and frequency
  const calculateTransactionBasedProgress = (
    executionCount: number,
    maxExecutions: number,
    createdAt: string | number,
    frequency: string,
  ): number => {
    try {
      if (maxExecutions === 0) return 0;

      // Calculate how many intervals have passed since creation
      const startDate = new Date(createdAt);
      const now = new Date();

      // Set start date to 12:00 AM of the creation day
      startDate.setHours(0, 0, 0, 0);

      const elapsed = now.getTime() - startDate.getTime();

      // Calculate interval duration based on frequency
      let intervalDuration: number;
      switch (frequency) {
        case "DAILY":
          intervalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          break;
        case "WEEKLY":
          intervalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
          break;
        case "MONTHLY":
          intervalDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
          break;
        case "YEARLY":
          intervalDuration = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds
          break;
        default:
          intervalDuration = 30 * 24 * 60 * 60 * 1000; // Default to monthly
      }

      // How many full intervals have passed since creation
      const intervalsElapsed = Math.floor(elapsed / intervalDuration);

      // Progress within the current interval (0-100%)
      const progressWithinInterval = ((elapsed % intervalDuration) / intervalDuration) * 100;

      // Total progress calculation:
      // - Each interval represents (100 / maxExecutions)% of total progress
      // - The creation is at 0%, first transaction at 100/maxExecutions%, etc.
      const progressPerInterval = 100 / maxExecutions;
      const completedIntervalsProgress = intervalsElapsed * progressPerInterval;
      const currentIntervalProgress = (progressWithinInterval / 100) * progressPerInterval;

      const totalProgress = completedIntervalsProgress + currentIntervalProgress;

      return Math.min(Math.max(0, totalProgress), 100);
    } catch (error) {
      console.error("Error calculating transaction-based progress:", error);
      return 0;
    }
  };

  // Demo: Simulate loading progress
  const startDemo = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 2; // Increase by 2% every 100ms
      });
    }, 100);
  };

  const renderSchedulePaymentItem = () => {
    return schedulePayments?.map(payment => {
      // Calculate total amount for this payment
      const totalAmount = parseFloat(payment.amount) * (payment.maxExecutions || 0);
      const claimedAmount = parseFloat(payment.amount) * (payment.executionCount || 0);

      // Transform transactions to match SchedulePaymentItem props
      const transformedTransactions: SchedulePaymentItemProps["transactions"] = payment.transactions?.map(
        (tx: ConsumableNote, index: number) => {
          // Calculate the scheduled date for each transaction based on frequency and creation date
          const creationDate = new Date(payment.createdAt);
          creationDate.setHours(0, 0, 0, 0); // Set to 12:00 AM

          let scheduledDate = new Date(creationDate);

          // Add intervals based on frequency and transaction index
          switch (payment.frequency) {
            case "DAILY":
              scheduledDate.setDate(creationDate.getDate() + index + 1);
              break;
            case "WEEKLY":
              scheduledDate.setDate(creationDate.getDate() + (index + 1) * 7);
              break;
            case "MONTHLY":
              scheduledDate.setMonth(creationDate.getMonth() + index + 1);
              break;
            case "YEARLY":
              scheduledDate.setFullYear(creationDate.getFullYear() + index + 1);
              break;
            default:
              scheduledDate.setDate(creationDate.getDate() + index + 1);
          }

          const transactionDate = scheduledDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          if (
            tx.timelockHeight &&
            blockNum &&
            tx.timelockHeight <= blockNum &&
            tx.status !== TransactionStatus.RECALLED &&
            tx.status !== TransactionStatus.CONSUMED
          ) {
            return {
              id: tx.id.toString(),
              noteId: tx.noteId,
              date: transactionDate,
              status: "ready_to_claim",
              label: `Txn ${index + 1}`,
              progress: 0, // Progress will be calculated by the main progress bar
              amount: tx.assets[0].amount,
            };
          }

          const result = {
            id: tx.id.toString(),
            noteId: tx.noteId,
            date: transactionDate,
            status: tx.status as TransactionStatus,
            label: `Txn ${index + 1}`,
            progress: 0, // Progress will be calculated by the main progress bar
            amount: tx.assets[0].amount,
          };

          return result;
        },
      );

      return (
        <SchedulePaymentItem
          key={payment.id}
          recipient={{
            address: `${payment.payee.slice(0, 8)}...${payment.payee.slice(-6)}`,
            avatar: blo(turnBechToHex(payment.payee)), // Default avatar
            name: `Recipient ${payment.id}`,
          }}
          totalAmount={totalAmount.toString()}
          claimedAmount={claimedAmount.toString()}
          currency={payment.tokens[0]?.metadata?.symbol || "QASH"}
          progress={calculateTransactionBasedProgress(
            payment.executionCount || 0,
            payment.maxExecutions || 0,
            payment.createdAt || Date.now(),
            payment.frequency,
          )}
          claimProgress={(claimedAmount / totalAmount) * 100}
          transactions={[
            {
              id: `creation`,
              date: new Date(payment.createdAt || Date.now())
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(",", ""),
              status: TransactionStatus.CONSUMED,
              label: "Create",
              progress: 100,
            },
            ...(transformedTransactions || []), // Add null check here
          ]}
        />
      );
    });
  };

  return (
    <div className="flex flex-col justify-start gap-2 p-2 w-full h-full overflow-hidden overflow-y-auto">
      <div className="flex flex-row gap-2">
        <UpcomingPaymentHeader />
        <LockedAmountHeader schedulePayments={schedulePayments} />
      </div>

      {schedulePayments && schedulePayments.length > 0 ? (
        <>{renderSchedulePaymentItem()}</>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-400">No schedule payments found</div>
      )}
    </div>
  );
};
