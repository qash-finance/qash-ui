"use client";
import React, { useState } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { SecondaryButton } from "../Common/SecondaryButton";
import { Badge, BadgeStatus } from "../Common/Badge";
import { Table } from "../Common/Table";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { FloatingFooter } from "../Common/FloatingFooter";
import { FloatingAction } from "./FloatingAction";
import { BillStatusEnum } from "@/types/bill";
import { useGetBills, usePayBills, useGetBillStats } from "@/services/api/bill";
import { getB2BInvoices, getB2BInvoiceStats, downloadB2BInvoicePdf, deleteB2BInvoice } from "@/services/api/invoice";
import { InvoiceStatusEnum, B2BInvoiceQueryDto } from "@/types/invoice";
import { CategoryShapeEnum } from "@/types/employee";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { Tooltip } from "react-tooltip";
import ClientActionTooltip from "../Common/ToolTip/ClientActionTooltip";
import { useDeleteBill } from "@/services/api/bill";
import { useInvoice } from "@/hooks/server/useInvoice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalManagerProvider";
import { PrimaryButton } from "../Common/PrimaryButton";
import { cancelB2BInvoice } from "@/services/api/invoice";

type Tab = "all" | "sent" | "paid";

const Card = ({ title, text }: { title: string; text: React.ReactNode }) => {
  return (
    <div
      className="relative w-full h-full rounded-xl border border-primary-divider p-4 flex flex-col overflow-hidden gap-3"
      style={{
        backgroundImage: `url(/card/background.svg)`,
        backgroundSize: "30%",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    >
      <span className="text-text-secondary text-sm leading-none">{title}</span>
      {text}
    </div>
  );
};

const renderTabHeader = (activeTab: Tab) => {
  switch (activeTab) {
    case "all":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Overview</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">Manage all the invoices</span>
        </div>
      );
    case "sent":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Sent invoices</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">Track your invoice progress</span>
        </div>
      );
    case "paid":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Paid invoices</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">
            Invoices that have been approved and processed successfully
          </span>
        </div>
      );
    default:
      return;
  }
};

const ClientInvoiceContainer = () => {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);
  const { data: groups } = useGetAllEmployeeGroups();
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  // Fetch B2B invoice statistics
  const { data: invoiceStats } = useQuery({
    queryKey: ["b2b-invoice-stats"],
    queryFn: getB2BInvoiceStats,
  });

  const billActionRenderer = (rowData: Record<string, any>, index: number) => (
    <div className="flex items-center justify-center w-full" onClick={e => e.stopPropagation()}>
      <img
        src="/misc/three-dot-icon.svg"
        alt="three dot icon"
        className="w-6 h-6 cursor-pointer"
        data-tooltip-id="bill-action-tooltip"
        data-tooltip-content={rowData.__id?.toString()}
      />
    </div>
  );

  const handleCheckRow = (idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleCheckAll = () => {
    if (checkedRows.length === (invoiceDatas?.length || 0)) {
      setCheckedRows([]);
    } else {
      setCheckedRows(invoiceDatas?.map((_: any, idx: number) => idx) || []);
    }
  };

  // Fetch B2B invoices from API
  const { data: invoicesResponse, isLoading } = useQuery({
    queryKey: ["b2b-invoices", currentPage, rowsPerPage, activeTab],
    queryFn: () =>
      getB2BInvoices({
        page: currentPage,
        limit: rowsPerPage,
        direction: "sent",
        status:
          activeTab === "all" ? undefined : activeTab === "sent" ? InvoiceStatusEnum.SENT : InvoiceStatusEnum.PAID,
      }),
  });

  // Show all invoices when "all" tab is active, otherwise show filtered invoices from API
  const invoices = React.useMemo(() => {
    return invoicesResponse?.invoices ?? [];
  }, [invoicesResponse]);

  const router = useRouter();

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceUUID: string) => deleteB2BInvoice(invoiceUUID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["b2b-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-invoice-stats"] });
      toast.success("Invoice deleted successfully");
    },
    onError: (err: any) => {
      console.error("Delete invoice failed", err);
      toast.error("Failed to delete invoice");
    },
  });

  // Void invoice mutation
  const voidInvoiceMutation = useMutation({
    mutationFn: (invoiceUUID: string) => cancelB2BInvoice(invoiceUUID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["b2b-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["b2b-invoice-stats"] });
      toast.success("Invoice voided successfully");
    },
    onError: (err: any) => {
      console.error("Void invoice failed", err);
      toast.error("Failed to void invoice");
    },
  });

  const invoiceDatas = invoices.map((invoice: any, idx: number) => {
    const createdDate = invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";
    const dueDate = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";

    const badgeStatus = (() => {
      switch (invoice.status) {
        case InvoiceStatusEnum.PAID:
          return BadgeStatus.SUCCESS;
        case InvoiceStatusEnum.SENT:
        case InvoiceStatusEnum.CONFIRMED:
          return BadgeStatus.AWAITING;
        case InvoiceStatusEnum.CANCELLED:
          return BadgeStatus.FAIL;
        case InvoiceStatusEnum.DRAFT:
          return BadgeStatus.NEUTRAL;
        default:
          return BadgeStatus.NEUTRAL;
      }
    })();

    return {
      __id: invoice.id,
      __invoiceUuid: invoice.uuid,
      "header-0": (
        <div className="flex justify-center items-center" onClick={e => e.stopPropagation()}>
          <CustomCheckbox checked={checkedRows.includes(idx)} onChange={() => handleCheckRow(idx)} />
        </div>
      ),
      "Creation date": createdDate,
      Invoice: invoice.invoiceNumber || invoice.uuid,
      Name: invoice.toCompanyName || invoice.toCompany?.companyName || invoice.fromDetails?.companyName || "-",
      Email: invoice.toCompanyEmail || invoice.emailTo || "-",
      Amount: (
        <div className="flex items-center gap-2 justify-center">
          <span>{invoice.total || "0"}</span>
          <img
            alt={`${invoice.paymentToken?.symbol?.toLowerCase()}`}
            className="w-4"
            src={`/token/${invoice.paymentToken?.symbol?.toLowerCase()}.svg`}
            onError={e => {
              (e.target as HTMLImageElement).src = "/token/usdt.svg";
            }}
          />
        </div>
      ),
      "Due Date": dueDate,
      Status: (
        <div className="w-full flex justify-center items-center">
          <Badge text={invoice.status} status={badgeStatus} className="px-5" />
        </div>
      ),
    };
  });

  const isAllChecked = checkedRows.length === invoiceDatas?.length;

  return (
    <div className="flex flex-col w-full h-full justify-start items-start p-5 gap-5">
      <div className="flex flex-col w-full px-5 gap-10">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3">
            <img src="/sidebar/bill.svg" alt="Bill Placeholder" className="w-6" />
            <span className="font-bold text-2xl">Invoices</span>
          </div>
          <PrimaryButton
            text="Create invoice"
            icon="/misc/plus-icon.svg"
            iconPosition="left"
            onClick={() => {
              router.push("/invoice/create");
            }}
            containerClassName="w-[140px]"
            buttonClassName="py-2.5"
          />
        </div>

        <div className="flex flex-row w-full gap-2">
          <Card
            title="All invoices"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">
                {(invoiceStats?.sent?.totalDraft ?? 0) +
                  (invoiceStats?.sent?.totalSent ?? 0) +
                  (invoiceStats?.sent?.totalConfirmed ?? 0) +
                  (invoiceStats?.sent?.totalPaid ?? 0)}
              </span>
            }
          />
          <Card
            title="Sent"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">
                {invoiceStats?.sent?.totalSent ?? 0}
              </span>
            }
          />
          <Card
            title="Draft"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">
                {invoiceStats?.sent?.totalDraft ?? 0}
              </span>
            }
          />
          <Card
            title="Paid"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">
                {invoiceStats?.sent?.totalPaid ?? 0}
              </span>
            }
          />
        </div>
      </div>

      <BaseContainer
        header={
          <div className="flex w-full justify-between items-center py-3 px-5">
            <div className="flex flex-col gap-1">
              <TabContainer
                tabs={[
                  { id: "all", label: "All" },
                  { id: "sent", label: "Sent" },
                  { id: "paid", label: "Paid" },
                ]}
                activeTab={activeTab}
                //@ts-ignore
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        }
        childrenClassName="p-5 gap-5"
        containerClassName="w-full h-full bg-[#F6F6F6]"
      >
        <div className="flex w-full justify-between items-center">
          {renderTabHeader(activeTab)}

          {/* Filter Button */}
          {/* <div className="flex items-center gap-2">
            <SecondaryButton
              text="Sort"
              icon="/misc/sort-icon.svg"
              onClick={() => console.log("Sort button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            />
            <SecondaryButton
              text="Filter"
              icon="/wallet-analytics/setting-icon.gif"
              onClick={() => console.log("Filter button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            />
          </div> */}
        </div>
        <Table
          headers={[
            <div className="flex justify-center items-center">
              <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
            </div>,
            "Creation date",
            "Invoice",
            "Name",
            "Email",
            "Amount",
            "Due Date",
            "Status",
          ]}
          data={invoiceDatas}
          className="w-full"
          rowClassName="py-5"
          headerClassName="py-3"
          showPagination={true}
          actionColumn={true}
          actionRenderer={billActionRenderer}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowClick={rowData => {
            const invoiceUUID = (rowData as any).__invoiceUuid;
            router.push(`/invoice/detail?id=${invoiceUUID}`);
          }}
        />
      </BaseContainer>

      <Tooltip
        id="bill-action-tooltip"
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
        render={({ content }) => {
          if (!content) return null;
          const id = parseInt(content, 10);
          const invoice = invoices?.find((inv: any) => inv.id === id);
          if (!invoice) return null;

          const handlePay = async () => {
            // Navigate to invoice detail/payment page
            router.push(`/invoice/detail?id=${invoice.uuid}`);
          };

          const handleDelete = () => {
            openModal("REMOVE_INVOICE", {
              invoiceOwnerName: invoice.toCompanyName || invoice.fromDetails?.companyName || "",
              onRemove: async () => {
                deleteInvoiceMutation.mutate(invoice.uuid);
              },
            });
          };

          const handleDownload = async () => {
            try {
              if (!invoice.uuid) throw new Error("Invoice UUID not found");
              const blob = await downloadB2BInvoicePdf(invoice.uuid);
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `invoice-${invoice.invoiceNumber || invoice.uuid}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success("Invoice downloaded successfully");
            } catch (err) {
              console.error("Failed to download PDF:", err);
              toast.error("Failed to download invoice");
            }
          };

          const handleCopyInvoiceLink = async () => {
            try {
              const link = `${window.location.origin}/invoice-review/b2b?id=${invoice.uuid}`;
              await navigator.clipboard.writeText(link);
              toast.success("Invoice link copied to clipboard");
            } catch (err) {
              console.error("Failed to copy invoice link", err);
              toast.error("Failed to copy invoice link");
            }
          };

          const handleVoid = async () => {
            try {
              await voidInvoiceMutation.mutateAsync(invoice.uuid);
            } catch (err) {
              console.error("Failed to void invoice:", err);
            }
          };

          return (
            <ClientActionTooltip
              onCopyInvoiceLink={handleCopyInvoiceLink}
              onDeleteInvoice={handleDelete}
              onDownloadPDF={handleDownload}
              onVoidInvoice={handleVoid}
              invoiceStatus={invoice.status}
            />
          );
        }}
      />

      {checkedRows.length > 0 && (
        <FloatingAction
          selectedCount={checkedRows.length}
          allSelected={isAllChecked}
          onDeselectAll={() => setCheckedRows([])}
          actionButtons={
            <SecondaryButton
              text="Pay all"
              buttonClassName="w-40 rounded-full"
              onClick={async () => {
                const uuids = checkedRows.map(i => invoices[i]?.uuid).filter(Boolean) as string[];
                if (uuids.length === 0) return;
                // Navigate to first invoice payment page (or implement batch payment)
                if (uuids.length === 1) {
                  router.push(`/invoice/detail?id=${uuids[0]}`);
                } else {
                  // For multiple invoices, navigate to first one or implement batch payment flow
                  toast.success(`Opening first of ${uuids.length} selected invoices`);
                  router.push(`/invoice/detail?id=${uuids[0]}`);
                }
              }}
            />
          }
        />
      )}
    </div>
  );
};

export default ClientInvoiceContainer;
