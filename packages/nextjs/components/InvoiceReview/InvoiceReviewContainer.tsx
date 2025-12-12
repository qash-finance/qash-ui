"use client";
import React, { useState, useEffect } from "react";
import { SecondaryButton } from "../Common/SecondaryButton";
import { PrimaryButton } from "../Common/PrimaryButton";
import InvoiceDetail from "./InvoiceDetail";
import InvoicePreview from "../Common/Invoice/InvoicePreview";
import { useInvoice } from "@/hooks/server/useInvoice";
import { useSearchParams } from "next/navigation";

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

const InvoiceSuccess = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-3 ">
      <img src="/modal/green-circle-check.gif" alt="Invoice Success" className="w-20" />
      <h2 className="text-4xl font-semibold text-text-primary">Invoice sent successfully</h2>
      <p className="text-base text-text-secondary text-center w-[340px]">{message}</p>
    </div>
  );
};

export const InvoiceReviewContainer = () => {
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("id") || "";

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    isLoading,
    error,
    clearError,
    fetchInvoiceByUUID,
    sendInvoiceEmail,
    reviewInvoiceData,
    confirmInvoiceData,
    downloadPdf,
  } = useInvoice();

  // Fetch invoice data on mount or when UUID changes
  useEffect(() => {
    if (invoiceUUID) {
      loadInvoice();
    }
  }, [invoiceUUID, fetchInvoiceByUUID]);

  const loadInvoice = async () => {
    try {
      const data = await fetchInvoiceByUUID(invoiceUUID);
      console.log("🚀 ~ loadInvoice ~ data:", data);
      // Map API response to InvoiceData type
      setInvoiceData(mapApiResponseToInvoiceData(data));
    } catch (err) {
      console.error("Failed to load invoice:", err);
    }
  };

  const mapApiResponseToInvoiceData = (apiData: any): InvoiceData => {
    // Map API response to InvoiceData interface
    const toDetails = apiData.toDetails || apiData.toCompany || {};
    const fromDetails = apiData.fromDetails || {};

    return {
      invoiceNumber: apiData.invoiceNumber || "",
      date: apiData.issueDate ? new Date(apiData.issueDate).toLocaleDateString() : "",
      dueDate: apiData.dueDate ? new Date(apiData.dueDate).toLocaleDateString() : "",
      from: {
        name: fromDetails.name || apiData.employee?.name || "",
        email: fromDetails.email || apiData.emailTo || "",
        company: apiData.payroll?.company?.companyName || "",
        address: [
          fromDetails.address1,
          fromDetails.address2,
          fromDetails.city,
          fromDetails.country,
          fromDetails.postalCode,
        ]
          .filter(Boolean)
          .join(", "),
        network: fromDetails.network?.name || apiData.payroll?.network?.name || "Ethereum",
        token: fromDetails.token?.symbol || apiData.payroll?.token?.symbol || "USD",
        walletAddress: fromDetails.walletAddress || apiData.employee?.walletAddress || "",
      },
      billTo: {
        name: apiData.toCompany?.companyName || apiData.toCompanyName || "",
        email: apiData.toCompanyEmail || apiData.emailTo || "",
        company: apiData.toCompany?.companyName || apiData.toCompanyName || "",
        address: [toDetails.address1, toDetails.address2, toDetails.city, toDetails.country, toDetails.postalCode]
          .filter(Boolean)
          .join(", "),
      },
      items: (apiData.items || []).map((item: any) => ({
        description: item.description || "",
        qty: parseFloat(item.quantity || "1"),
        price: parseFloat(item.unitPrice || "0"),
        amount: parseFloat(item.total || "0"),
        currency: apiData.currency || "USD",
      })),
      subtotal: parseFloat(apiData.subtotal || "0"),
      total: parseFloat(apiData.total || "0"),
      amountDue: parseFloat(apiData.total || "0"),
      currency: apiData.currency || "USD",
    };
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadPdf(invoiceUUID);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceData?.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  const handleSendInvoice = async () => {
    try {
      await sendInvoiceEmail(invoiceUUID);
      setSuccessMessage(`Invoice has been sent to ${invoiceData?.billTo.email}`);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to send invoice:", err);
    }
  };

  const handleReviewInvoice = async () => {
    try {
      await reviewInvoiceData(invoiceUUID);
      setSuccessMessage("Invoice marked as reviewed");
      setShowSuccess(true);
      // Reload invoice data
      loadInvoice();
    } catch (err) {
      console.error("Failed to review invoice:", err);
    }
  };

  const handleConfirmInvoice = async () => {
    try {
      await confirmInvoiceData(invoiceUUID);
      setSuccessMessage("Invoice confirmed successfully");
      setShowSuccess(true);
      // Reload invoice data
      loadInvoice();
    } catch (err) {
      console.error("Failed to confirm invoice:", err);
    }
  };

  const handleAddressUpdate = (updatedAddress: string) => {
    // Update the invoice data when address is updated in InvoiceDetail
    if (invoiceData) {
      setInvoiceData({
        ...invoiceData,
        from: {
          ...invoiceData.from,
          address: updatedAddress,
        },
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-y-auto">
      {/* Error Display */}
      {error && (
        <div className="flex flex-row w-full justify-between items-center px-4 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={clearError} className="text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !invoiceData && (
        <div className="flex flex-col w-full h-full justify-center items-center">
          <div className="animate-spin">
            <img src="/misc/loading.svg" alt="Loading" className="w-8 h-8" />
          </div>
          <p className="text-text-secondary mt-4">Loading invoice...</p>
        </div>
      )}

      {/* Header */}
      {invoiceData && !showSuccess && (
        <>
          <div className="flex flex-row w-full justify-between items-center px-4 py-3 border-b border-primary-divider">
            <div className="flex flex-row items-center gap-2">
              <img src="/invoice/invoice-icon.svg" alt="Logo" />
              <span className="text-[16px] text-text-primary">Invoice Review</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <SecondaryButton
                text="Download PDF"
                onClick={handleDownloadPdf}
                variant="light"
                buttonClassName="w-[170px]"
                icon="/invoice/download-invoice-icon.svg"
                iconPosition="left"
                disabled={isLoading}
              />
              <PrimaryButton
                text="Confirm"
                onClick={handleConfirmInvoice}
                containerClassName="w-[170px]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-row w-full">
            <InvoiceDetail {...invoiceData} onAddressUpdate={handleAddressUpdate} />
            <div className="w-1/2">
              <InvoicePreview {...invoiceData} />
            </div>
          </div>
        </>
      )}

      {/* Success State */}
      {showSuccess && <InvoiceSuccess message={successMessage} />}
    </div>
  );
};
