"use client";
import React, { useState, useRef } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { ReceivePayment, ReceivePaymentHeader } from "./PaymentInteration/ReceivePayment";
import { CancelPayment } from "./PaymentInteration/CancelPayment";
import { FloatingFooter } from "../Common/FloatingFooter";
import { SecondaryButton } from "../Common/SecondaryButton";

const tabs = [
  { id: "payment-link", label: "Payment Links", description: "Share these links for payments." },
  { id: "receive", label: "Receive", description: "Receive tokens by claiming them here." },
  {
    id: "cancel-payment",
    label: "Cancel Payment",
    description: "Cancel a pending payment anytime before it’s claimed",
  },
];

export const PaymentInteraction = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [receivePaymentCheckedRows, setReceivePaymentCheckedRows] = useState<number[]>([]);
  const claimSelectedRef = useRef<(() => void) | null>(null);

  // Tab content renderers
  const renderPaymentRequestContent = () => (
    <div className="text-center py-8 text-neutral-500">Cancel Payment content coming soon</div>
  );

  // Main content renderer based on active tab
  const renderTabContent = () => {
    switch (activeTab.id) {
      case "payment-link":
        return renderPaymentRequestContent();
      case "receive":
        return (
          <ReceivePayment
            checkedRows={receivePaymentCheckedRows}
            setCheckedRows={setReceivePaymentCheckedRows}
            onClaimSelected={claimSelectedRef}
          />
        );
      case "cancel-payment":
        return <CancelPayment />;
    }
  };

  return (
    <div className="w-full">
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
                  setReceivePaymentCheckedRows([]);
                }
              }}
              textSize="sm"
            />
          </div>
        }
        containerClassName="relative"
      >
        <div className="flex flex-col min-h-[570px] max-h-[570px]">
          <div className="w-full justify-between items-center flex p-5 pb-3">
            <div className="flex flex-col gap-2">
              <span className="text-text-primary text-xl leading-none">{activeTab.label}</span>
              <span className="text-text-secondary text-sm leading-none">{activeTab.description}</span>
            </div>
            {activeTab.id === "receive" && <ReceivePaymentHeader />}
          </div>

          <div className=" overflow-y-auto w-full px-5 pb-5">{renderTabContent()}</div>
        </div>
      </BaseContainer>

      {receivePaymentCheckedRows.length > 0 && (
        <FloatingFooter
          selectedCount={receivePaymentCheckedRows.length}
          actionButtons={
            <>
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Remove button */}
                {/* <button
                  onClick={() => {
                    // TODO: Implement remove functionality
                    console.log("Remove selected items");
                  }}
                  className="bg-background rounded-full px-5 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <img src="/misc/trashcan-icon.svg" alt="remove" className="w-5 h-5" />
                </button> */}

                <button
                  onClick={() => {
                    // TODO: Implement export functionality
                    console.log("Export selected items");
                  }}
                  className="bg-background rounded-full px-5 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <img src="/misc/light-shopping-bag.svg" alt="export" className="w-5 h-5" />
                </button>

                <SecondaryButton
                  text="Claim"
                  onClick={() => {
                    if (claimSelectedRef.current) {
                      claimSelectedRef.current();
                    }
                  }}
                  disabled={receivePaymentCheckedRows.length === 0}
                  buttonClassName="flex-1 px-8 rounded-full"
                />
              </div>
            </>
          }
        />
      )}
    </div>
  );
};
