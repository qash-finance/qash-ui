"use client";

import { AmountInputTab } from "@/components/Send/SendTransactionForm";
import SendTransactionForm from "@/components/Send/SendTransactionForm";
import { StreamingTransactionDashboard } from "@/components/Send/Stream/StreamingTransactionDashboard";
import React, { useState } from "react";

export default function SendPage() {
  const [activeTab, setActiveTab] = useState<AmountInputTab>(AmountInputTab.SEND);

  const handleTabChange = (tab: AmountInputTab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className={` flex flex-col gap-2 w-full items-center h-full pt-[7%] ${
        activeTab === AmountInputTab.STREAM ? "overflow-y-auto" : "overflow-hidden"
      }`}
    >
      <SendTransactionForm activeTab={activeTab} onTabChange={handleTabChange} />
      <div
        className={`transition-all duration-700 ease-out ${activeTab === AmountInputTab.STREAM ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8 pointer-events-none"} w-full`}
      >
        <StreamingTransactionDashboard />
      </div>
    </div>
  );
}
