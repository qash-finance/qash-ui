"use client";
import React, { useState } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { ReceivePayment, ReceivePaymentHeader } from "./PaymentInteration/ReceivePayment";

const tabs = [
  { id: "payment-request", label: "Payment Request", description: "Send a request, receive funds with ease" },
  { id: "receive", label: "Receive", description: "Receive tokens by claiming them here." },
  {
    id: "cancel-payment",
    label: "Cancel Payment",
    description: "Cancel a pending payment anytime before it’s claimed",
  },
  { id: "payroll", label: "Payroll" },
];

export const PaymentInteraction = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Tab content renderers
  const renderPaymentRequestContent = () => (
    <div className="text-center py-8 text-neutral-500">Cancel Payment content coming soon</div>
  );

  const renderCancelPaymentContent = () => (
    <div className="text-center py-8 text-neutral-500">Cancel Payment content coming soon</div>
  );

  const renderPayrollContent = () => (
    <div className="text-center py-8 text-neutral-500">Payroll content coming soon</div>
  );

  // Main content renderer based on active tab
  const renderTabContent = () => {
    switch (activeTab.id) {
      case "payment-request":
        return renderPaymentRequestContent();
      case "receive":
        return <ReceivePayment />;
      case "cancel-payment":
        return renderCancelPaymentContent();
      case "payroll":
        return renderPayrollContent();
    }
  };

  return (
    <BaseContainer
      header={
        <div className="flex w-full justify-start items-center px-5 py-2">
          <TabContainer
            tabs={tabs}
            activeTab={activeTab.id}
            setActiveTab={tabId => {
              const tab = tabs.find(t => t.id === tabId);
              if (tab) setActiveTab(tab);
            }}
            textSize="sm"
          />
        </div>
      }
    >
      <div className="flex flex-col min-h-[555px] max-h-[555px]">
        <div className="w-full justify-between items-center flex p-5">
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-xl leading-none">{activeTab.label}</span>
            <span className="text-text-secondary text-sm leading-none">{activeTab.description}</span>
          </div>
          {activeTab.id === "receive" && <ReceivePaymentHeader />}
        </div>

        <div className=" overflow-y-auto w-full px-5 pb-5">{renderTabContent()}</div>
      </div>
    </BaseContainer>
  );
};
