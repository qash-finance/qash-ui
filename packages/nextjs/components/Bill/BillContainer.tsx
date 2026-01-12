"use client";
import React, { useState, useEffect } from "react";
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
import { CategoryShapeEnum } from "@/types/employee";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { Tooltip } from "react-tooltip";
import BillActionTooltip from "../Common/ToolTip/BillActionTooltip";
import { useDeleteBill } from "@/services/api/bill";
import { useInvoice } from "@/hooks/server/useInvoice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalManagerProvider";

type Tab = "all" | "pending" | "paid";

const billActionRenderer = (rowData: Record<string, any>, index: number) => (
  <div className="flex items-center justify-center w-full" onClick={e => e.stopPropagation()}>
    <img
      src="/misc/three-dot-icon.svg"
      alt="three dot icon"
      className="w-6 h-6 cursor-pointer"
      data-tooltip-id="bill-action-tooltip"
      data-tooltip-content={rowData.__billId?.toString()}
    />
  </div>
);

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
          <span className="text-text-secondary text-[14px] font-medium leading-none">
            Manage all the invoices you received from vendors, clients and employees
          </span>
        </div>
      );
    case "paid":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Paid bills</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">
            All bills that have been fully paid.
          </span>
        </div>
      );
    case "pending":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Pending bills</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">
            All bills that pending to be paid.
          </span>
        </div>
      );
    default:
      return;
  }
};

const BillContainer = () => {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);
  const { data: groups } = useGetAllEmployeeGroups();
  const { data: billStats } = useGetBillStats();
  const { openModal } = useModal();

  const handleCheckRow = (idx: number) => {
    const bill = bills[idx];
    // Only allow checking if bill is pending
    if (bill?.status !== BillStatusEnum.PENDING) {
      const statusMessage =
        bill?.status === BillStatusEnum.PAID
          ? "This bill cannot be checked because it has already been paid"
          : bill?.status === BillStatusEnum.CANCELLED
            ? "This bill cannot be checked because it has been cancelled"
            : `This bill cannot be checked because it is ${bill?.status?.toLowerCase()}`;
      toast.error(statusMessage);
      return;
    }
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleCheckAll = () => {
    // Only get indices of pending bills
    const pendingIndices = bills
      .map((bill, idx) => (bill.status === BillStatusEnum.PENDING ? idx : null))
      .filter((idx): idx is number => idx !== null);

    // If there are no pending bills, show a warning
    if (pendingIndices.length === 0) {
      toast.error("No pending bills available to check");
      return;
    }

    const allPendingChecked = pendingIndices.every(idx => checkedRows.includes(idx));

    if (allPendingChecked) {
      // Uncheck all pending bills
      setCheckedRows(prev => prev.filter(idx => !pendingIndices.includes(idx)));
    } else {
      // Check all pending bills (keep existing checked rows that aren't pending)
      setCheckedRows(prev => {
        const nonPendingChecked = prev.filter(idx => bills[idx]?.status !== BillStatusEnum.PENDING);
        return [...nonPendingChecked, ...pendingIndices];
      });
    }
  };

  // Fetch bills from API
  const { data: billsResponse, isLoading } = useGetBills({
    page: currentPage,
    limit: rowsPerPage,
    status: activeTab === "all" ? undefined : activeTab === "pending" ? BillStatusEnum.PENDING : BillStatusEnum.PAID,
  });

  // Show all bills when "all" tab is active, otherwise show filtered bills from API
  const bills = React.useMemo(() => {
    return billsResponse?.bills ?? [];
  }, [billsResponse?.bills]);

  // Clean up checked rows when bills change - remove any checked rows for non-pending bills
  useEffect(() => {
    setCheckedRows(prev => prev.filter(idx => bills[idx]?.status === BillStatusEnum.PENDING));
  }, [bills]);

  const payBillsMutation = usePayBills();
  const deleteBill = useDeleteBill();
  const { downloadPdf, cancelInvoiceData } = useInvoice();
  const router = useRouter();

  const billDatas = bills.map((b, idx) => {
    const createdDate = b.createdAt
      ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";
    const dueDate = b.invoice?.dueDate
      ? new Date(b.invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";

    const badgeStatus = (() => {
      switch (b.status) {
        case "PAID":
          return BadgeStatus.SUCCESS;
        case "PENDING":
          return BadgeStatus.AWAITING;
        case "OVERDUE":
          return BadgeStatus.FAIL;
        default:
          return BadgeStatus.NEUTRAL;
      }
    })();

    return {
      __id: b.invoice?.uuid,
      __billId: b.id,
      __invoiceUuid: b.invoice?.uuid,
      "header-0": (
        <div className="flex justify-center items-center" onClick={e => e.stopPropagation()}>
          <CustomCheckbox
            checked={checkedRows.includes(idx)}
            onChange={() => handleCheckRow(idx)}
            disabled={b.status !== BillStatusEnum.PENDING}
          />
        </div>
      ),
      "Creation date": createdDate,
      Invoice: b.invoice?.invoiceNumber || b.uuid,
      Name: b.invoice?.fromDetails?.name || (b.invoice?.fromDetails as any).companyName,
      Group: (
        <div className="flex justify-center items-center">
          <CategoryBadge
            shape={groups?.find(grp => grp.id === b.invoice?.employee?.groupId)?.shape || CategoryShapeEnum.CIRCLE}
            color={groups?.find(grp => grp.id === b.invoice?.employee?.groupId)?.color || "#35ADE9"}
            name={groups?.find(grp => grp.id === b.invoice?.employee?.groupId)?.name || "Client"}
          />
        </div>
      ),
      Amount: (
        <div className="flex items-center gap-2 justify-center">
          <span>{b.invoice?.total || "0"}</span>
          {/* TODO: Add token icon and network */}
          <div className="flex items-center gap-2">{b.invoice?.paymentToken?.name?.toUpperCase()}</div>
          {/* <img
            alt={`${b.invoice?.paymentNetwork?.name?.toLowerCase()}`}
            className="w-4"
            src={`/token/${b.invoice?.paymentToken?.name?.toLowerCase()}.svg` || "USDT"}
          /> */}
        </div>
      ),
      "Due Date": dueDate,
      Status: (
        <div className="w-full flex justify-center items-center">
          <Badge text={b.status} status={badgeStatus} className="px-5" />
        </div>
      ),
    };
  });

  // Only consider pending bills for "check all" functionality
  const pendingBillsCount = bills.filter(b => b.status === BillStatusEnum.PENDING).length;
  const checkedPendingCount = checkedRows.filter(idx => bills[idx]?.status === BillStatusEnum.PENDING).length;
  const isAllChecked = pendingBillsCount > 0 && checkedPendingCount === pendingBillsCount;

  return (
    <div className="flex flex-col w-full h-full justify-start items-start p-5 gap-5">
      <div className="flex flex-col w-full px-5 gap-10">
        <div className="flex flex-row gap-3">
          <img src="/sidebar/bill.svg" alt="Bill Placeholder" className="w-6" />
          <span className="font-bold text-2xl">Bills</span>
        </div>
        <div className="flex flex-row w-full gap-2">
          <Card
            title="All bills"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">{billStats?.totalBills ?? 0}</span>
            }
          />
          <Card
            title="Pending"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">{billStats?.totalPending ?? 0}</span>
            }
          />
          <Card
            title="Paid"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">{billStats?.totalPaid ?? 0}</span>
            }
          />
          <Card
            title="Overdue"
            text={
              <span className="text-text-primary text-2xl font-bold leading-none">{billStats?.totalOverdue ?? 0}</span>
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
                  { id: "pending", label: "Pending" },
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
          <div className="flex items-center gap-2">
            {/* TODO: IMPLEMENT SORT AND FILTER */}
            {/* <SecondaryButton
              text="Sort"
              icon="/misc/sort-icon.svg"
              onClick={() => console.log("Sort button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            /> */}
            {/* <SecondaryButton
              text="Filter"
              icon="/wallet-analytics/setting-icon.gif"
              onClick={() => console.log("Filter button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            /> */}
          </div>
        </div>
        <Table
          headers={[
            <div className="flex justify-center items-center">
              <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
            </div>,
            "Creation date",
            "Invoice",
            "Name",
            "Group",
            "Amount",
            "Due Date",
            "Status",
          ]}
          data={billDatas}
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
            router.push(`/bill/detail?uuid=${invoiceUUID}`);
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
          const bill = bills?.find(b => b.id === id);
          if (!bill) return null;

          const handlePay = async () => {
            // Collect uuids: include the clicked bill and any selected rows
            const selectedUUIDs = checkedRows.map(i => bills[i]?.invoice?.uuid).filter(Boolean) as string[];
            const uuids = Array.from(new Set([bill.invoice?.uuid, ...selectedUUIDs]));

            if (uuids.length === 0) return;

            const params = new URLSearchParams();

            //@ts-ignore
            uuids.forEach(u => params.append("invoiceUUID", u));
            router.push(`/bill/review?${params.toString()}`);
          };

          const handleDelete = () => {
            openModal("REMOVE_INVOICE", {
              invoiceOwnerName: bill.invoice?.fromDetails?.name || "",
              onRemove: async () => {
                await cancelInvoiceData(bill.invoice?.uuid || "");
                toast.success("Invoice cancelled successfully");
                // deleteBill.mutate(bill.uuid, {
                //   onError: err => {
                //     console.error("Delete invoice failed", err);
                //     toast.error("Failed to delete invoice");
                //   },
                // });
              },
            });
          };

          const handleDownload = async () => {
            try {
              if (!bill.invoice?.uuid) throw new Error("Invoice UUID not found");
              const blob = await downloadPdf(bill.invoice?.uuid);
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `invoice-${bill.invoice?.invoiceNumber || bill.uuid}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Failed to download PDF:", err);
            }
          };

          const handleCopyInvoiceLink = async () => {
            try {
              const link = `${window.location.origin}/invoice-review?invoiceUUID=${bill.uuid}`;
              await navigator.clipboard.writeText(link);
              // Lightweight confirmation
              toast.success("Invoice link copied to clipboard");
            } catch (err) {
              console.error("Failed to copy invoice link", err);
            }
          };

          return (
            <BillActionTooltip
              onCopyInvoiceLink={handleCopyInvoiceLink}
              onDeleteInvoice={handleDelete}
              onDownloadPDF={handleDownload}
              onPay={handlePay}
              billStatus={bill.status}
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
                const uuids = checkedRows.map(i => bills[i]?.invoice?.uuid).filter(Boolean) as string[];
                if (uuids.length === 0) return;
                // Navigate to review page with multiple invoiceUUID query params
                const params = new URLSearchParams();
                uuids.forEach(u => params.append("invoiceUUID", u));
                router.push(`/bill/review?${params.toString()}`);
              }}
            />
          }
        />
      )}
    </div>
  );
};

export default BillContainer;
