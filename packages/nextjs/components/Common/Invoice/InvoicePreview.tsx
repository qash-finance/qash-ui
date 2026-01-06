import React from "react";
import { InvoiceData } from "../../InvoiceReview/EmployeeInvoiceReviewContainer";

const PreviewCard = ({
  name,
  email,
  company,
  address,
  isFrom,
}: {
  name: string;
  email: string;
  company: string;
  address: string;
  isFrom: boolean;
}) => {
  return (
    <div className="flex-1 border border-primary-divider rounded-2xl p-5 flex flex-col gap-4">
      <p className="font-medium text-text-secondary">{isFrom ? "FROM" : "BILL TO"}</p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-semibold text-text-primary">{name}</p>
          <p className="text-xs font-normal text-text-secondary">{email}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-primary-blue">{company}</p>
        <p className="text-xs font-medium text-text-secondary">{address}</p>
      </div>
    </div>
  );
};

const InvoicePreview = (invoiceData: InvoiceData) => {
  return (
    <div
      className=" w-full p-15 m-4 relative h-[1000px] flex justify-between items-center flex-col"
      style={{
        backgroundColor: "#194BFA",
        borderRadius: "20px",
      }}
    >
      <img src="/login/half-circle-login-background-1.svg" alt="Logo" className="w-110 absolute top-0 right-0" />
      <img src="/login/half-circle-login-background-2.svg" alt="Logo" className="w-100 absolute bottom-0 left-0" />

      <div className="flex flex-col gap-4 relative z-1 bg-background rounded-t-xl w-full h-full">
        {/* Invoice Header Meta */}
        <div className="flex flex-row gap-10 border-b border-primary-divider pb-5 px-10 py-5 justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-text-secondary">Invoice No</p>
            <p className="text-sm font-medium text-text-primary">{invoiceData.invoiceNumber}</p>
          </div>
          <div className="flex flex-row gap-20">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-secondary">Issue date</p>
              <p className="text-sm font-medium text-text-primary">{invoiceData.date}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-secondary">Due date</p>
              <p className="text-sm font-medium text-text-primary">{invoiceData.dueDate}</p>
            </div>
          </div>
        </div>

        {/* Invoice Preview Image */}
        <div className="flex flex-col gap-6 px-10 py-3">
          {/* From and Bill To Section */}
          <div className="flex flex-row gap-3">
            <PreviewCard
              name={invoiceData.from.name}
              email={invoiceData.from.email}
              company={invoiceData.from.company}
              address={invoiceData.from.address}
              isFrom={true}
            />

            <PreviewCard
              name={invoiceData.billTo.company}
              email={invoiceData.billTo.email}
              company={invoiceData.billTo.company}
              address={invoiceData.billTo.address}
              isFrom={false}
            />
          </div>

          {/* Items Table */}
          <div className="flex flex-col gap-0">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_80px_80px_120px] border-b border-primary-divider pb-2 mb-2">
              <p className="text-xs font-medium text-text-secondary">Item</p>
              <p className="text-xs font-medium text-text-secondary">Price</p>
              <p className="text-xs font-medium text-text-secondary text-center">Qty</p>
              <p className="text-xs font-medium text-text-secondary text-right">Amount</p>
            </div>

            {/* Table Rows */}
            {invoiceData.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_80px_120px] border-b border-primary-divider py-2">
                <p className="text-xs font-medium text-text-primary">{item.description}</p>
                <p className="text-xs font-medium text-text-primary">{item.price.toFixed(2)}</p>
                <p className="text-xs font-medium text-text-primary text-center">{item.qty}</p>
                <p className="text-xs font-medium text-text-primary text-right">{item.amount.toFixed(2)}</p>
              </div>
            ))}

            <div className="grid grid-cols-[1fr_80px_80px_120px] py-3">
              {invoiceData.note ? <p className="text-xs font-semibold text-text-secondary">Note</p> : <div></div>}
              <p className="text-xs font-semibold text-text-secondary text-left">SUBTOTAL</p>
              <div></div>
              <p className="text-xs font-semibold text-text-primary text-right">{invoiceData.subtotal.toFixed(2)}</p>
            </div>

            {/* Totals Rows - Part of Table */}
            {invoiceData.note && (
              <div className="grid grid-cols-[1fr_80px_80px_120px] flex-wrap break-words">
                <p className="text-xs font-medium text-text-primary w-60">{invoiceData.note}</p>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}

            <div className="grid grid-cols-[1fr_80px_80px_120px]">
              <div></div>
              <div className="text-left border-t border-primary-divider pt-2">
                <p className="text-base font-semibold text-text-secondary">TOTAL</p>
              </div>
              <div className="border-t border-primary-divider pt-2"></div>
              <div className="text-right border-t border-primary-divider pt-2">
                <p className="text-base font-semibold text-text-primary">
                  {invoiceData.total.toFixed(2)} {invoiceData.from.token.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 w-75">
            <p className="text-xs font-semibold text-text-secondary">Payment method</p>
            <div className="flex flex-row gap-2 items-center">
              {invoiceData.from.token.toLowerCase() === "qash" ? (
                <img src="/logo/qash-icon.svg" alt="Qash" className="w-6" />
              ) : (
                <img
                  src={`/token/${invoiceData.from.token.toLowerCase()}.svg`}
                  alt={invoiceData.from.token}
                  className="w-6"
                />
              )}
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-text-primary">{invoiceData.from.token}</p>
                <p className="text-xs font-medium text-text-secondary">{invoiceData.from.network}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-text-secondary">Wallet address</p>
              <p className="text-xs font-semibold text-text-primary break-all">{invoiceData.from.walletAddress}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex flex-row justify-between items-center border-t border-primary-divider px-10 py-5 bg-background w-full rounded-b-xl">
        <p className="text-xs font-bold text-text-secondary">
          This is a computer generated invoice, doesn't required any signature.
        </p>
        <div className="flex flex-row items-center">
          <img src="/logo/qash-icon.svg" alt="Qash" className="w-4" />
          <img src="/logo/ash-text-icon.svg" alt="Qash" className="w-7" />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
