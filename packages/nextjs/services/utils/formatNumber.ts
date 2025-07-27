/**
 * Formats a number with commas and handles decimal places
 * @param num The number to format (can be number, string, null, or undefined)
 * @param decimals Number of decimal places to show
 * @param showApproximateZero Whether to show "~0" for very small numbers (default: false)
 * @returns Formatted string with commas and proper decimal handling
 */
export const formatNumberWithCommas = (
  num: number | string | null | undefined,
  decimals: number = 4,
  showApproximateZero: boolean = false,
): string => {
  try {
    // Handle null, undefined, or empty string
    if (num === null || num === undefined || num === "") return "0";

    // Convert string to number if needed
    const parsedNum = typeof num === "string" ? parseFloat(num) : num;

    // Handle invalid input after parsing
    if (parsedNum === undefined || isNaN(parsedNum) || !isFinite(parsedNum)) return "0";

    // Convert to fixed decimal places
    const fixedNum = parsedNum.toFixed(decimals);

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = fixedNum.split(".");

    // Format integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Handle decimal part
    if (decimalPart) {
      // If decimals is 2, preserve trailing zeros
      if (decimals === 2) {
        return `${formattedInteger}.${decimalPart}`;
      }

      // For other decimal places, remove trailing zeros
      const trimmedDecimal = decimalPart.replace(/0+$/, "");
      if (trimmedDecimal === "") {
        return formattedInteger;
      }
      return `${formattedInteger}.${trimmedDecimal}`;
    }

    // If the number is very small and rounds to 0 with the given decimals
    if (parsedNum !== 0 && Math.abs(parsedNum) < Math.pow(10, -decimals)) {
      return showApproximateZero ? "~0" : "0";
    }

    return formattedInteger;
  } catch (error) {
    return "0";
  }
};
