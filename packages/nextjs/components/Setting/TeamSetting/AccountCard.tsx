import React from "react";
import { Account } from "./AccountTab";

interface AccountCardProps {
  account: Account;
  onClick: (accountId: string) => void;
  onMenuClick: (accountId: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onClick, onMenuClick }) => {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuClick(account.id);
  };

  return (
    <div
      className="border border-primary-divider rounded-[16px] p-4 flex flex-col gap-4 bg-app-background cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => onClick(account.id)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between">
        {/* Account Info */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Avatar */}
          <img src={account.icon} alt={account.name} className="w-10" />

          {/* Account Details */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-medium">{account.name}</h3>
            <p className="text-sm font-normal text-text-secondary leading-5">{account.description}</p>
          </div>

          {/* Team Members */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-medium text-text-secondary">{account.memberCount} members</span>
          </div>
        </div>

        {/* Menu Button */}
        <img
          src="/misc/vertical-three-dot-icon.svg"
          alt="Menu"
          className="w-6 cursor-pointer"
          onClick={handleMenuClick}
        />
      </div>
    </div>
  );
};

export default AccountCard;
