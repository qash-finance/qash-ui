"use client";

import { BaseContainer } from "@/components/Common/BaseContainer";
import { TabContainer } from "@/components/Common/TabContainer";
import SendTransactionForm from "@/components/Send/SendTransactionForm";
import { Receive } from "@/components/MoveCrypto/Receive";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { TransactionOverview } from "./TransactionOverview";
import { useTitle } from "@/contexts/TitleProvider";
import { Swap } from "./Swap";

interface TransactionData {
  amount: string;
  accountName: string;
  accountAddress: string;
  recipientName: string;
  recipientAddress: string;
  transactionType: string;
  cancellableTime: string;
  message: string;
  tokenAddress: string;
  tokenSymbol: string;
}

enum STEP {
  PREPARE = "prepare",
  OVERVIEW = "overview",
}

const tabs = [
  { id: "send", label: "Send" },
  { id: "receive", label: "Receive" },
  { id: "swap", label: "Swap" },
];

type TabId = "send" | "receive" | "swap";

const MoveCryptoContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();
  const [activeTab, setActiveTab] = useState<TabId>("send");
  const [step, setStep] = useState<STEP>(STEP.PREPARE);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);

  // Initialize URL with default tab if none exists
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabId;

    if (!tabFromUrl) {
      // No tab parameter in URL, set default to send
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "send");
      router.replace(`?${params.toString()}`, { scroll: false });
    } else if (tabs.some(tab => tab.id === tabFromUrl)) {
      // Valid and enabled tab parameter, set active tab
      setActiveTab(tabFromUrl);
    } else {
      // Invalid or disabled tab parameter, redirect to default
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "send");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    const tabId = tab as TabId;
    const selectedTab = tabs.find(t => t.id === tabId);

    // Only allow switching to enabled tabs
    if (selectedTab) {
      setActiveTab(tabId);

      // Update URL with new tab parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  // Handle transaction data from form
  const handleTransactionData = (data: TransactionData) => {
    setTransactionData(data);
    setStep(STEP.OVERVIEW);
    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Transfer /</span>
        <span className="text-text-primary">Transaction Overview</span>
      </div>,
    );
    setShowBackArrow(true);
    setOnBackClick(() => handleBackToForm);
  };

  // Handle going back to form
  const handleBackToForm = () => {
    setStep(STEP.PREPARE);
    setTitle("Welcome to Qash");
    setShowBackArrow(false);
    setOnBackClick(undefined);
  };

  const Title = () => {
    switch (activeTab) {
      case "send":
        return (
          <>
            <img src="/sidebar/move-crypto.svg" alt="send" className="w-6" />
            <span className="font-semibold text-text-primary text-2xl">Transfer</span>
          </>
        );
      case "receive":
        return (
          <>
            <img src="/arrow/thin-arrow-down.svg" alt="send" className="w-6" style={{ filter: "brightness(0)" }} />
            <span className="font-semibold text-text-primary text-2xl">Receive</span>
          </>
        );
      case "swap":
        return (
          <>
            <img src="/misc/swap-icon.svg" alt="send" className="w-6" />
            <span className="font-semibold text-text-primary text-2xl">Swap</span>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-3 gap-20">
      <div className="flex flex-row w-full px-4 gap-3">
        <Title />
      </div>
      <div className="flex justify-center items-start h-full">
        {step === STEP.PREPARE && (
          <BaseContainer
            header={
              <div className="flex w-full justify-center items-center">
                <TabContainer tabs={tabs} activeTab={activeTab} setActiveTab={handleTabChange} />
              </div>
            }
            containerClassName="w-[600px]"
          >
            {activeTab === "send" && <SendTransactionForm onTransactionData={handleTransactionData} />}
            {activeTab === "receive" && <Receive />}
            {activeTab === "swap" && <Swap />}
          </BaseContainer>
        )}

        {step === STEP.OVERVIEW && transactionData && (
          <TransactionOverview {...transactionData} onBack={handleBackToForm} />
        )}
      </div>
    </div>
  );
};

export default MoveCryptoContainer;
