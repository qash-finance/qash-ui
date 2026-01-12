"use client";
import React, { useState, useEffect } from "react";
import { PrimaryButton } from "../Common/PrimaryButton";
import Card from "../Common/Card";
import AccountTab, { Account } from "./TeamSetting/AccountTab";
import MemberTab from "./TeamSetting/MemberTab";
import { useModal } from "@/contexts/ModalManagerProvider";

const accounts: Account[] = [
  {
    id: "payroll",
    name: "Payroll",
    description: "Handles salary distribution and automates payroll transactions.",
    backgroundColor: "#6895ff",
    memberCount: 30,
    icon: "/client-invoice/payroll-icon.svg",
  },
  {
    id: "earning",
    name: "Earning",
    description: "Tracks all income, including bonuses and commissions.",
    backgroundColor: "#ff9a68",
    memberCount: 4,
    icon: "/client-invoice/earning-icon.svg",
  },
  {
    id: "accounting",
    name: "Accounting",
    description: "Handles salary distribution and automates payroll transactions.",
    backgroundColor: "#7d52f4",
    memberCount: 4,
    icon: "/client-invoice/accounting-icon.svg",
  },
];

const TeamSettings = () => {
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState<"account" | "member">("account");

  const handleAddMembers = () => {
    console.log("Add new members");
  };

  const handleCreateNewAccount = () => {
    openModal("CREATE_ACCOUNT");
  };

  const handleMenuClick = (accountId: string) => {
    console.log("Menu clicked for account:", accountId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <AccountTab accounts={accounts} onCreateNewAccount={handleCreateNewAccount} onMenuClick={handleMenuClick} />
        );
      case "member":
        return <MemberTab onMenuClick={handleMenuClick} />;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3 items-center">
          <img src="/logo/qash-icon-dark.svg" alt="Team Avatar" className="w-12" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-text-primary leading-none">Qash Team</h1>
            <p className="text-xs font-medium text-text-secondary leading-none">30 members</p>
          </div>
        </div>
        <PrimaryButton
          text="Add new members"
          icon="/misc/plus-icon.svg"
          iconPosition="left"
          onClick={handleAddMembers}
          containerClassName="w-[160px]"
        />
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 w-full">
        {/* Account Stats Card */}
        <Card title="Accounts" amount="3" info="Admins can submit proposals and cast votes." />

        {/* Member Stats Card */}
        <Card title="Members" amount="30" />
      </div>

      {/* Tabs */}
      {/** Employee or Client tab */}
      <div className="w-full flex flex-row border-b border-primary-divider relative">
        <div
          className="flex items-center justify-center px-10 py-3 w-[180px] cursor-pointer group transition-colors duration-300"
          onClick={() => setActiveTab("account")}
        >
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeTab === "account" ? "text-text-strong-950" : "text-text-soft-400 group-hover:text-text-soft-500"
            }`}
          >
            Account
          </p>
        </div>
        <div
          className="flex items-center justify-center px-10 py-3 w-[180px] cursor-pointer transition-colors duration-300"
          onClick={() => setActiveTab("member")}
        >
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeTab === "member" ? "text-text-strong-950" : "text-text-soft-400"
            }`}
          >
            Member
          </p>
        </div>
        <div
          className="absolute bottom-0 h-[3px] bg-primary-blue transition-all duration-300"
          style={{
            width: "180px",
            left: activeTab === "account" ? "0px" : "180px",
          }}
        />
      </div>

      {renderTabContent()}
    </div>
  );
};

export default TeamSettings;
