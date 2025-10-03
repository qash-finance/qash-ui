import React, { useState } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import Card from "./Card";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { useRouter } from "next/navigation";

const tabs = [
  { id: "all", label: "All links", title: "All payment links", description: "Share these links for payments." },
  { id: "active", label: "Active", title: "Active links", description: "Active links" },
];

const PaymentLinkContainer = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabs[0]);
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
          <Card title="All payment links" amount="10" />
          <Card title="Active links" amount="10" />
          <Card title="Deactivated links" amount="10" />
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
        containerClassName="w-full h-full"
      >
        <div className="flex flex-col gap-2 p-5">
          <span className="text-text-primary text-2xl leading-none">{activeTab.title}</span>
          <span className="text-text-secondary text-sm leading-none">{activeTab.description}</span>
        </div>
      </BaseContainer>
    </div>
  );
};

export default PaymentLinkContainer;
