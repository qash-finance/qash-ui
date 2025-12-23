"use client";
import React, { useState, useEffect, useRef } from "react";
import { InvoiceModalProps, ValidatingModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "01/01/2025";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "01/01/2025";
  }
};

export function InvoiceModal({ isOpen, onClose, zIndex, invoice }: ModalProp<InvoiceModalProps>) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div ref={modalRef} className="bg-white rounded-xl shadow-lg overflow-y-auto max-h-[90vh] w-[650px]">
        {/* Main Content */}
        <div className="px-12 py-8 flex flex-col gap-6">
          {/* Invoice Header */}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>

            {/* From and Bill To Section */}
            <div className="border-b border-t border-gray-200 py-4 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold italic text-gray-500">FROM</p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-900">{invoice.from.name}</p>
                  <p className="text-xs italic text-gray-700">{invoice.from.company}</p>
                  <p className="text-xs text-gray-600">{invoice.from.address}</p>
                  <br />
                  <div className="text-xs text-gray-600 flex flex-col">
                    <span>Email: </span>
                    <span className="font-bold">{invoice.from.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold italic text-gray-500">BILL TO:</p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-gray-900">{invoice.billTo.name}</p>
                  <p className="text-xs italic text-gray-700">{invoice.billTo.company}</p>
                  <p className="text-xs text-gray-600">{invoice.billTo.address}</p>
                  <br />
                  <div className="text-xs text-gray-600 flex flex-col">
                    <span>Email: </span>
                    <span className="font-bold">{invoice.billTo.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Network Info */}
            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <span>Date: </span>
                <span className="font-bold">{formatDate(invoice.date)}</span>
              </p>
              <p>
                <span>Due Date: </span>
                <span className="font-bold">{formatDate(invoice.dueDate)}</span>
              </p>
              <p>
                <span>Network: </span>
                <span className="font-bold">{invoice.network}</span>
              </p>
              <p>
                <span>Currency: </span>
                <span className="font-bold">{invoice.currency}</span>
              </p>
              <p>
                <span>Token: </span>
                <span className="font-bold">{invoice.paymentToken.name}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-3 bg-gray-100 p-3 rounded-t-lg mb-0">
              <p className="text-xs font-bold text-gray-900">Item</p>
              <p className="text-xs font-bold text-gray-900">Price</p>
              <p className="text-xs font-bold text-gray-900">Qty</p>
              <p className="text-xs font-bold text-gray-900 text-right">Amount</p>
            </div>

            {invoice.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-3 p-3 border-b border-gray-200 items-center"
              >
                <p className="text-xs text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-900">{item.rate}</p>
                <p className="text-xs text-gray-900">{item.qty}</p>
                <p className="text-xs text-gray-900 text-right">{item.amount}</p>
              </div>
            ))}

            {/* Totals */}
            <div className="space-y-2 p-3 bg-white">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gray-900">SUBTOTAL</p>
                <p className="text-xs text-gray-900">
                  {invoice.subtotal} {invoice.paymentToken.name}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <p>TAX (0%)</p>
                <p>$0.00</p>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-900">TOTAL</p>
                <p className="text-xs font-bold text-gray-900">
                  {invoice.total} {invoice.paymentToken.name}
                </p>
              </div>
            </div>
          </div>

          {/* Wallet and Amount Due */}
          <div className="flex justify-between items-start pt-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500">Wallet address</p>
              <p className="text-xs font-bold text-gray-900 font-mono">{invoice.walletAddress}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <p className="text-xs text-gray-500">Amount Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoice.amountDue} {invoice.paymentToken.name}
              </p>
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
