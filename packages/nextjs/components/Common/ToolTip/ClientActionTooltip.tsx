"use client";
import React from "react";

export interface ClientActionTooltipProps {
  onCopyInvoiceLink?: () => void;
  onDownloadPDF?: () => void;
  onVoidInvoice?: () => void;
  onDeleteInvoice?: () => void;
  invoiceStatus?: string;
}

const itemStyles = "flex items-center gap-2 px-3 py-3 w-full cursor-pointer hover:bg-app-background transition-colors";

const ClientActionTooltip: React.FC<ClientActionTooltipProps> = ({
  onCopyInvoiceLink,
  onDownloadPDF,
  onVoidInvoice,
  onDeleteInvoice,
  invoiceStatus,
}) => {
  const isPaidOrCancelled = invoiceStatus === "PAID" || invoiceStatus === "CANCELLED";
  const isDraft = invoiceStatus === "DRAFT";
  const showVoid = !isPaidOrCancelled && !isDraft;
  const showDelete = isDraft;

  return (
    <div className="bg-background relative rounded-2xl w-50 shadow-sm border border-primary-divider flex flex-col">
      {/* Copy Invoice Link */}
      <button className={`${itemStyles} rounded-t-2xl`} onClick={onCopyInvoiceLink}>
        <img src="/misc/copy-icon.svg" alt="copy" className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Copy Invoice Link</span>
      </button>

      {/* Download PDF */}
      <button className={`${itemStyles} ${!showVoid && !showDelete ? "rounded-b-2xl" : ""}`} onClick={onDownloadPDF}>
        <img src="/misc/download-icon.svg" alt="download" className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-900 whitespace-nowrap">Download PDF</span>
      </button>

      {/* Void Invoice - Only show if not already paid or cancelled */}
      {showVoid && (
        <button className={`${itemStyles} ${!showDelete ? "rounded-b-2xl" : ""}`} onClick={onVoidInvoice}>
          <img src="/misc/circle-close-icon.svg" alt="void" className="w-5 h-5" />
          <span className="font-medium text-sm text-orange-500 whitespace-nowrap">Void Invoice</span>
        </button>
      )}

      {/* Delete Invoice - Only show if draft */}
      {showDelete && (
        <button className={`${itemStyles} rounded-b-2xl`} onClick={onDeleteInvoice}>
          <img src="/misc/trashcan-icon.svg" alt="delete" className="w-5 h-5" />
          <span className="font-medium text-sm text-red-500 whitespace-nowrap">Delete Invoice</span>
        </button>
      )}
    </div>
  );
};

export default ClientActionTooltip;
