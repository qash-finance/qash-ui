"use client";
import React, { use, useEffect, useState } from "react";
import BillDetailActionTooltip from "../Common/ToolTip/BillDetailActionTooltip";
import { Tooltip } from "react-tooltip";
import { Badge, BadgeStatus } from "../Common/Badge";
import { SecondaryButton } from "../Common/SecondaryButton";
import toast from "react-hot-toast";
import { useModal } from "@/contexts/ModalManagerProvider";
import { InvoiceModalProps } from "@/types/modal";
import { useRouter, useSearchParams } from "next/navigation";
import { getB2BInvoiceByUUID, downloadB2BInvoicePdf, cancelB2BInvoice } from "@/services/api/invoice";
import { InvoiceStatusEnum } from "@/types/invoice";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { CategoryShapeEnum } from "@/types/employee";

const ClientInvoiceDetailContainer = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("id") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const { data: groups } = useGetAllEmployeeGroups();

  // Action handlers for invoice menu
  const handleCopyInvoiceLink = async () => {
    try {
      const link = `${window.location.origin}/invoice-review/b2b?id=${invoiceUUID}`;
      await navigator.clipboard.writeText(link);
      toast.success("Invoice link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy invoice link", err);
      toast.error("Failed to copy invoice link");
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      const blob = await downloadB2BInvoicePdf(invoiceUUID);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber || invoiceUUID}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download invoice PDF");
    }
  };

  const handleDeleteInvoice = async () => {
    try {
      await cancelB2BInvoice(invoiceUUID);
      toast.success("Invoice cancelled successfully");
      // redirect back to invoice list page
      router.replace("/invoice");
    } catch (err) {
      console.error("Failed to cancel invoice:", err);
      toast.error("Failed to cancel invoice");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status?: InvoiceStatusEnum) => {
    switch (status) {
      case InvoiceStatusEnum.PAID:
        return { text: "PAID", status: BadgeStatus.SUCCESS };
      case InvoiceStatusEnum.CANCELLED:
        return { text: "CANCELLED", status: BadgeStatus.FAIL };
      case InvoiceStatusEnum.DRAFT:
        return { text: "DRAFT", status: BadgeStatus.NEUTRAL };
      default:
        return { text: status || "AWAITING", status: BadgeStatus.AWAITING };
    }
  };

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await getB2BInvoiceByUUID(invoiceUUID);
      setInvoice(response);
    } catch (err) {
      console.error("Failed to load invoice:", err);
      toast.error("Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceUUID) {
      loadInvoice();
    }
  }, [invoiceUUID]);

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(invoice.status);

  return (
    <div className="flex flex-col w-full h-full px-10 py-5 gap-6 bg-background">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] leading-none text-text-secondary">
            {invoice.invoiceNumber} {invoice.fromDetails?.name}
          </span>
          <div className="flex flex-row gap-5 items-center">
            <span className="text-xl leading-none font-bold text-text-primary">Invoice {invoice.invoiceNumber}</span>
            <Badge text={statusBadge.text} status={statusBadge.status} />
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <SecondaryButton
            text="View invoice PDF"
            variant="light"
            buttonClassName="w-[160px]"
            icon="/misc/eye-icon.svg"
            iconPosition="left"
            onClick={() => {
              openModal<InvoiceModalProps>("INVOICE_MODAL", {
                invoice: {
                  amountDue: invoice.total!,
                  billTo: {
                    address:
                      invoice.toCompanyAddress ||
                      [
                        invoice.toDetails?.address1,
                        invoice.toDetails?.address2,
                        invoice.toDetails?.city,
                        invoice.toDetails?.country,
                      ]
                        .filter(Boolean)
                        .join(", "),
                    email: invoice.toCompanyEmail || invoice.emailTo,
                    name: invoice.toCompanyContactName || invoice.toCompanyName,
                    company: invoice.toCompanyName || "",
                  },
                  paymentToken: {
                    name: invoice.paymentToken?.symbol?.toUpperCase() || "USDT",
                  },
                  currency: invoice.currency || "USD",
                  date: invoice.issueDate!,
                  dueDate: invoice.dueDate!,
                  from: {
                    name: invoice.fromDetails?.contactName || invoice.fromDetails?.companyName || "",
                    address: [
                      invoice.fromDetails?.address1,
                      invoice.fromDetails?.city,
                      invoice.fromDetails?.state,
                      invoice.fromDetails?.country,
                      invoice.fromDetails?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", "),
                    email: invoice.fromDetails?.email || "",
                    company: invoice.fromDetails?.companyName || "",
                  },
                  invoiceNumber: invoice.invoiceNumber!,
                  items:
                    invoice.items?.map((item: any) => ({
                      name: item.description,
                      rate: item.unitPrice,
                      qty: item.quantity,
                      amount: item.total,
                    })) || [],
                  subtotal: parseFloat(invoice.subtotal?.toString() || "0"),
                  tax: 0,
                  total: parseFloat(invoice.total?.toString() || "0"),
                  walletAddress: invoice.paymentWalletAddress || invoice.walletAddress || "",
                  network: invoice.paymentNetwork?.name || "Miden",
                },
              });
            }}
          />
          {invoice.status !== InvoiceStatusEnum.PAID && invoice.status !== InvoiceStatusEnum.CANCELLED && (
            <img
              src="/misc/three-dot-icon.svg"
              alt=""
              data-tooltip-id="bill-detail-action-tooltip"
              data-tooltip-content="0"
              className="w-6 cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Bill Detail Action Tooltip */}
      {
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
            const isPaidOrCancelled =
              invoice.status === InvoiceStatusEnum.PAID || invoice.status === InvoiceStatusEnum.CANCELLED;
            return (
              <BillDetailActionTooltip
                onEdit={handleCopyInvoiceLink}
                onDuplicate={handleDownloadPDF}
                onRemove={handleDeleteInvoice}
                showDelete={!isPaidOrCancelled}
              />
            );
          }}
        />
      }

      <div className="w-full h-full flex flex-row gap-10">
        <div className="flex-1 flex-col w-full h-full">
          {/* Invoice Details Cards */}
          <div className="flex flex-row gap-3 w-full">
            {/* First Card - Invoice Details */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 flex gap-8">
              <div className="flex flex-col gap-4 w-24">
                <p className="text-sm text-gray-500 font-medium">Created on</p>
                <p className="text-sm text-gray-500 font-medium">Invoice amount</p>
                <p className="text-sm text-gray-500 font-medium">Issued date</p>
                <p className="text-sm text-gray-500 font-medium">Due date</p>
                <p className="text-sm text-gray-500 font-medium">Currency</p>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-gray-900 font-medium">{formatDate(invoice.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <img
                    src={`/token/${invoice.paymentToken?.symbol?.toLowerCase()}.svg`}
                    alt={invoice.paymentToken?.symbol || "Token"}
                    className="w-5 h-5"
                    onError={(e: any) => {
                      e.target.src = "/token/usdt.svg";
                    }}
                  />
                  <p className="text-sm text-gray-900 font-medium">
                    {invoice.total} {invoice.paymentToken?.symbol || invoice.currency}
                  </p>
                </div>
                <p className="text-sm text-gray-900 font-medium">{formatDate(invoice.issueDate)}</p>
                <p className="text-sm text-gray-900 font-medium">{formatDate(invoice.dueDate)}</p>
                <p className="text-sm text-gray-900 font-medium">{invoice.currency || "USD"}</p>
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
                    {invoice.fromDetails?.companyName || invoice.fromDetails?.contactName || "-"}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">{invoice.fromDetails?.email || "-"}</p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Billed to</p>
                </div>
                <div className="flex flex-col gap-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {invoice.toCompanyName || invoice.toCompanyContactName || "-"}{" "}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {invoice.toCompanyEmail || invoice.emailTo || "-"}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Default method</p>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={`/token/${invoice.paymentToken?.symbol?.toLowerCase()}.svg`}
                    alt={invoice.paymentToken?.symbol || "Token"}
                    className="w-5 h-5"
                    onError={(e: any) => {
                      e.target.src = "/token/usdt.svg";
                    }}
                  />
                  <p className="text-sm text-gray-900 font-medium">
                    {invoice.paymentToken?.symbol} ({invoice.paymentNetwork?.name || "Miden"})
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Payment address</p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-medium">
                    {invoice.paymentWalletAddress || invoice.walletAddress || "-"}
                  </p>
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
              {invoice.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 border-b border-gray-200"
                >
                  <p className="text-sm text-gray-900 font-medium">{item.description}</p>
                  <p className="text-sm text-gray-900 font-medium text-center">{item.quantity}</p>
                  <p className="text-sm text-gray-900 font-medium text-right">
                    {Number(item.unitPrice).toFixed(2)} {invoice.paymentToken?.name?.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-900 font-medium text-right">
                    {Number(item.total).toFixed(2)} {invoice.paymentToken?.name?.toUpperCase()}
                  </p>
                </div>
              ))}

              {/* Subtotal */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 border-b border-gray-200">
                <div />
                <div />
                <p className="text-sm text-gray-900 font-medium text-right">Subtotal</p>
                <p className="text-base text-gray-900 font-semibold text-right">
                  {Number(invoice.subtotal).toFixed(2)} {invoice.paymentToken?.name?.toUpperCase()}
                </p>
              </div>

              {/* Amount Due */}
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-3 px-4 py-3 bg-blue-50">
                <div />
                <div />
                <p className="text-sm text-gray-900 font-medium text-right">Amount due</p>
                <p className="text-base text-gray-900 font-semibold text-right">
                  {Number(invoice.total).toFixed(2)} {invoice.paymentToken?.name?.toUpperCase()}
                </p>
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
                { label: "Invoice created", date: formatDateTime(invoice.createdAt) },
                invoice.sentAt && { label: "Invoice sent", date: formatDateTime(invoice.sentAt) },
                invoice.reviewedAt && { label: "Invoice reviewed", date: formatDateTime(invoice.reviewedAt) },
                invoice.confirmedAt && { label: "Invoice confirmed", date: formatDateTime(invoice.confirmedAt) },
                invoice.paidAt && { label: "Invoice paid", date: formatDateTime(invoice.paidAt) },
              ]
                .filter(Boolean)
                .map((item: any, idx, arr) => (
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

export default ClientInvoiceDetailContainer;
