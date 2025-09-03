import { SchedulePaymentFrequency } from "@/types/schedule-payment";
import { BLOCK_TIME } from "./constant";

/**
 * Calculate claimable time based on block height and frequency
 * Formula: noteOneClaimmableTime = (30 days / 5 seconds) + current height
 * Where 5 seconds is average block creation time
 *
 * This utility calculates the actual claimable time for scheduled payments,
 * accounting for real month lengths (28/29/30/31 days) and leap years.
 *
 * Example usage:
 * - Monthly payment: Transaction 1 claimable after 31/01/2025 (if January has 31 days)
 * - Monthly payment: Transaction 2 claimable after 28/02/2025 (if February has 28 days)
 * - Yearly payment: Transaction 1 claimable after 31/12/2025 (accounting for leap year)
 */

const DAYS_IN_MONTH = 30; // Base calculation, will be adjusted dynamically
const SECONDS_PER_DAY = 24 * 60 * 60;

export interface ClaimableTimeResult {
  claimableDate: Date;
  formattedDate: string;
  blocksToWait: number;
  timelockHeight: number;
}

/**
 * Calculate the number of days in a specific month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calculate claimable time for a transaction at a given index
 * @param transactionIndex - 0-based index of the transaction
 * @param frequency - Frequency of payments (daily, weekly, monthly, yearly)
 * @param currentHeight - Current block height
 * @param createdAt - When the scheduled payment was created (Date or timestamp)
 * @returns ClaimableTimeResult with date and formatted string
 */
export async function calculateClaimableTime(
  transactionIndex: number,
  frequency: SchedulePaymentFrequency,
  currentHeight: number,
  createdAt: Date | string | number,
): Promise<ClaimableTimeResult> {
  const now = new Date(createdAt);
  let firstClaimableDate: Date;
  let blocksPerPeriod: number;

  // Calculate the next occurrence of the frequency period from creation time
  switch (frequency) {
    case SchedulePaymentFrequency.DAILY:
      blocksPerPeriod = Math.floor((1 * SECONDS_PER_DAY) / BLOCK_TIME);
      // Next 12 AM UTC from creation time
      firstClaimableDate = new Date(now);
      firstClaimableDate.setUTCDate(firstClaimableDate.getUTCDate() + 1);
      firstClaimableDate.setUTCHours(0, 0, 0, 0);
      break;

    case SchedulePaymentFrequency.WEEKLY:
      blocksPerPeriod = Math.floor((7 * SECONDS_PER_DAY) / BLOCK_TIME);
      // Use the same day of week as createdAt
      firstClaimableDate = new Date(now);
      firstClaimableDate.setUTCHours(0, 0, 0, 0);
      // If createdAt is in the future or today, use it. Otherwise, find next occurrence
      if (firstClaimableDate.getTime() < now.getTime()) {
        // Move to next week on the same day
        firstClaimableDate.setUTCDate(firstClaimableDate.getUTCDate() + 7);
      }
      break;

    case SchedulePaymentFrequency.MONTHLY:
      // Calculate based on current month length for blocks per period
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
      blocksPerPeriod = Math.floor((daysInCurrentMonth * SECONDS_PER_DAY) / BLOCK_TIME);

      // Use the same day of month as createdAt
      firstClaimableDate = new Date(now);
      firstClaimableDate.setUTCHours(0, 0, 0, 0);
      // If createdAt is in the future or today, use it. Otherwise, find next occurrence
      if (firstClaimableDate.getTime() < now.getTime()) {
        // Move to next month on the same day
        firstClaimableDate.setUTCMonth(firstClaimableDate.getUTCMonth() + 1);
      }
      break;

    default:
      blocksPerPeriod = Math.floor((DAYS_IN_MONTH * SECONDS_PER_DAY) / BLOCK_TIME);
      // Default to next day 12 AM UTC
      firstClaimableDate = new Date(now);
      firstClaimableDate.setUTCDate(firstClaimableDate.getUTCDate() + 1);
      firstClaimableDate.setUTCHours(0, 0, 0, 0);
  }

  // Calculate the claimable date for this specific transaction index
  let claimableDate: Date;

  if (transactionIndex === 0) {
    // First payment: use the calculated first claimable date
    claimableDate = firstClaimableDate;
  } else {
    // Subsequent payments: add additional periods to the first claimable date
    claimableDate = new Date(firstClaimableDate);

    // Add the appropriate time period based on frequency
    switch (frequency) {
      case SchedulePaymentFrequency.DAILY:
        claimableDate.setUTCDate(claimableDate.getUTCDate() + transactionIndex);
        break;
      case SchedulePaymentFrequency.WEEKLY:
        claimableDate.setUTCDate(claimableDate.getUTCDate() + transactionIndex * 7);
        break;
      case SchedulePaymentFrequency.MONTHLY:
        // Handle month-end edge cases properly
        const targetMonth = new Date(claimableDate);
        targetMonth.setUTCMonth(targetMonth.getUTCMonth() + transactionIndex);

        // If the day doesn't exist in the target month, use the last day of that month
        if (targetMonth.getUTCMonth() !== (claimableDate.getUTCMonth() + transactionIndex) % 12) {
          // Day overflowed, set to last day of intended month
          targetMonth.setUTCMonth(claimableDate.getUTCMonth() + transactionIndex, 0);
        }
        claimableDate = targetMonth;
        break;
      default:
        claimableDate.setUTCDate(claimableDate.getUTCDate() + transactionIndex);
    }
  }

  // Calculate blocks to wait from current height
  const millisecondsToWait = claimableDate.getTime() - Date.now();
  const secondsToWait = Math.max(0, Math.floor(millisecondsToWait / 1000));
  const blocksToWait = Math.ceil(secondsToWait / BLOCK_TIME);

  // Calculate the target block height
  const targetHeight = currentHeight + blocksToWait;

  // Format the date as DD/MM/YYYY
  const day = claimableDate.getDate().toString().padStart(2, "0");
  const month = (claimableDate.getMonth() + 1).toString().padStart(2, "0");
  const year = claimableDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return {
    claimableDate,
    formattedDate,
    blocksToWait,
    timelockHeight: targetHeight,
  };
}

/**
 * Get a user-friendly claimable time label
 */
export async function getClaimableTimeLabel(
  transactionIndex: number,
  frequency: SchedulePaymentFrequency,
  currentHeight: number,
  createdAt: Date | string | number,
): Promise<string> {
  const result = await calculateClaimableTime(transactionIndex, frequency, currentHeight, createdAt);
  return `Claimable after ${result.formattedDate}`;
}
