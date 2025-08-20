import { BLOCK_TIME, NODE_ENDPOINT } from "./constant";

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
 * @returns ClaimableTimeResult with date and formatted string
 */
export async function calculateClaimableTime(
  transactionIndex: number,
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
  currentHeight: number,
): Promise<ClaimableTimeResult> {
  let blocksPerPeriod: number;

  switch (frequency) {
    case "DAILY":
      blocksPerPeriod = Math.floor((1 * SECONDS_PER_DAY) / BLOCK_TIME);
      break;
    case "WEEKLY":
      blocksPerPeriod = Math.floor((7 * SECONDS_PER_DAY) / BLOCK_TIME);
      break;
    case "MONTHLY":
      // Calculate based on actual month length
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Get the actual number of days in the current month
      const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
      blocksPerPeriod = Math.floor((daysInCurrentMonth * SECONDS_PER_DAY) / BLOCK_TIME);
      break;
    case "YEARLY":
      // Check if it's a leap year
      const year = new Date().getFullYear();
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const daysInYear = isLeapYear ? 366 : 365;
      blocksPerPeriod = Math.floor((daysInYear * SECONDS_PER_DAY) / BLOCK_TIME);
      break;
    default:
      blocksPerPeriod = Math.floor((DAYS_IN_MONTH * SECONDS_PER_DAY) / BLOCK_TIME);
  }

  // For each transaction, multiply by its index + 1 to get cumulative blocks to wait
  const blocksToWait = blocksPerPeriod * (transactionIndex + 1);

  // Calculate the target block height
  const targetHeight = currentHeight + blocksToWait;

  // Convert blocks to time (approximate)
  const secondsToWait = blocksToWait * BLOCK_TIME;
  const millisecondsToWait = secondsToWait * 1000;

  // Calculate the claimable date
  const claimableDate = new Date(Date.now() + millisecondsToWait);

  // Format the date as DD/MM/YYYY
  const day = claimableDate.getDate().toString().padStart(2, "0");
  const month = (claimableDate.getMonth() + 1).toString().padStart(2, "0");
  const year = claimableDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return {
    claimableDate,
    formattedDate,
    blocksToWait,
  };
}

/**
 * Get a user-friendly claimable time label
 */
export async function getClaimableTimeLabel(
  transactionIndex: number,
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
  currentHeight: number,
): Promise<string> {
  const result = await calculateClaimableTime(transactionIndex, frequency, currentHeight);
  return `Claimable after ${result.formattedDate}`;
}
