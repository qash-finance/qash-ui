"use client";

import { useModal } from "@/contexts/ModalManagerProvider";
import React, { useState } from "react";
import AccountTab, { Account } from "../TeamSetting/AccountTab";
import MemberTab from "./MemberTab";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import Card from "@/components/Common/Card";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import AccountCard from "./AccountCard";
import MemberCard from "./MemberCard";

const members: any[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "mail@mail.com",
    companyRole: "Finance Manager",
    role: ["Owner", "Admin"],
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "mail@mail.com",
    companyRole: "Accountant",
    role: ["Admin"],
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "mail@mail.com",
    companyRole: "HR Specialist",
    role: ["Admin"],
  },
];
const TeamAccountContainer = () => {
  const { openModal } = useModal();

  const handleAddMembers = () => {
    console.log("Add new members");
  };

  const handleAccountClick = (accountId: string) => {};

  const onMenuClick = (accountId: string) => {};

  return (
    <div className="flex flex-col gap-5 w-[900px]">
      {/* Header Section */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3 items-center">
          <img src="/logo/qash-icon-dark.svg" alt="Team Avatar" className="w-12" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-text-primary leading-none">Payroll</h1>
            <p className="text-xs font-medium text-text-secondary leading-none">30 members</p>
          </div>
        </div>

        <div className="flex flex-row gap-2 w-fit">
          <SecondaryButton
            text="Deposit"
            icon="/arrow/thin-arrow-down.svg"
            iconPosition="left"
            onClick={() => openModal("DEPOSIT")}
            buttonClassName="py-1 w-fit px-3"
          />

          <PrimaryButton
            text="Add new members"
            icon="/misc/plus-icon.svg"
            iconPosition="left"
            onClick={handleAddMembers}
            containerClassName="w-[160px]"
          />

          <SecondaryButton
            text="Edit account"
            icon="/misc/edit-icon.svg"
            iconPosition="left"
            onClick={() => {}}
            variant="light"
            buttonClassName="py-1 w-fit px-3"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 w-full">
        {/* Account Stats Card */}
        <Card title="Member" amount="3" />

        {/* Member Stats Card */}
        <Card title="Threshold" amount="30" />
      </div>

      <div className="w-full flex justify-between items-center">
        <span className="text-2xl font-bold">Member</span>
        <div className="bg-app-background border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
          <div className="flex flex-row gap-2 flex-1">
            <input
              type="text"
              placeholder="Search by name"
              className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
            />
          </div>
          <button
            type="button"
            className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
          >
            <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {members.map(member => (
          <MemberCard key={member.id} member={member} onMenuClick={onMenuClick} />
        ))}
      </div>
    </div>
  );
};

export default TeamAccountContainer;
