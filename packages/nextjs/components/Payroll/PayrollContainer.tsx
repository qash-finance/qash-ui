"use client";
import React, { useState } from "react";
import { Header } from "./Header";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";

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

  const tabs = getTabs();

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
          <div className="flex w-full justify-start items-center px-5 py-2">
            <TabContainer
              tabs={tabs}
              activeTab={activeTab.id}
              setActiveTab={tabId => {
                const tab = tabs.find(t => t.id === tabId);
                if (tab) {
                  setActiveTab(tab);
                }
              }}
              textSize="sm"
            />
          </div>
        }
        containerClassName="w-full h-full"
      >
        <div className="flex flex-col min-h-[570px] max-h-[570px]">
          <div className="w-full justify-between items-center flex p-5 pb-3">
            <div className="flex flex-col gap-2">
              <span className="text-text-primary text-xl leading-none">{activeTab.displayLabel}</span>
              <span className="text-text-secondary text-sm leading-none">{activeTab.description}</span>
            </div>
          </div>

          <div className="overflow-y-auto w-full px-5 pb-5">{renderTabContent()}</div>
        </div>
      </BaseContainer>
    </div>
  );
};

export default PayrollContainer;
