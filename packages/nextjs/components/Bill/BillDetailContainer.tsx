"use client";
import React from "react";
import BillDetailActionTooltip from "./BillDetailActionTooltip";
import { Tooltip } from "react-tooltip";
import { Badge, BadgeStatus } from "../Common/Badge";
import { SecondaryButton } from "../Common/SecondaryButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  amount: number;
}

interface InvoiceDetailsData {
  createdOn: string;
  invoiceAmount: string;
  issuedDate: string;
  dueDate: string;
  group: string;
  from: {
    name: string;
    company: string;
    email: string;
  };
  billedTo: {
    name: string;
    company: string;
    email: string;
  };
  paymentMethod: string;
  items: InvoiceItem[];
  subtotal: number;
  amountDue: number;
}

const defaultInvoiceData: InvoiceDetailsData = {
  createdOn: "Nov 10, 2025",
  invoiceAmount: "550.00 USDT",
  issuedDate: "Nov 10 2025",
  dueDate: "Nov 17 2025",
  group: "Employee",
  from: {
    name: "Jupeng",
    company: "Quantum3labs",
    email: "jupengng@gmail.com",
  },
  billedTo: {
    name: "Martin",
    company: "Quantum3labs",
    email: "akshatsamar@gmail.com",
  },
  paymentMethod: "USDT (Ethereum)",
  items: [
    { name: "Qash Login Feature", qty: 2, price: 100.0, amount: 200.0 },
    { name: "Qash Pitchdeck", qty: 1, price: 50.0, amount: 50.0 },
    { name: "Social Post", qty: 3, price: 100.0, amount: 300.0 },
  ],
  subtotal: 550.0,
  amountDue: 550.0,
};

const BillDetailContainer = () => {
  const { openModal } = useModal();
  const data = defaultInvoiceData;

  // Action handlers for invoice menu
  const handleCopyInvoiceLink = () => {
    console.log("Copy invoice link clicked");
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked");
  };

  const handleDeleteInvoice = () => {
    console.log("Delete invoice clicked");
  };

  return (
    <div className="flex flex-col w-full h-full px-10 py-5 gap-6 bg-background">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] leading-none text-text-secondary">INV0001 Jupeng</span>
          <div className="flex flex-row gap-5 items-center">
            <span className="text-xl leading-none font-bold text-text-primary">Invoice INV0001</span>
            <Badge text="PAID" status={BadgeStatus.AWAITING} />
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <SecondaryButton
            text="Pay Invoice"
            buttonClassName="w-[150px]"
            icon="/misc/coin-icon.svg"
            iconPosition="left"
          />
          <SecondaryButton
            text="View invoice PDF"
            variant="light"
            buttonClassName="w-[160px]"
            icon="/misc/eye-icon.svg"
            iconPosition="left"
            onClick={() => openModal(MODAL_IDS.INVOICE_MODAL)}
          />
          <img
            src="/misc/three-dot-icon.svg"
            alt=""
            data-tooltip-id="bill-detail-action-tooltip"
            data-tooltip-content="0"
            className="w-6 cursor-pointer"
          />
        </div>
      </div>

      {/* Bill Detail Action Tooltip */}
      <Tooltip
        id="bill-detail-action-tooltip"
        clickable
        style={{
          zIndex: 20,
          borderRadius: "16px",
          padding: "0",
        }}
        place="left"
        openOnClick
        noArrow
        border="none"
        opacity={1}
        render={() => {
          return (
            <BillDetailActionTooltip
              onEdit={handleCopyInvoiceLink}
              onDuplicate={handleDownloadPDF}
              onRemove={handleDeleteInvoice}
            />
          );
        }}
      />

      <div className="w-full h-full flex flex-row gap-10">
        <div className="flex-1 flex-col w-full h-full">
          {/* Invoice Details Cards */}
          <div className="flex flex-row gap-3 w-full">
            {/* First Card - Invoice Details */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 flex gap-8">
              <div className="flex flex-col gap-2 w-24">
                <p className="text-sm text-gray-500 font-medium">Created on</p>
                <p className="text-sm text-gray-500 font-medium">Invoice amount</p>
                <p className="text-sm text-gray-500 font-medium">Issued date</p>
                <p className="text-sm text-gray-500 font-medium">Due date</p>
                <p className="text-sm text-gray-500 font-medium">Group</p>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <p className="text-sm text-gray-900 font-medium">{data.createdOn}</p>
                <div className="flex items-center gap-2">
                  <img src="/token/usdt-icon.svg" alt="USDT" className="w-5 h-5" />
                  <p className="text-sm text-gray-900 font-medium">{data.invoiceAmount}</p>
                </div>
                <p className="text-sm text-gray-900 font-medium">{data.issuedDate}</p>
                <p className="text-sm text-gray-900 font-medium">{data.dueDate}</p>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full w-fit">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                  <p className="text-xs text-blue-600 font-medium">{data.group}</p>
                </div>
              </div>
            </div>

            {/* Second Card - From/Billed To */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">From</p>
                </div>
                <div className="flex flex-col gap-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {data.from.name} <span className="text-gray-500">({data.from.company})</span>
                  </p>
                  <p className="text-sm text-blue-600 font-medium">{data.from.email}</p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Billed to</p>
                </div>
                <div className="flex flex-col gap-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {data.billedTo.name} <span className="text-gray-500">({data.billedTo.company})</span>
                  </p>
                  <p className="text-sm text-blue-600 font-medium">{data.billedTo.email}</p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Default method</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/token/usdt-icon.svg" alt="USDT" className="w-5 h-5" />
                  <p className="text-sm text-gray-900 font-medium">{data.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-medium text-text-primary">Summary</h2>

            {/* Summary Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Item details</p>
                <p className="text-sm text-gray-600 font-medium text-center">Qty</p>
                <p className="text-sm text-gray-600 font-medium text-right">Price</p>
                <p className="text-sm text-gray-600 font-medium text-right">Amount</p>
              </div>

              {/* Items */}
              {data.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 border-b border-gray-200"
                >
                  <p className="text-sm text-gray-900 font-medium">{item.name}</p>
                  <p className="text-sm text-gray-900 font-medium text-center">{item.qty}</p>
                  <p className="text-sm text-gray-900 font-medium text-right">{item.price.toFixed(2)} USDT</p>
                  <p className="text-sm text-gray-900 font-medium text-right">{item.amount.toFixed(2)} USDT</p>
                </div>
              ))}

              {/* Subtotal */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 border-b border-gray-200">
                <div />
                <div />
                <p className="text-sm text-gray-900 font-medium text-right">Subtotal</p>
                <p className="text-base text-gray-900 font-semibold text-right">{data.subtotal.toFixed(2)} USDT</p>
              </div>

              {/* Amount Due */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 bg-blue-50">
                <div />
                <div />
                <p className="text-sm text-gray-900 font-medium text-right">Amount due</p>
                <p className="text-base text-gray-900 font-semibold text-right">{data.amountDue.toFixed(2)} USDT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="w-80 flex flex-col gap-3">
          <h2 className="text-2xl font-medium text-text-primary">Timeline</h2>

          <div className="border border-primary-divider rounded-2xl px-2 py-6 flex-1">
            <div className="px-4 flex flex-col gap-3">
              {/* Timeline Items */}
              {[
                { label: "Invoice created", date: "Nov 10, 2025 10:31 AM" },
                { label: "Invoice created", date: "Nov 10, 2025 10:31 AM" },
                // Add more timeline items here as needed
              ].map((item, idx, arr) => (
                <div className="flex gap-7 pb-6" key={idx}>
                  {/* Timeline Marker with Polygon and Vertical Line */}
                  <div className="flex flex-col items-center pt-1 relative">
                    <img src="/misc/blue-polygon.svg" alt="Timeline Marker" className="w-6 h-6 z-10" />
                    {/* Vertical Line (not for first item) */}
                    {idx !== 0 && (
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2"
                        style={{ height: 75, width: 4, background: "#066EFF", zIndex: 0, marginTop: -50 }}
                      />
                    )}
                  </div>
                  {/* Timeline Content */}
                  <div className="flex flex-col gap-1.5 w-40">
                    <p className="text-sm font-semibold text-text-primary leading-none">{item.label}</p>
                    <p className="text-sm font-medium text-text-secondary leading-none">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailContainer;
