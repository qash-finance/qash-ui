"use client";

import { useInvoice } from "@/hooks/server/useInvoice";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { InvoiceStatusEnum } from "@/types/invoice";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Badge, BadgeStatus } from "../Common/Badge";
import { SecondaryButton } from "../Common/SecondaryButton";
import { Tooltip } from "react-tooltip";
import BillDetailActionTooltip from "../Common/ToolTip/BillDetailActionTooltip";
import { InvoiceModalProps } from "@/types/modal";
import toast from "react-hot-toast";
import { CategoryBadge } from "../ContactBook/EmployeeContact";
import { CategoryShapeEnum } from "@/types/employee";
import { useModal } from "@/contexts/ModalManagerProvider";
import { ApproveVote, ConfirmVote, FinalVoteApproved, FinalVoteRejected, RejectVote } from "./Vote";

const TransactionDetailContainer = () => {
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
      <div className="flex flex-row gap-5 items-center">
        <span className="text-xl leading-none font-bold text-text-primary">Monthly payroll for December 2025</span>
      </div>

      <div className="w-full h-full flex flex-row gap-5">
        <div className="flex-1 flex-col w-full h-full gap-2 flex">
          {/* Invoice Details Cards */}
          <div className="flex flex-row gap-3 w-full">
            {/* First Card - Invoice Details */}
            <div className="flex-1 border border-primary-divider rounded-2xl p-5 flex flex-col gap-4">
              {/* Title Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-20">Title</p>
                <p className="text-sm text-text-primary  font-semibold">Monthly payroll for December 2025</p>
              </div>

              {/* Creator Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-20">Creator</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-primary  font-semibold">{invoice.fromDetails?.name || "Unknown"}</p>
                  <img src="/misc/purple-crown-icon.svg" alt="Admin" className="w-5 h-5" title="Admin" />
                </div>
              </div>

              {/* Created Date Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-20">Create date</p>
                <p className="text-sm text-text-primary  font-semibold">{formatDateTime(invoice.createdAt)}</p>
              </div>

              {/* Status Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-20">Status</p>
                <Badge text={statusBadge.text} status={statusBadge.status} />
              </div>
            </div>

            <div className="flex-1 border border-primary-divider rounded-2xl p-5 flex flex-col gap-4">
              {/* Account Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-16">Account</p>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 rounded w-5 h-5 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                    </svg>
                  </div>
                  <p className="text-sm text-text-primary leading-none font-semibold">
                    {invoice.payroll?.groupName || "Payroll"}
                  </p>
                </div>
              </div>

              {/* Member Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-16">Member</p>
                <p className="text-sm text-text-primary leading-none font-semibold">
                  {invoice.payroll?.memberCount || "0"}
                </p>
              </div>

              {/* Threshold Row */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-16">Threshold</p>
                <p className="text-sm text-text-primary leading-none font-semibold">
                  {invoice.payroll?.approvalsRequired || "0"}/{invoice.payroll?.approvalsTotal || "0"}
                </p>
              </div>

              {/* Approved Row with Progress Bar */}
              <div className="flex gap-4 items-center">
                <p className="text-sm text-text-secondary font-medium w-16">Approved</p>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 h-1.5 bg-app-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{
                        width: `${((invoice.payroll?.approved || 1) / (invoice.payroll?.approvalsTotal || 10)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-text-secondary font-semibold text-right w-12">
                    {invoice.payroll?.approved || "1"}/{invoice.payroll?.approvalsTotal || "10"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="border border-primary-divider rounded-2xl overflow-hidden flex flex-col h-fit">
            <div className="flex flex-row justify-between items-center px-4 py-3 border-b border-primary-divider">
              <h2 className="text-2xl font-bold text-text-primary">Transaction detail</h2>
              <div className="flex gap-8 items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-text-secondary font-medium">Number of transactions</span>
                  <span className="text-sm text-text-primary font-semibold">{invoice.items?.length || 0}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-text-secondary font-medium">Total amount</span>
                  <span className="text-sm text-text-primary font-semibold">
                    {Number(invoice.total).toFixed(2)} {invoice.paymentToken?.name?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="overflow-y-auto flex-1">
              {invoice.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_1.5fr_1.5fr_2fr_1.5fr] gap-3 px-4 py-3 border-b border-primary-divider last:border-b-0 items-center"
                >
                  <p className="text-sm text-text-primary font-medium">INV{String(idx + 1).padStart(5, "0")}</p>
                  <p className="text-sm text-text-primary font-medium">Ken</p>
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      Employee
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <p className="text-sm text-text-primary font-semibold">
                      {Number(item.total).toFixed(2)} {invoice.paymentToken?.name?.toUpperCase()}
                    </p>
                    <p className="text-xs text-text-secondary font-medium">${Number(item.total).toFixed(0)}</p>
                  </div>
                  <div className="flex justify-end">
                    <SecondaryButton text="View Details" variant="light" buttonClassName="px-4" onClick={() => {}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members */}
          <div className="border border-primary-divider rounded-2xl overflow-hidden flex flex-col h-fit">
            <div className="flex flex-row justify-between items-center px-4 py-3 border-b border-primary-divider">
              <h2 className="text-2xl font-bold text-text-primary">Members</h2>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-text-secondary font-medium">Threshold</span>
                <span className="text-sm text-text-primary font-semibold">
                  {invoice.payroll?.approved || "0"}/{invoice.payroll?.approvalsTotal || "10"}
                </span>
              </div>
            </div>

            {/* Members Grid */}
            <div className="flex gap-5 p-5">
              {/* Pending Column */}
              <div className="flex flex-col gap-4 w-48">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-text-secondary font-medium">Pending</span>
                  <span className="text-sm text-primary-blue font-semibold">
                    {(invoice.payroll?.approvalsTotal || 10) - (invoice.payroll?.approved || 0)}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {[...Array((invoice.payroll?.approvalsTotal || 10) - (invoice.payroll?.approved || 0))].map(
                    (_, idx) => (
                      <p key={idx} className="text-sm text-text-primary font-semibold">
                        Member {idx + 1}
                      </p>
                    ),
                  )}
                </div>
              </div>

              {/* Approved Column */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-text-secondary font-medium">Approved</span>
                  <span className="text-sm text-primary-blue font-semibold">{invoice.payroll?.approved || "1"}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                    <p className="text-sm text-text-primary font-semibold">
                      {invoice.fromDetails?.name || "Admin"} (You)
                    </p>
                    <img src="/misc/purple-crown-icon.svg" alt="Admin" className="w-5 h-5" />
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Approved
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejected Column */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-text-secondary font-medium">Rejected</span>
                  <span className="text-sm text-primary-blue font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="w-80 flex flex-col gap-3">
          <div className="border border-primary-divider rounded-2xl px-4 flex-1 flex flex-col justify-between py-2">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-text-primary pb-4">Progress</h2>

              <div className="flex flex-col gap-3">
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
            <ApproveVote />
            <RejectVote />
            <ConfirmVote />
            <FinalVoteApproved />
            <FinalVoteRejected />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailContainer;
