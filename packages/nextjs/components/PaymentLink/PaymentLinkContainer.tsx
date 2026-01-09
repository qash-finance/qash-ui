import React, { useState, useMemo, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { PrimaryButton } from "../Common/PrimaryButton";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { Table } from "../Common/Table";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { useRouter } from "next/navigation";
import {
  useGetPaymentLinks,
  useDeletePaymentLinks,
  useActivatePaymentLink,
  useDeactivatePaymentLink,
} from "@/services/api/payment-link";
import { PaymentLink, PaymentLinkStatus } from "@/types/payment-link";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import toast from "react-hot-toast";
import { PaymentLinkActionsTooltip } from "./PaymentLinkActionsTooltip";
import { SecondaryButton } from "../Common/SecondaryButton";
import { Badge, BadgeStatus } from "../Common/Badge";

const tabs = [
  { id: "all", label: "All links", title: "All payment links", description: "Share these links for payments." },
  { id: "active", label: "Active", title: "Active links", description: "Share these links for payments." },
  {
    id: "deactivated",
    label: "Deactivated",
    title: "Deactivated links",
    description: "This link is no longer active. Generate a new link.",
  },
];

const Card = ({ title, amount }: { title: string; amount: string }) => {
  return (
    <div className="relative w-full h-full rounded-xl border border-primary-divider p-5 flex flex-col overflow-hidden">
      <span className="text-text-secondary text-sm">{title}</span>
      <span className="text-text-primary font-semibold text-2xl">{amount}</span>

      <img
        src="/card/background.svg"
        alt=""
        className="absolute -top-3.5 right-5 w-[152px] h-[154px] opacity-80"
        aria-hidden="true"
      />
    </div>
  );
};

const PaymentLinkContainer = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const { data: paymentLinks = [], isLoading, error } = useGetPaymentLinks();
  const deletePaymentLinksMutation = useDeletePaymentLinks();
  const activatePaymentLinkMutation = useActivatePaymentLink();
  const deactivatePaymentLinkMutation = useDeactivatePaymentLink();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside any tooltip trigger or tooltip content
      if (!target.closest("[data-tooltip-id]") && !target.closest(".tooltip-content")) {
        setActiveTooltipId(null);
      }
    };

    if (activeTooltipId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltipId]);

  const { allLinks, activeLinks, inactiveLinks } = useMemo(() => {
    // Sort by order field
    const sortedLinks = [...paymentLinks].sort((a, b) => a.order - b.order);

    const active = sortedLinks.filter(link => link.status === PaymentLinkStatus.ACTIVE);
    const inactive = sortedLinks.filter(link => link.status === PaymentLinkStatus.DEACTIVATED);

    return {
      allLinks: sortedLinks,
      activeLinks: active,
      inactiveLinks: inactive,
    };
  }, [paymentLinks]);

  const handleSelectRow = (index: number) => {
    setSelectedRows(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
  };

  const displayedLinks = useMemo(() => {
    if (activeTab.id === "active") return activeLinks;
    if (activeTab.id === "deactivated") return inactiveLinks;
    return allLinks;
  }, [activeTab.id, activeLinks, inactiveLinks, allLinks]);

  const handleCheckAll = () => {
    if (selectedRows.length === displayedLinks.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedLinks.map((_, index) => index));
    }
  };

  const isAllChecked = displayedLinks.length > 0 && selectedRows.length === displayedLinks.length;

  // Tooltip action handlers
  const handleEdit = (linkIndex: number) => {
    const link = displayedLinks[linkIndex];
    if (link) {
      router.push(`/payment-link/edit?code=${link.code}`);
      setActiveTooltipId(null);
    }
  };

  const handleToggleStatus = (linkIndex: number, isActive: boolean) => {
    const link = displayedLinks[linkIndex];
    if (link) {
      // `isActive` is the new state coming from the ToggleSwitch: true => activate, false => deactivate
      const mutation = isActive ? activatePaymentLinkMutation : deactivatePaymentLinkMutation;
      mutation.mutate(link.code, {
        onSuccess: () => {
          toast.success(`Payment link ${isActive ? "activated" : "deactivated"} successfully`);
          setActiveTooltipId(null);
        },
        onError: (error: any) => {
          toast.error(error?.message || `Failed to ${isActive ? "activate" : "deactivate"} payment link`);
        },
      });
    }
  };

  const handleRemove = async (linkIndex: number) => {
    const link = displayedLinks[linkIndex];
    if (!link) {
      toast.error("Payment link not found");
      return;
    }

    try {
      const response = await deletePaymentLinksMutation.mutateAsync([link.code]);
      toast.success(response.message || "Payment link deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete payment link");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("No payment links selected");
      return;
    }

    const codesToDelete = selectedRows.map(index => displayedLinks[index].code);

    try {
      const response = await deletePaymentLinksMutation.mutateAsync(codesToDelete);
      toast.success(response.message || `${response.deletedCount} payment link(s) deleted successfully`);
      setSelectedRows([]); // Clear selection after successful deletion
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete payment links");
    }
  };

  const tableData = useMemo(() => {
    return displayedLinks.map((link: PaymentLink) => ({
      id: link.id, // Add id field for drag and drop
      "header-0": (
        <div className="flex justify-center items-center" onClick={e => e.stopPropagation()}>
          <CustomCheckbox
            checked={selectedRows.includes(displayedLinks.indexOf(link))}
            onChange={() => handleSelectRow(displayedLinks.indexOf(link))}
          />
        </div>
      ),
      Link: (
        <span className="text-text-primary text-sm leading-none underline">
          {process.env.NEXT_PUBLIC_APP_URL}/payment/{link.code}
        </span>
      ),
      Title: link.title,
      Timestamp: new Date(link.createdAt).toLocaleString("sv-SE", { hour12: false }),
      Amount: (
        <div className="flex justify-center items-center gap-1">
          <span className="text-text-primary leading-none">{link.amount}</span>
          <img
            src={
              link.acceptedTokens?.[0]?.symbol === "QASH"
                ? "/token/qash.svg"
                : blo(turnBechToHex(link.acceptedTokens?.[0]?.address || ""))
            }
            alt={link.acceptedTokens?.[0]?.symbol}
            className="w-4 h-4"
          />
        </div>
      ),
      Status: (
        <Badge
          status={link.status === PaymentLinkStatus.ACTIVE ? BadgeStatus.SUCCESS : BadgeStatus.NEUTRAL}
          text={link.status}
          className="!py-2"
        />
      ),
      Action: (
        <div className="flex justify-center items-center" onClick={e => e.stopPropagation()}>
          <SecondaryButton
            text="Copy Link"
            onClick={() => {
              const url = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${link.code}`;
              navigator.clipboard.writeText(url);
              toast.success("Payment link copied to clipboard");
            }}
            icon="/misc/thin-copy-icon.svg"
            iconPosition="left"
            buttonClassName="w-[130px] "
          />
        </div>
      ),
      " ": (
        <div className="flex justify-center items-center">
          <div
            data-tooltip-id={`payment-link-actions-${displayedLinks.indexOf(link)}`}
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              setActiveTooltipId(
                activeTooltipId === `payment-link-actions-${displayedLinks.indexOf(link)}`
                  ? null
                  : `payment-link-actions-${displayedLinks.indexOf(link)}`,
              );
            }}
          >
            <img src="/misc/three-dot-icon.svg" alt="More" className="w-6 h-6" />
          </div>
        </div>
      ),
    }));
  }, [displayedLinks, selectedRows, deletePaymentLinksMutation.isPending]);

  const tableHeaders = [
    <div className="flex justify-center items-center">
      <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />
    </div>,
    "Link",
    "Title",
    "Timestamp",
    "Amount",
    "Status",
    "Action",
    " ",
  ];
  return (
    <div className="flex flex-col w-full h-full p-4 items-center justify-start gap-5">
      {/* Header */}
      <div className="w-full flex flex-col gap-5 px-7">
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <img src="/sidebar/payment-link.svg" alt="Payment Link" />
            <h1 className="text-2xl font-bold">Payment Link</h1>
          </div>
          <PrimaryButton
            text="Create payment link"
            icon="/misc/plus-icon.svg"
            iconPosition="left"
            onClick={() => {
              router.push("/payment-link/create");
            }}
            containerClassName="w-[190px]"
          />
        </div>
        <div className="w-full flex flex-row gap-2">
          <Card title="All payment links" amount={allLinks.length.toString()} />
          <Card title="Active links" amount={activeLinks.length.toString()} />
          <Card title="Deactivated links" amount={inactiveLinks.length.toString()} />
        </div>
      </div>

      <BaseContainer
        header={
          <div className="w-full flex items-center justify-start p-5">
            <TabContainer
              tabs={tabs}
              activeTab={activeTab.id}
              setActiveTab={(tab: string) => setActiveTab(tabs.find(t => t.id === tab) || tabs[0])}
            />
          </div>
        }
        childrenClassName="p-5 gap-5"
        containerClassName="w-full h-full relative"
      >
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl leading-none">{activeTab.title}</span>
          <span className="text-text-secondary text-sm leading-none">{activeTab.description}</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <img src="/loading-square.gif" alt="loading" className="w-12 h-12" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-text-secondary">Failed to load payment links</span>
          </div>
        ) : (
          <Table
            headers={tableHeaders}
            data={tableData}
            actionColumn={false}
            showFooter={false}
            showPagination={true}
            selectedRows={selectedRows}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            columnWidths={{
              "1": "330px",
              "3": "180px",
              "6": "80px",
              "7": "50px",
            }}
            onRowClick={(_, index) => {
              const link = displayedLinks[index];
              if (link) {
                router.push(`/payment-link/detail?code=${link.code}`);
              }
            }}
          />
        )}

        {selectedRows.length > 0 && (
          <div
            className="flex flex-row items-center justify-between absolute bottom-20 right-5 bg-background rounded-lg p-3 border border-primary-divider gap-2 cursor-pointer hover:bg-red-50 transition-colors"
            onClick={handleBulkDelete}
          >
            <img src="/misc/trashcan-icon.svg" alt="trash" className="w-5 h-5" />
            <span className="text-[#E93544]">Remove {selectedRows.length} links</span>
          </div>
        )}
      </BaseContainer>

      {/* Payment Link Actions Tooltips */}
      {displayedLinks.map((link, index) => (
        <Tooltip
          key={`payment-link-actions-${index}`}
          id={`payment-link-actions-${index}`}
          clickable
          style={{
            zIndex: 30,
            borderRadius: "16px",
            padding: "0",
          }}
          place="left"
          openOnClick
          noArrow
          border="none"
          opacity={1}
          isOpen={activeTooltipId === `payment-link-actions-${index}`}
          afterHide={() => setActiveTooltipId(null)}
          render={() => (
            <div className="tooltip-content">
              <PaymentLinkActionsTooltip
                link={link}
                onEdit={() => handleEdit(index)}
                onToggleStatus={(isActive: boolean) => handleToggleStatus(index, isActive)}
                onRemove={() => handleRemove(index)}
              />
            </div>
          )}
        />
      ))}
    </div>
  );
};

export default PaymentLinkContainer;
