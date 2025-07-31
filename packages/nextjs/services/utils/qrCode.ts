import QRCodeStyling, { Options } from "qr-code-styling";
import { QR_STORAGE_KEY } from "./constant";

export interface CustomQRData {
  id: string;
  name: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount?: string;
  message?: string;
  qrData: string;
  createdAt: number;
}

export const generateQRCode = (data: string): QRCodeStyling => {
  const options: Options = {
    width: 110,
    height: 110,
    type: "svg",
    data: data,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    dotsOptions: {
      type: "extra-rounded",
      color: "white",
    },
    backgroundOptions: {
      color: "black",
    },
  };

  return new QRCodeStyling(options);
};

export const saveQRToLocalStorage = (qrData: Omit<CustomQRData, "id" | "createdAt">): void => {
  try {
    const existingQRs = getQRsFromLocalStorage();
    const newQR: CustomQRData = {
      ...qrData,
      id: generateId(),
      createdAt: Date.now(),
    };

    const updatedQRs = [...existingQRs, newQR];
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(updatedQRs));
  } catch (error) {
    console.error("Error saving QR to localStorage:", error);
  }
};

export const getQRsFromLocalStorage = (): CustomQRData[] => {
  try {
    const stored = localStorage.getItem(QR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading QRs from localStorage:", error);
    return [];
  }
};

export const deleteQRFromLocalStorage = (id: string): void => {
  try {
    const existingQRs = getQRsFromLocalStorage();
    const updatedQRs = existingQRs.filter(qr => qr.id !== id);
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(updatedQRs));
  } catch (error) {
    console.error("Error deleting QR from localStorage:", error);
  }
};

export const generateQRName = (tokenSymbol: string, amount?: string): string => {
  if (amount && parseFloat(amount) > 0) {
    return `${tokenSymbol}_${amount}`;
  }
  return tokenSymbol;
};

export const generateQRData = (tokenAddress: string, amount?: string, message?: string, recipient?: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL("/send", baseUrl);

  // Add payment request parameters
  url.searchParams.set("tokenAddress", tokenAddress);

  if (amount && parseFloat(amount) > 0) {
    url.searchParams.set("amount", amount);
  }

  if (message && message.trim()) {
    url.searchParams.set("message", message.trim());
  }

  if (recipient) {
    url.searchParams.set("recipient", recipient);
  }

  return url.toString();
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Test function to verify URL generation
export const testQRDataGeneration = () => {
  const testUrl = generateQRData("mt1q...", "10.5", "Test payment");
  console.log("Generated QR URL:", testUrl);
  return testUrl;
};
