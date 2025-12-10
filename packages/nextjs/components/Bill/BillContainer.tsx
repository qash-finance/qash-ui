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

type Tab = "all" | "pending" | "paid";

const payrollActionRenderer = (rowData: Record<string, any>, index: number) => (
  <div className="flex items-center justify-center w-full">
    <img
      src="/misc/three-dot-icon.svg"
      alt="three dot icon"
      className="w-6 h-6 cursor-pointer"
      data-tooltip-id="payroll-action-tooltip"
      data-tooltip-content={index.toString()}
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
            Manage all the invoices you received from vendors
          </span>
        </div>
      );
    case "paid":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Pending bills</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">
            Waiting for vendor to review and confirm their invoices.
          </span>
        </div>
      );
    case "pending":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-2xl font-medium leading-none">Paid bills</span>
          <span className="text-text-secondary text-[14px] font-medium leading-none">
            All bills that have been fully paid.
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

  const handleCheckRow = (idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleCheckAll = () => {
    if (checkedRows.length === (paymentHistoryData?.length || 0)) {
      setCheckedRows([]);
    } else {
      setCheckedRows(paymentHistoryData?.map((_, idx) => idx) || []);
    }
  };

  const paymentHistoryData = [
    {
      "header-0": (
        <div className="flex justify-center items-center">
          <CustomCheckbox checked={checkedRows.includes(1)} onChange={() => handleCheckRow(1)} />
        </div>
      ),
      "Creation date": "Nov 10, 2025",
      Invoice: "#INV-001",
      Name: "Liam Carter",
      Team: "Engineering",
      Amount: (
        <div className="flex items-center gap-2 justify-center">
          <span>1,000</span>
          <img alt="USDT" className="w-4" src="/token/usdt.svg" />
        </div>
      ),
      "Due Date": "Dec 5, 2025",
      Status: (
        <div className="w-full flex justify-center items-center">
          <Badge text="Paid" status={BadgeStatus.SUCCESS} className="px-5" />
        </div>
      ),
    },
    {
      "header-0": (
        <div className="flex justify-center items-center">
          <CustomCheckbox checked={checkedRows.includes(1)} onChange={() => handleCheckRow(1)} />
        </div>
      ),
      "Creation date": "Oct 10, 2025",
      Invoice: "#INV-002",
      Name: "Liam Carter",
      Team: "Engineering",
      Amount: (
        <div className="flex items-center gap-2 justify-center">
          <span>1,000</span>
          <img alt="USDT" className="w-4" src="/token/usdt.svg" />
        </div>
      ),
      "Due Date": "Nov 5, 2025",
      Status: (
        <div className="w-full flex justify-center items-center">
          <Badge text="Paid" status={BadgeStatus.SUCCESS} className="px-5" />
        </div>
      ),
    },
    {
      "header-0": (
        <div className="flex justify-center items-center">
          <CustomCheckbox checked={checkedRows.includes(1)} onChange={() => handleCheckRow(1)} />
        </div>
      ),
      "Creation date": "Sep 10, 2025",
      Invoice: "#INV-003",
      Name: "Liam Carter",
      Team: "Engineering",
      Amount: (
        <div className="flex items-center gap-2 justify-center">
          <span>1,000</span>
          <img alt="USDT" className="w-4" src="/token/usdt.svg" />
        </div>
      ),
      "Due Date": "Oct 5, 2025",
      Status: (
        <div className="w-full flex justify-center items-center">
          <Badge text="Paid" status={BadgeStatus.AWAITING} className="px-5" />
        </div>
      ),
    },
  ];

  const renderFooterContent = () => {
    return (
      <div className="flex items-center justify-center gap-2 w-[350px]">
        <button
          type="button"
          className="bg-background justify-center border-t-1 border-primary-divider rounded-lg flex items-center gap-2 px-4 py-2 flex-1 cursor-pointer"
          onClick={() => {}}
        >
          <img alt="" className="w-5" src="/misc/light-shopping-bag.svg" />
          <span className="text-text-primary text-sm">Add to Batch</span>
        </button>
        <SecondaryButton
          text="Claim transactions"
          // onClick={() => handleClaimSelected()}
          // disabled={claiming}
          buttonClassName="flex-1"
        />
      </div>
    );
  };

  const isAllChecked = checkedRows.length === paymentHistoryData?.length;

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
            text={<span className="text-text-primary text-2xl font-bold leading-none">20</span>}
          />
          <Card title="Pending" text={<span className="text-text-primary text-2xl font-bold leading-none">5</span>} />
          <Card title="Paid" text={<span className="text-text-primary text-2xl font-bold leading-none">10</span>} />
          <Card title="Overdue" text={<span className="text-text-primary text-2xl font-bold leading-none">5</span>} />
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
            "Team",
            "Amount",
            "Due Date",
            "Status",
          ]}
          data={paymentHistoryData}
          className="w-full"
          rowClassName="py-5"
          headerClassName="py-3"
          showPagination={true}
          actionColumn={true}
          actionRenderer={payrollActionRenderer}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </BaseContainer>

      {checkedRows.length > 0 && (
        <FloatingAction
          selectedCount={checkedRows.length}
          actionButtons={<SecondaryButton text="Pay all" buttonClassName="w-40 rounded-full" />}
        />
      )}
    </div>
  );
};

export default BillContainer;
