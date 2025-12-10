"use client";
import React, { useState } from "react";
import { Header } from "./Header";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { SecondaryButton } from "../Common/SecondaryButton";
import { Table } from "../Common/Table";
import PayrollActionTooltip from "./PayrollActionTooltip";
import { Tooltip } from "react-tooltip";

const getTabs = () => [
  {
    id: "manage-payrolls",
    label: "Manage Payroll",
    description: "Send a request, receive funds with ease",
    displayLabel: "Payroll management",
  },
  {
    id: "milestone",
    label: "Milestone",
    description: "View all assigned tasks here",
    displayLabel: "Milestone",
  },
  {
    id: "pending",
    label: "Pending",
    description: "Upcoming payrolls to be paid",
    displayLabel: "Pending Payrolls",
  },
];

const PayrollContainer = () => {
  const [activeTab, setActiveTab] = useState(() => getTabs()[0]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tabs = getTabs();

  // Sample payroll data without action column
  const payrollDataBase = [
    {
      "Employee name": "John Doe",
      Group: "Group A",
      Amount: (
        <div className="flex flex-row justify-center items-center gap-2">
          <img src="/token/qash.svg" alt="dollar" className="w-5" />
          <span className="font-bold">$3,500.00</span>
        </div>
      ),
      Date: "05th/month",
      "Contract Term": <span className="font-bold text-primary-blue">1 year</span>,
    },
    {
      "Employee name": "Bob Johnson",
      Group: "Group A",
      Amount: (
        <div className="flex flex-row justify-center items-center gap-2">
          <img src="/token/qash.svg" alt="dollar" className="w-5" />
          <span className="font-bold">$3,500.00</span>
        </div>
      ),
      Date: "05th/month",
      "Contract Term": <span className="font-bold text-primary-blue">1 year</span>,
    },
    {
      "Employee name": "Bob Johnson",
      Group: "Group A",
      Amount: (
        <div className="flex flex-row justify-center items-center gap-2">
          <img src="/token/qash.svg" alt="dollar" className="w-5" />
          <span className="font-bold">$3,500.00</span>
        </div>
      ),
      Date: "05th/month",
      "Contract Term": <span className="font-bold text-primary-blue">3 years</span>,
    },
  ];

  // Action handlers
  const handleEditPayroll = (index: number) => {
    console.log("Edit payroll:", index);
  };

  const handleRemovePayroll = (index: number) => {
    console.log("Remove payroll:", index);
  };

  // Action renderer for payroll table
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

  // Transform data to include action column
  const payrollData = payrollDataBase.map(item => ({
    ...item,
    " ": null, // Placeholder for action column
  }));

  // Main content renderer based on active tab
  const renderTabContent = () => {
    switch (activeTab.id) {
      case "active-payrolls":
        return <div>Active Payrolls Content</div>;
      case "payroll-history":
        return <div>Payroll History Content</div>;
      case "employee-management":
        return <div>Employee Management Content</div>;
      default:
        return <div>Default Content</div>;
    }
  };

  return (
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <Header />

      <BaseContainer
        header={
          <div className="flex w-full justify-between items-center p-5">
            <div className="flex flex-col gap-1">
              <span className="text-text-primary text-2xl font-medium leading-none">Overview</span>
              <span className="text-text-secondary text-[14px] font-medium leading-none">
                Send a request, receive funds with ease
              </span>
            </div>
            <div className="flex flex-row gap-5">
              {/* Search Bar */}
              <div className="bg-app-background border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-2 rounded-lg w-[300px]">
                <div className="flex flex-row gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Search by name"
                    className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
                >
                  <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
                </button>
              </div>

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
          </div>
        }
        childrenClassName="p-5"
        containerClassName="w-full h-full bg-[#F6F6F6]"
      >
        <Table
          headers={["Employee name", "Group", "Amount", "Date", "Contract Term"]}
          data={payrollData}
          actionColumn={true}
          actionRenderer={payrollActionRenderer}
          selectedRows={selectedRows}
          className="w-full"
          columnWidths={{
            0: "200px",
          }}
          rowClassName="py-5"
          headerClassName="py-3"
          showPagination={true}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </BaseContainer>

      {/* Payroll Action Tooltip */}
      <Tooltip
        id="payroll-action-tooltip"
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
          const index = parseInt(content, 10);
          return (
            <PayrollActionTooltip onEdit={() => handleEditPayroll(index)} onRemove={() => handleRemovePayroll(index)} />
          );
        }}
      />
    </div>
  );
};

export default PayrollContainer;
