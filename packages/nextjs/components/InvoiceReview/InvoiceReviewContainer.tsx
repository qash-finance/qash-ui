"use client";
import React, { useState } from "react";
import { SecondaryButton } from "../Common/SecondaryButton";
import { PrimaryButton } from "../Common/PrimaryButton";
import InvoiceDetail from "./InvoiceDetail";
import InvoicePreview from "./InvoicePreview";

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  amount: number;
  currency: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: {
    name: string;
    email: string;
    company: string;
    address: string;
    network: string;
    token: string;
    walletAddress: string;
  };
  billTo: {
    name: string;
    email: string;
    company: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  amountDue: number;
  currency: string;
}

const InvoiceSuccess = () => {
  return (
    <div className="flex flex-col w-1/2 h-full justify-center items-center gap-3 ">
      <img src="/modal/green-circle-check.gif" alt="Invoice Success" className="w-20" />
      <h2 className="text-4xl font-semibold text-text-primary">Invoice sent successfully</h2>
      <p className="text-base text-text-secondary text-center w-[340px]">
        Send invoice of 1000 USDT has been sent to <span className="text-primary-blue">martin@quantum3labs.com</span>{" "}
        successfully
      </p>
    </div>
  );
};

export const InvoiceReviewContainer = () => {
  const [invoiceData] = useState<InvoiceData>({
    invoiceNumber: "INV0001",
    date: "05/12/2025",
    dueDate: "07/12/2025",
    from: {
      name: "Jupeng Ng",
      email: "jupeng@quantum3labs.com",
      company: "Quantum3labs",
      address: "2464 Royal Ln. Mesa, New Jersey 45463",
      network: "Ethereum",
      token: "USDT",
      walletAddress: "0xA1B2C3D4E5F67890abcdef1234567890abcdef12",
    },
    billTo: {
      name: "Martin Ramos",
      email: "martin@quantum3labs.com",
      company: "Quantum3labs",
      address: "2464 Royal Ln. Mesa, New Jersey 45463",
    },
    items: [
      {
        description: "Consultant Services - (from 14/07/2025 to 01/08/2025)",
        qty: 1,
        price: 1000,
        amount: 1000,
        currency: "USDT",
      },
    ],
    subtotal: 1000,
    total: 1000,
    amountDue: 1000,
    currency: "USDT",
  });

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-y-auto">
      <div className="flex flex-row w-full justify-between items-center px-4 py-3 border-b border-primary-divider">
        <div className="flex flex-row items-center gap-2">
          <img src="/invoice/invoice-icon.svg" alt="Logo" />
          <span className="text-[16px] text-text-primary">Ken Quantum3labs</span>
        </div>

        <div className="flex flex-row items-center gap-2">
          <SecondaryButton
            text="Download PDF"
            onClick={() => {}}
            variant="light"
            buttonClassName="w-[170px]"
            icon="/invoice/download-invoice-icon.svg"
            iconPosition="left"
          />
          <PrimaryButton text="Confirm" onClick={() => {}} containerClassName="w-[170px]" />
        </div>
      </div>

      <div className="flex flex-row w-full">
        <InvoiceDetail {...invoiceData} />
        {/* <InvoiceSuccess /> */}
        <InvoicePreview {...invoiceData} />
      </div>
    </div>
  );
};
