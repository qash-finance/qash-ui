"use client";
import React, { useState, useRef, useEffect } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { ReceivePayment, ReceivePaymentHeader } from "./PaymentInteration/ReceivePayment";
import { CancelPayment } from "./PaymentInteration/CancelPayment";
import { PaymentLink } from "./PaymentInteration/PaymentLink";
import { FloatingFooter } from "../Common/FloatingFooter";
import { SecondaryButton } from "../Common/SecondaryButton";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useConsumableNotes } from "@/hooks/server/useConsumableNotes";
import { PartialConsumableNote } from "@/types/faucet";

const getTabs = () => [
  {
    id: "payment-link",
    label: "Payment Links",
    description: "Share these links for payments.",
    displayLabel: "Payment Links",
  },
  {
    id: "receive",
    label: "Receive",
    description: "Receive tokens by claiming them here.",
    displayLabel: "Receive",
  },
  {
    id: "cancel-payment",
    label: "Cancel Payment",
    description: "Cancel a pending payment anytime before it's claimed",
    displayLabel: "Cancel Payment",
  },
];

export const PaymentInteraction = () => {
  const [receivePaymentCheckedRows, setReceivePaymentCheckedRows] = useState<number[]>([]);
  const [paymentLinkCheckedRows, setPaymentLinkCheckedRows] = useState<number[]>([]);
  const [receiveNotesCount, setReceiveNotesCount] = useState(0);
  const [activeTab, setActiveTab] = useState(() => getTabs()[0]);
  const claimSelectedRef = useRef<(() => void) | null>(null);

  // **************** Custom Hooks *******************
  const { walletAddress, isConnected } = useWalletConnect();

  // **************** Server Hooks *******************
  const {
    data: consumableNotesFromServer,
    isLoading: isLoadingConsumableNotesFromServer,
    error: errorConsumableNotesFromServer,
    isRefetching: isRefetchingConsumableNotesFromServer,
  } = useConsumableNotes();

  // **************** Local State *******************
  const [consumableNotes, setConsumableNotes] = useState<PartialConsumableNote[]>([]);

  // Update consumable notes and count in background
  useEffect(() => {
    (async () => {
      if (walletAddress && isConnected) {
        if (!errorConsumableNotesFromServer) {
          if (consumableNotesFromServer) {
            setConsumableNotes(consumableNotesFromServer);
            setReceiveNotesCount(consumableNotesFromServer.length);
          } else {
            setConsumableNotes([]);
            setReceiveNotesCount(0);
          }
        } else {
          setConsumableNotes([]);
          setReceiveNotesCount(0);
        }
      }
    })();
  }, [walletAddress, isConnected, consumableNotesFromServer, isRefetchingConsumableNotesFromServer]);

  // Update receiveNotesCount whenever consumableNotes changes (e.g., when notes are claimed)
  useEffect(() => {
    setReceiveNotesCount(consumableNotes.length);
  }, [consumableNotes]);

  // Main content renderer based on active tab
  const renderTabContent = () => {
    switch (activeTab.id) {
      case "payment-link":
        return <PaymentLink checkedRows={paymentLinkCheckedRows} setCheckedRows={setPaymentLinkCheckedRows} />;
      case "receive":
        return (
          <ReceivePayment
            checkedRows={receivePaymentCheckedRows}
            setCheckedRows={setReceivePaymentCheckedRows}
            onClaimSelected={claimSelectedRef}
            consumableNotes={consumableNotes}
            setConsumableNotes={setConsumableNotes}
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
          <div className="flex w-full justify-start items-center px-5 py-2 relative">
            <TabContainer
              tabs={getTabs()}
              activeTab={activeTab.id}
              setActiveTab={tabId => {
                const tab = getTabs().find(t => t.id === tabId);
                if (tab) {
                  setActiveTab(tab);
                  setReceivePaymentCheckedRows([]);
                  setPaymentLinkCheckedRows([]);
                }
              }}
              textSize="sm"
            />
            {receiveNotesCount > 0 && (
              <div className="absolute left-75 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="flex items-center justify-center min-w-[20px] px-1.5 text-xs font-medium text-black"
                  style={{
                    borderRadius: "var(--radius-Round, 999px)",
                    border: "2px solid rgba(0, 180, 118, 0.50)",
                    background: "linear-gradient(180deg, #BCFFE8 0%, #08E89A 100%)",
                    boxShadow: "1.818px 2.727px 3.636px 0 rgba(255, 255, 255, 0.56) inset",
                  }}
                >
                  {receiveNotesCount}
                </div>
              </div>
            )}
          </div>
        }
        containerClassName="relative"
      >
        <div className="flex flex-col min-h-[570px] max-h-[570px]">
          <div className="w-full justify-between items-center flex p-5 pb-3">
            <div className="flex flex-col gap-2">
              <span className="text-text-primary text-xl leading-none">{activeTab.displayLabel}</span>
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
