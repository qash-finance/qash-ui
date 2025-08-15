"use client";

import React, { Suspense, useState } from "react";
import { QuickSendForm, AmountInputTab } from "@/components/Send/QuickSendForm";

export default function QuickSendPage() {
  const [activeTab, setActiveTab] = useState<AmountInputTab>(AmountInputTab.SEND);

  return (
    <div className={` flex flex-col gap-2 w-full items-center h-full pt-[7%] `}>
      <div data-tour="send-form">
        <Suspense fallback={<div>Loading...</div>}>
          <QuickSendForm activeTab={activeTab} onTabChange={setActiveTab} />
        </Suspense>
      </div>
    </div>
  );
}
