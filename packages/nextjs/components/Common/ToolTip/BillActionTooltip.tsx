"use client";
import React from "react";

export interface BillActionTooltipProps {
  onPay?: () => void;
  onCopyInvoiceLink?: () => void;
  onDownloadPDF?: () => void;
  onDeleteInvoice?: () => void;
  billStatus?: string;
}

const itemStyles = "flex items-center gap-2 px-3 py-3 w-full cursor-pointer hover:bg-app-background transition-colors";

const BillActionTooltip: React.FC<BillActionTooltipProps> = ({
  onPay,
  onCopyInvoiceLink,
  onDownloadPDF,
  onDeleteInvoice,
  billStatus,
}) => {
  const isPaid = billStatus === "PAID";

  return (
    <div className="bg-background relative rounded-2xl w-50 shadow-sm border border-primary-divider flex flex-col">
      {/* Pay Button */}
      {!isPaid && (
        <button className={`${itemStyles} rounded-t-2xl`} onClick={onPay}>
          <img src="/misc/coin-icon.svg" alt="edit" className="w-5 h-5" />
          <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Pay</span>
        </button>
      )}

      {/* Copy Invoice Link */}
      {/* <button className={`${itemStyles}`} onClick={onCopyInvoiceLink}>
        <img src="/misc/copy-icon.svg" alt="duplicate" className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Copy Invoice Link </span>
      </button> */}

      {/* Download PDF */}
      {/* <button className={`${itemStyles}`} onClick={onDownloadPDF}>
        <img src="/misc/download-icon.svg" alt="download" className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Download PDF</span>
      </button> */}

      {/* Delete Invoice */}
      <button className={`${itemStyles} rounded-b-2xl`} onClick={onDeleteInvoice}>
        <img src="/misc/trashcan-icon.svg" alt="remove" className="w-5 h-5" />
        <span className="font-medium text-sm text-red-500 whitespace-nowrap">Delete Invoice</span>
      </button>
    </div>
  );
};

export default BillActionTooltip;
