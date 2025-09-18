"use client";

import React, { useState } from "react";
import { SchedulePaymentItem, SchedulePaymentItemProps } from "./SchedulePaymentItem";
import { useGetSchedulePayments } from "@/services/api/schedule-payment";
import { SchedulePaymentStatus, SchedulePayment } from "@/types/schedule-payment";
import { useAccountContext } from "@/contexts/AccountProvider";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { ConsumableNote, TransactionStatus } from "@/types/transaction";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";

const UpcomingPaymentHeader = ({ schedulePayments }: { schedulePayments: any[] | undefined }) => {
  // Find the next upcoming payment
  const getNextUpcomingPayment = () => {
    if (!schedulePayments || schedulePayments.length === 0) return null;

    const now = new Date();
    const upcomingPayments: Array<{
      payment: any;
      nextDate: Date;
      amount: number;
    }> = [];

    schedulePayments.forEach(payment => {
      if (!payment.transactions || payment.transactions.length === 0) return;

      // Find the next unclaimed transaction for this payment
      const nextTransaction = payment.transactions.find((tx: any) => {
        if (tx.status === "recalled" || tx.status === "consumed") return false;

        // Calculate the scheduled date for this transaction
        const creationDate = new Date(payment.createdAt);
        creationDate.setHours(0, 0, 0, 0);

        let scheduledDate = new Date(creationDate);
        const txIndex = payment.transactions.indexOf(tx);

        switch (payment.frequency) {
          case "DAILY":
            scheduledDate.setDate(creationDate.getDate() + txIndex + 1);
            break;
          case "WEEKLY":
            scheduledDate.setDate(creationDate.getDate() + (txIndex + 1) * 7);
            break;
          case "MONTHLY":
            scheduledDate.setMonth(creationDate.getMonth() + txIndex + 1);
            break;
          case "YEARLY":
            scheduledDate.setFullYear(creationDate.getFullYear() + txIndex + 1);
            break;
          default:
            scheduledDate.setDate(creationDate.getDate() + txIndex + 1);
        }

        return scheduledDate > now;
      });

      if (nextTransaction) {
        const creationDate = new Date(payment.createdAt);
        creationDate.setHours(0, 0, 0, 0);

        let scheduledDate = new Date(creationDate);
        const txIndex = payment.transactions.indexOf(nextTransaction);

        switch (payment.frequency) {
          case "DAILY":
            scheduledDate.setDate(creationDate.getDate() + txIndex + 1);
            break;
          case "WEEKLY":
            scheduledDate.setDate(creationDate.getDate() + (txIndex + 1) * 7);
            break;
          case "MONTHLY":
            scheduledDate.setMonth(creationDate.getMonth() + txIndex + 1);
            break;
          case "YEARLY":
            scheduledDate.setFullYear(creationDate.getFullYear() + txIndex + 1);
            break;
          default:
            scheduledDate.setDate(creationDate.getDate() + txIndex + 1);
        }

        upcomingPayments.push({
          payment,
          nextDate: scheduledDate,
          amount: parseFloat(nextTransaction.assets?.[0]?.amount) || 0,
        });
      }
    });

    if (upcomingPayments.length === 0) return null;

    // Group payments by date and find the one with largest amount for each date
    const paymentsByDate = upcomingPayments.reduce(
      (acc, item) => {
        const dateKey = item.nextDate.toDateString();
        if (!acc[dateKey] || acc[dateKey].amount < item.amount) {
          acc[dateKey] = item;
        }
        return acc;
      },
      {} as Record<string, (typeof upcomingPayments)[0]>,
    );

    // Find the earliest date
    const earliestDate = Object.keys(paymentsByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

    const result = earliestDate ? paymentsByDate[earliestDate] : null;

    return result;
  };

  const nextPayment = getNextUpcomingPayment();

  if (!nextPayment) {
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
            <div className="text-center text-gray-400">
              <span className="font-['Barlow'] text-sm">No upcoming payments</span>
            </div>
          </div>
        </article>
      </div>
    );
  }

  const { payment, nextDate, amount } = nextPayment;

  // Safely extract recipient address with fallback
  const recipientAddress =
    payment.payee && payment.payee.length > 14
      ? `${payment.payee.slice(0, 8)}...${payment.payee.slice(-6)}`
      : payment.payee || "Unknown";

  const tokenSymbol = payment.tokens?.[0]?.metadata?.symbol || "QASH";

  // Safely format date with fallback
  let formattedDate = "Unknown";
  let formattedTime = "Unknown";

  try {
    formattedDate = nextDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    formattedTime = nextDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
  }

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
              <img
                src={payment.payee ? blo(turnBechToHex(payment.payee)) : "/gift/flower.png"}
                alt="Recipient"
                className="w-10 h-10 rounded-full bg-cover"
                onError={e => {
                  // Fallback to default avatar if blo fails
                  (e.target as HTMLImageElement).src = "/gift/flower.png";
                }}
              />

              {/* Recipient Info */}
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-['Barlow'] text-[#989898] leading-5">Recipient</span>
                <span className="font-['Barlow'] font-medium text-white leading-5">{recipientAddress}</span>
              </div>
            </div>

            {/* Amount and Date Section */}
            <div className="flex flex-col gap-2 items-end z-10">
              {/* Amount */}
              <div className="flex items-center gap-2">
                <img
                  alt={tokenSymbol}
                  className="w-5 h-5"
                  src={
                    payment.tokens?.[0]?.faucetId === QASH_TOKEN_ADDRESS
                      ? "/token/qash.svg"
                      : `/token/${tokenSymbol.toLowerCase()}.svg`
                  }
                  onError={e => {
                    // Fallback to any-token.svg if the specific token icon doesn't exist
                    (e.target as HTMLImageElement).src = "/token/any-token.svg";
                  }}
                />
                <span className="font-repetition-scrolling text-white text-2xl tracking-[2.16px]">
                  {isNaN(amount)
                    ? "0.00"
                    : amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Date Badge */}
              <div className="bg-[#06ffb4] flex items-center px-3 py-0.5 rounded shadow-[1px_1px_0px_0px_#ffffff]">
                <span className="font-['Barlow'] font-medium text-[#292929] text-xs leading-[18px]">
                  {formattedDate}, {formattedTime}
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

  console.log("schedulePayments", schedulePayments);

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

          // Calculate time until recallable and progress
          const now = Date.now();
          const recallableTime = new Date(tx.recallableTime!).getTime();
          const createdAt = new Date(tx.createdAt!).getTime();
          const totalTimeToRecall = recallableTime - createdAt;

          // Calculate progress: 0% when created, 100% when recallable
          const elapsedTime = now - createdAt;
          const progress = Math.min(100, Math.max(0, (elapsedTime / totalTimeToRecall) * 100));

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
              progress: progress,
              amount: tx.assets[0].amount,
              timelockHeight: tx.timelockHeight,
              recallableTime: tx.recallableTime,
              createdAt: tx.createdAt,
            };
          }

          const result = {
            id: tx.id.toString(),
            noteId: tx.noteId,
            date: transactionDate,
            status: tx.status as TransactionStatus,
            label: `Txn ${index + 1}`,
            progress: progress,
            amount: tx.assets[0].amount,
            timelockHeight: tx.timelockHeight,
            recallableTime: tx.recallableTime,
            createdAt: tx.createdAt,
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
        <UpcomingPaymentHeader schedulePayments={schedulePayments} />
        <LockedAmountHeader schedulePayments={schedulePayments} />
      </div>

      <div className="flex w-full">
        <span className="text-white">All Recurring Transfers ({schedulePayments?.length || 0})</span>
      </div>

      {schedulePayments && schedulePayments.length > 0 ? (
        <>{renderSchedulePaymentItem()}</>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <img src="/schedule-payment/empty-schedule-payment-icon.svg" alt="Empty State" className="scale-100" />
          <span className="text-white">You haven’t created any transactions yet.</span>
        </div>
      )}
    </div>
  );
};
