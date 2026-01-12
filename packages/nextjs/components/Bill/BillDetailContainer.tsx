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
import { useInvoice } from "@/hooks/server/useInvoice";
import { InvoiceStatusEnum } from "@/types/invoice";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { CategoryShapeEnum } from "@/types/employee";

const BillDetailContainer = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("uuid") || "";
  const { isLoading, fetchInvoiceByUUID, downloadPdf, cancelInvoiceData } = useInvoice();
  const [invoice, setInvoice] = useState<any>(null);
  const { data: groups } = useGetAllEmployeeGroups();

  // Action handlers for invoice menu
  const handleCopyInvoiceLink = () => {
    console.log("Copy invoice link clicked");
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      const blob = await downloadPdf(invoiceUUID);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber || invoiceUUID}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      toast.error("Failed to download invoice PDF");
    }
  };

  const handleDeleteInvoice = async () => {
    await cancelInvoiceData(invoiceUUID);
    toast.success("Invoice cancelled successfully");

    // redirect back to bill list page
    router.replace("/bill");
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
    try {
      const data = await fetchInvoiceByUUID(invoiceUUID);
      setInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice:", err);
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
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
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
          {invoice.status !== InvoiceStatusEnum.PAID && invoice.status !== InvoiceStatusEnum.CANCELLED && (
            <SecondaryButton
              text="Pay Invoice"
              buttonClassName="w-[150px]"
              icon="/misc/coin-icon.svg"
              iconPosition="left"
              onClick={() => {
                // redirect to `http://localhost:3000/bill/review?invoiceUUID=${invoiceUUID}`
                router.push(`/bill/review?invoiceUUID=${invoiceUUID}`);
              }}
            />
          )}
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
                    address: [
                      invoice.toDetails?.address1,
                      invoice.toDetails?.address2,
                      invoice.toDetails?.city,
                      invoice.toDetails?.country,
                    ]
                      .filter(Boolean)
                      .join(", "),
                    email: invoice.toCompany?.email,
                    name: invoice.toCompany?.companyName,
                    company: `${invoice.toCompany?.companyName} ${invoice.toCompany?.companyType}`,
                  },
                  paymentToken: {
                    name: invoice.paymentToken?.name?.toUpperCase() || "USDT",
                  },
                  currency: invoice.currency || "USD",
                  date: invoice.issueDate!,
                  dueDate: invoice.dueDate!,
                  from: {
                    name: invoice.fromDetails?.name!,
                    address: invoice.fromDetails?.address!,
                    email: invoice.fromDetails?.email!,
                    company: `${invoice.fromCompany?.companyName || invoice.payroll?.company?.companyName}`,
                  },
                  invoiceNumber: invoice.invoiceNumber!,
                  items: invoice.items.map((item: any) => ({
                    name: item.description,
                    rate: item.unitPrice,
                    qty: item.quantity,
                    amount: item.total,
                  })),
                  subtotal: parseFloat(invoice.subtotal!.toString()),
                  tax: 0,
                  total: parseFloat(invoice.total!.toString()),
                  walletAddress: invoice.paymentWalletAddress!,
                  network: "Miden",
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
                <p className="text-sm text-gray-500 font-medium">Group</p>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-gray-900 font-medium">{formatDate(invoice.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <img src="/token/qash.svg" alt="QASH" className="w-5 h-5" />
                  <p className="text-sm text-gray-900 font-medium">
                    {invoice.total} {invoice.paymentToken?.name?.toUpperCase()}
                  </p>
                </div>
                <p className="text-sm text-gray-900 font-medium">{formatDate(invoice.issueDate)}</p>
                <p className="text-sm text-gray-900 font-medium">{formatDate(invoice.dueDate)}</p>
                <CategoryBadge
                  shape={groups?.find(grp => grp.id === invoice?.employee?.groupId)?.shape || CategoryShapeEnum.CIRCLE}
                  color={groups?.find(grp => grp.id === invoice?.employee?.groupId)?.color || "#35ADE9"}
                  name={groups?.find(grp => grp.id === invoice?.employee?.groupId)?.name || "Client"}
                />
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
                    {invoice.fromDetails?.name}{" "}
                    <span className="text-gray-500">
                      ({invoice.fromCompany?.companyName || invoice.payroll?.company?.companyName})
                    </span>
                  </p>
                  <p className="text-sm text-blue-600 font-medium">{invoice.fromDetails?.email}</p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Billed to</p>
                </div>
                <div className="flex flex-col gap-0">
                  <p className="text-sm text-gray-900 font-medium">{invoice.toDetails?.companyName} </p>
                  <p className="text-sm text-blue-600 font-medium">{invoice.toDetails?.email}</p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Default method</p>
                </div>

                <div className="flex items-center gap-2">
                  <img src="/token/qash.svg" alt="USDT" className="w-5 h-5" />
                  <p className="text-sm text-gray-900 font-medium">
                    {invoice.paymentToken?.symbol} ({invoice.paymentNetwork?.name})
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="w-30">
                  <p className="text-sm text-gray-500 font-medium">Payment address</p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 font-medium">{invoice.paymentWalletAddress}</p>
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

export default BillDetailContainer;
