"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { PrimaryButton } from "../../Common/PrimaryButton";
import AccountCard from "./AccountCard";

export interface Account {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  memberCount: number;
  icon: string;
}

interface AccountTabProps {
  accounts: Account[];
  onCreateNewAccount: () => void;
  onMenuClick: (accountId: string) => void;
}

const AccountTab: React.FC<AccountTabProps> = ({ onCreateNewAccount, onMenuClick, accounts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleAccountClick = (accountId: string) => {
    router.push(`/setting?team-account=${accountId}`);
  };

  // Empty State Component
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center py-12 px-10 w-full rounded-2xl">
        {/* Icon */}
        <img src="/setting/new-account.svg" alt="Empty state" className="w-40" />

        {/* Content */}
        <div className="flex flex-col gap-6 items-center">
          {/* Text */}
          <div className="flex flex-col gap-1 items-center">
            <h2 className="text-2xl font-semibold text-text-primary text-center">Create a New Account</h2>
            <p className="text-sm font-medium text-text-secondary text-center max-w-sm">
              Set up a shared multisig account that your team can use to track, approve, and manage every transaction
              together.
            </p>
          </div>

          {/* Button */}
          <PrimaryButton
            text="Create a account"
            icon="/misc/plus-icon.svg"
            iconPosition="left"
            onClick={onCreateNewAccount}
            containerClassName="w-48"
          />
        </div>
      </div>
    );
  }

  // Accounts List View
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search and Create Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Search Input */}
        <section className="flex flex-row items-center justify-between px-3 py-2 border border-primary-divider rounded-xl bg-app-background w-[200px]">
          <input
            type="text"
            placeholder="Search account"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-sm text-text-primary outline-none placeholder-text-secondary w-full"
          />
          <img src="/misc/blue-search-icon.svg" alt="search" className="w-5 h-5" />
        </section>

        {/* Create Button */}
        <SecondaryButton
          text="Create new account"
          icon="/misc/plus-icon.svg"
          iconPosition="left"
          onClick={onCreateNewAccount}
          buttonClassName="w-fit px-3"
        />
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            onClick={handleAccountClick}
            onMenuClick={onMenuClick}
          />
        ))}
      </div>
    </div>
  );
};

export default AccountTab;
