"use client";

import React, { useState, useEffect } from "react";
import { SchedulePaymentItem } from "./SchedulePaymentItem";
import StatusCircle from "./StatusCircle";
import { useGetSchedulePayments } from "@/services/api/schedule-payment";
import { SchedulePaymentStatus, SchedulePayment } from "@/types/schedule-payment";
import { useAccountContext } from "@/contexts/AccountProvider";
import { calculateClaimableTime } from "@/services/utils/claimableTime";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { NODE_ENDPOINT } from "@/services/utils/constant";

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
      const amount = parseFloat(payment.amount) || 0;
      const maxExecutions = payment.maxExecutions || 0;
      const executionCount = payment.executionCount || 0;
      const remainingExecutions = Math.max(0, maxExecutions - executionCount);

      return total + amount * remainingExecutions;
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
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [claimableDates, setClaimableDates] = useState<{ [key: string]: string }>({});

  // Calculate time-based progress relative to createdAt
  const calculateTimeBasedProgress = (createdAt: string | number, frequency: string): number => {
    try {
      const startDate = new Date(createdAt);
      const now = new Date();
      const elapsed = now.getTime() - startDate.getTime();

      // Calculate total duration based on frequency
      let totalDuration: number;
      switch (frequency) {
        case "DAILY":
          totalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          break;
        case "WEEKLY":
          totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
          break;
        case "MONTHLY":
          totalDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
          break;
        case "YEARLY":
          totalDuration = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds
          break;
        default:
          totalDuration = 30 * 24 * 60 * 60 * 1000; // Default to monthly
      }

      // Calculate progress percentage
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
      return Math.max(0, progressPercent);
    } catch (error) {
      console.error("Error calculating time-based progress:", error);
      return 0;
    }
  };

  // Calculate claimable dates for all pending transactions
  useEffect(() => {
    if (!schedulePayments?.length) return;

    const calculateDates = async () => {
      const { WebClient } = await import("@demox-labs/miden-sdk");

      const client = await WebClient.createClient(NODE_ENDPOINT);
      const currentHeight = await client.getSyncHeight();
      const dateMap: { [key: string]: string } = {};

      for (const payment of schedulePayments) {
        for (let i = 0; i < payment.transactions.length; i++) {
          if (i >= payment.executionCount) {
            const result = await calculateClaimableTime(i, payment.frequency, currentHeight);
            dateMap[`${payment.id}-${i}`] = result.formattedDate;
          }
        }
      }

      setClaimableDates(dateMap);
    };

    calculateDates();
  }, [schedulePayments]);

  // Real-time progress updates
  useEffect(() => {
    if (!schedulePayments?.length) return;

    const interval = setInterval(() => {
      setProgress(prev => prev + 0.1);
    }, 60 * 1000); // update every minute

    return () => clearInterval(interval);
  }, [schedulePayments]);

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

  return (
    <div className="flex flex-col justify-start gap-2 p-2 w-full h-full overflow-hidden overflow-y-auto">
      <div className="flex flex-row gap-2">
        <UpcomingPaymentHeader />
        <LockedAmountHeader schedulePayments={schedulePayments} />
      </div>

      {schedulePayments && schedulePayments.length > 0 ? (
        schedulePayments.map(payment => {
          // Calculate total amount for this payment
          const totalAmount = parseFloat(payment.amount) * (payment.maxExecutions || 0);
          const claimedAmount = parseFloat(payment.amount) * (payment.executionCount || 0);

          // Transform transactions to match SchedulePaymentItem props
          const transformedTransactions =
            payment.transactions?.map((tx: any, index: number) => {
              // For pending transactions, use pre-calculated claimable date or fallback
              const claimableKey = `${payment.id}-${index}`;
              const transactionDate = claimableDates[claimableKey];

              return {
                id: tx.id.toString(),
                date: transactionDate,
                status: tx.status,
                label: `Txn ${index + 1}`,
                progress: 0, // Ignoring progress for now as requested
                amount: tx.assets[0].amount,
              };
            }) || [];

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
              progress={calculateTimeBasedProgress(payment.createdAt || Date.now(), payment.frequency)}
              claimProgress={(claimedAmount / totalAmount) * 100}
              transactions={[
                {
                  id: `create-${payment.id}`,
                  date: new Date(payment.createdAt || Date.now())
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .replace(",", ""),
                  status: "completed" as const,
                  label: "Create",
                  progress: 100,
                },
                ...transformedTransactions,
              ]}
            />
          );
        })
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-400">No schedule payments found</div>
      )}
    </div>
  );
};
