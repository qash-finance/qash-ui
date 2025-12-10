import React from "react";
import { InvoiceData } from "./InvoiceReviewContainer";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

const metaCard = "flex-1 bg-app-background rounded-2xl p-4 flex flex-col gap-1";
const cardBase = "border border-primary-divider rounded-2xl p-6 flex flex-col";
const titleBlue = "text-xl font-semibold text-primary-blue";
const labelClass = "text-sm text-text-secondary";
const valueClass = "text-base font-medium text-text-primary";
const smallValue = "text-sm text-text-primary";
const tokenRow = "flex items-center gap-2";
const editIconClass = "w-5 h-5 cursor-pointer hover:opacity-80";
const itemRow = "flex flex-row gap-2 justify-between items-start";

const InvoiceDetail = (invoiceData: InvoiceData) => {
  const { openModal } = useModal();
  return (
    <div className="flex flex-col w-1/2 px-10 py-8 gap-4">
      {/* Title */}
      <h1 className="text-3xl font-semibold text-text-primary">Invoice details</h1>

      {/* Invoice Meta Information */}
      <div className="flex flex-row gap-3 w-full">
        <div className={metaCard}>
          <p className={labelClass}>Invoice number</p>
          <p className="text-base font-semibold text-text-primary">{invoiceData.invoiceNumber}</p>
        </div>
        <div className={metaCard}>
          <p className={labelClass}>Date</p>
          <p className="text-base font-semibold text-text-primary">{invoiceData.date}</p>
        </div>
        <div className={metaCard}>
          <p className={labelClass}>Due Date</p>
          <p className="text-base font-semibold text-text-primary">{invoiceData.dueDate}</p>
        </div>
      </div>

      {/* From Section */}
      <div className={`${cardBase} gap-2`}>
        <h2 className={titleBlue}>From</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Name</p>
            <p className={valueClass}>{invoiceData.from.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Email</p>
            <p className={valueClass}>{invoiceData.from.email}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Company name</p>
            <p className={valueClass}>{invoiceData.from.company}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Address</p>
            <p className={valueClass}>{invoiceData.from.address}</p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex flex-col gap-2">
              <p className={labelClass}>Network</p>
              <div className={tokenRow}>
                <img src="/chain/ethereum.svg" alt="Ethereum" className="w-6 h-6 rounded-full" />
                <p className="text-sm font-semibold text-text-primary">{invoiceData.from.network}</p>
                <img
                  src="/misc/edit-icon.svg"
                  alt="Edit"
                  className={editIconClass}
                  onClick={() => openModal(MODAL_IDS.SELECT_NETWORK)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className={labelClass}>Token</p>
              <div className={tokenRow}>
                <img src="/token/usdt.svg" alt="USDT" className="w-6 h-6 rounded-full" />
                <p className="text-sm font-semibold text-text-primary">{invoiceData.from.token}</p>
                <img
                  src="/misc/edit-icon.svg"
                  alt="Edit"
                  className={editIconClass}
                  onClick={() => openModal(MODAL_IDS.SELECT_TOKEN)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <p className={labelClass}>Wallet address</p>
            <div className="flex items-center gap-2">
              <p className={smallValue + " truncate"}>{invoiceData.from.walletAddress}</p>
              <img src="/misc/edit-icon.svg" alt="Edit" className={editIconClass + " flex-shrink-0"} />
            </div>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className={`${cardBase} gap-2`}>
        <h2 className={titleBlue}>Bill to</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <p className={labelClass}>Name</p>
            <p className={valueClass}>{invoiceData.billTo.name}</p>
          </div>
          <div className="flex flex-col">
            <p className={labelClass}>Email</p>
            <p className={valueClass}>{invoiceData.billTo.email}</p>
          </div>
          <div className="flex flex-col">
            <p className={labelClass}>Company name</p>
            <p className={valueClass}>{invoiceData.billTo.company}</p>
          </div>
          <div className="flex flex-col">
            <p className={labelClass}>Address</p>
            <p className={valueClass}>{invoiceData.billTo.address}</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className={`${cardBase} gap-6`}>
        <h2 className={titleBlue}>Details</h2>

        {/* Items Table */}
        <div className="flex flex-col gap-4">
          {invoiceData.items.map((item, idx) => (
            <div key={idx} className={itemRow}>
              <div className="flex-1">
                <p className={labelClass}>Item</p>
                <p className={smallValue}>{item.description}</p>
              </div>
              <div className="w-16 text-center">
                <p className={labelClass}>Qty</p>
                <p className={smallValue}>{item.qty}</p>
              </div>
              <div className="w-32 text-right">
                <p className={labelClass}>Price</p>
                <p className={smallValue}>
                  {item.price} {item.currency}
                </p>
              </div>
              <div className="w-32 text-right">
                <p className={labelClass}>Amount</p>
                <p className={smallValue}>
                  {item.amount} {item.currency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex flex-col gap-3 border-t border-primary-divider pt-4">
        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-text-secondary">Subtotal</p>
          <p className="text-base font-semibold text-text-primary">
            {invoiceData.subtotal.toFixed(2)} {invoiceData.currency}
          </p>
        </div>
        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-base font-semibold text-text-primary">
            {invoiceData.total.toFixed(2)} {invoiceData.currency}
          </p>
        </div>
        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-text-secondary">Amount due</p>
          <p className="text-base font-semibold text-text-primary">
            {invoiceData.amountDue.toFixed(2)} {invoiceData.currency}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
