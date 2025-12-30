"use client";
import React, { useState } from "react";
import Image from "next/image";
import AccountSettings from "./AccountSettings";
import CompanySettings from "./CompanySettings";
import NotificationSettings from "./NotificationSettings";

type TabType = "account" | "notifications" | "company";

interface SettingTab {
  id: TabType;
  icon: string;
  label: string;
}

const settingTabs: SettingTab[] = [
  { id: "account", icon: "/misc/user-hexagon-icon.svg", label: "Account" },
  { id: "notifications", icon: "/misc/notification-icon.svg", label: "Notifications" },
  { id: "company", icon: "/misc/company-icon.svg", label: "Company" },
];

export default function SettingContainer() {
  const [activeTab, setActiveTab] = useState<TabType>("account");

  return (
    <div className="flex flex-row w-full h-full bg-app-background gap-2">
      {/* Sidebar */}
      <div className="bg-background flex flex-col items-start w-full max-w-[300px] h-full">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col gap-1 items-start pb-5 pt-3 px-3 w-full">
            {/* Header */}
            <div className="flex gap-[10px] items-center p-4 w-full">
              <div className="flex gap-3 items-center">
                <img src="/sidebar/setting.svg" alt="Settings" className="w-5" />
                <h1 className="font-semibold text-2xl text-text-primary tracking-[-0.48px] leading-none">Settings</h1>
              </div>
            </div>

            {/* General Label */}
            <div className="flex items-center px-4 py-0 w-full">
              <p className="font-medium text-sm text-text-secondary tracking-[-0.56px] leading-5">General</p>
            </div>

            {/* Tabs */}
            {settingTabs.map(tab => (
              <div
                key={tab.id}
                className={`flex gap-4 items-center px-5 py-3 rounded-lg w-full cursor-pointer transition-colors ${
                  activeTab === tab.id ? "bg-app-background" : "hover:bg-app-background/50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex gap-2 items-center">
                  <img src={tab.icon} alt={tab.label} className="w-5" />
                  <p className="font-medium text-sm text-text-primary tracking-[-0.56px] leading-5">{tab.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-background flex justify-center items-start overflow-y-auto">
        <div className="w-[800px]">
          {/* Content based on active tab */}
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "company" && <CompanySettings />}
        </div>
      </div>
    </div>
  );
}
