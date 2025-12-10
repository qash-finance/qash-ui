"use client";
import React, { useState } from "react";
import { ValidatingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";

interface InvoiceDetails {
  invoiceNumber: string;
  from: {
    name: string;
    company: string;
    address: string;
    email: string;
  };
  billTo: {
    name: string;
    company: string;
    address: string;
    email: string;
  };
  date: string;
  dueDate: string;
  network: string;
  currency: string;
  items: Array<{
    name: string;
    rate: number;
    qty: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  walletAddress: string;
  amountDue: string;
}

const defaultInvoiceData: InvoiceDetails = {
  invoiceNumber: "INV0001",
  from: {
    name: "Jupeng Ng",
    company: "Quantum3labs",
    address: "2464 Royal Ln. Mesa, New Jersey 45463",
    email: "jupeng@quantum3labs.com",
  },
  billTo: {
    name: "Martin Ramos",
    company: "Quantum3labs",
    address: "2464 Royal Ln. Mesa, New Jersey 45463",
    email: "martin@quantum3labs.com",
  },
  date: "05/12/2025",
  dueDate: "07/12/2025",
  network: "Ethereum",
  currency: "USDT",
  items: [
    { name: "Social Post", rate: 300.0, qty: 2, amount: 300.0 },
    { name: "Motion video", rate: 300.0, qty: 1, amount: 300.0 },
    { name: "Login Feature", rate: 100.0, qty: 1, amount: 100.0 },
  ],
  subtotal: 1000.0,
  tax: 0.0,
  total: 1000.0,
  walletAddress: "0xA1B2C3D4E5F67890abcdef1234567890abcdef12",
  amountDue: "1000.0 USDT",
};

export function InvoiceModal({ isOpen, onClose, zIndex }: ModalProp<ValidatingModalProps>) {
  const [invoiceData] = useState<InvoiceDetails>(defaultInvoiceData);

  if (!isOpen) return null;
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-white rounded-xl shadow-lg overflow-y-auto max-h-[90vh] w-[650px]">
        {/* Main Content */}
        <div className="px-12 py-8 flex flex-col gap-6">
          {/* Invoice Header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoiceData.invoiceNumber}</h1>

            {/* From and Bill To Section */}
            <div className="border-b border-t border-gray-200 py-4 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold italic text-gray-500">FROM</p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-900">{invoiceData.from.name}</p>
                  <p className="text-xs italic text-gray-700">{invoiceData.from.company}</p>
                  <p className="text-xs text-gray-600">{invoiceData.from.address}</p>
                  <br />
                  <div className="text-xs text-gray-600 flex flex-col">
                    <span>Email: </span>
                    <span className="font-bold">{invoiceData.billTo.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold italic text-gray-500">BILL TO:</p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-900">{invoiceData.billTo.name}</p>
                  <p className="text-xs italic text-gray-700">{invoiceData.billTo.company}</p>
                  <p className="text-xs text-gray-600">{invoiceData.billTo.address}</p>
                  <br />
                  <div className="text-xs text-gray-600 flex flex-col">
                    <span>Email: </span>
                    <span className="font-bold">{invoiceData.billTo.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Network Info */}
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <span>Date: </span>
                <span className="font-bold">{invoiceData.date}</span>
              </p>
              <p>
                <span>Due Date: </span>
                <span className="font-bold">{invoiceData.dueDate}</span>
              </p>
              <p>
                <span>Network: </span>
                <span className="font-bold">{invoiceData.network}</span>
              </p>
              <p>
                <span>Currency: </span>
                <span className="font-bold">{invoiceData.currency}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-3 bg-gray-100 p-3 rounded-t-lg mb-0">
              <p className="text-xs font-bold text-gray-900">Item</p>
              <p className="text-xs font-bold text-gray-900">Rate</p>
              <p className="text-xs font-bold text-gray-900">Qty</p>
              <p className="text-xs font-bold text-gray-900 text-right">Amount</p>
            </div>

            {invoiceData.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-3 p-3 border-b border-gray-200 items-center"
              >
                <p className="text-xs text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-900">{item.rate.toFixed(1)}</p>
                <p className="text-xs text-gray-900">{item.qty}</p>
                <p className="text-xs text-gray-900 text-right">{item.amount.toFixed(1)}</p>
              </div>
            ))}

            {/* Totals */}
            <div className="space-y-2 p-3 bg-white">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gray-900">SUBTOTAL</p>
                <p className="text-xs text-gray-900">
                  {invoiceData.subtotal.toFixed(1)} {invoiceData.currency}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <p>TAX (0%)</p>
                <p>$0.00</p>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-900">TOTAL</p>
                <p className="text-xs font-bold text-gray-900">
                  {invoiceData.total.toFixed(1)} {invoiceData.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Wallet and Amount Due */}
          <div className="flex justify-between items-start pt-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500">Wallet address</p>
              <p className="text-xs font-bold text-gray-900 font-mono">{invoiceData.walletAddress}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <p className="text-xs text-gray-500">Amount Due</p>
              <p className="text-2xl font-bold text-gray-900">{invoiceData.amountDue}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-12 py-4 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-400">This is a computer generated invoice, doesn't required any signature.</p>
          <img src="/logo/qash-icon.svg" alt="Company Logo" className="w-5" />
        </div>
      </div>
    </BaseModal>
  );
}

export default InvoiceModal;
