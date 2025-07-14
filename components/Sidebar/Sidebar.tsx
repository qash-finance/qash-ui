"use client";
import React, { useState } from "react";
import { NavSection } from "./NavSection";
import { Connect } from "./Connect";
import Account from "./Account";
import { useRouter, usePathname } from "next/navigation";

interface NavProps {
  onActionItemClick?: (index: number) => void;
  onTeamItemClick?: (index: number) => void;
  onConnectWallet?: () => void;
}

// Enum for sidebar links
export enum SidebarLink {
  Dashboard = "dashboard/pending-recieve",
  Send = "send",
  Batch = "batch",
  GroupPayment = "group-payment",
  AddressBook = "address-book",
}

const actionItems = [
  { icon: "/sidebar/dashboard.svg", label: "Dashboard", isActive: true, link: SidebarLink.Dashboard },
  { icon: "/sidebar/send.svg", label: "Send", isActive: false, link: SidebarLink.Send },
  { icon: "/sidebar/batch.svg", label: "Batch", isActive: false, link: SidebarLink.Batch },
  { icon: "/sidebar/group-payment.svg", label: "Group Payment", isActive: false, link: SidebarLink.GroupPayment },
  { icon: "/sidebar/address-book.svg", label: "Address Book", isActive: false, link: SidebarLink.AddressBook },
];

const teamItems = [
  { icon: "/sidebar/account-management.svg", label: "Account Management", isActive: false },
  { icon: "/sidebar/transaction.svg", label: "Transaction", isActive: false },
];

export const Sidebar: React.FC<NavProps> = ({ onActionItemClick, onTeamItemClick, onConnectWallet }) => {
  // Remove actionItemsState, just use actionItems
  const [teamItemsState, setTeamItems] = useState(teamItems);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleActionItemClick = (index: number) => {
    // No need to set isActive, it's derived from pathname
    const link = actionItems[index].link;
    router.push(`/${link}`);
    onActionItemClick?.(index);
  };

  // Compute isActive for each item based on pathname
  const actionItemsWithActive = actionItems.map(item => ({
    ...item,
    isActive: pathname === `/${item.link}`,
  }));

  const handleTeamItemClick = (index: number) => {
    setTeamItems(items => items.map((item, i) => ({ ...item, isActive: i === index })));
    onTeamItemClick?.(index);
  };

  const handleConnectWallet = () => {
    setIsConnected(true);
    onConnectWallet?.();
  };

  return (
    <nav className="overflow-hidden pt-3.5 rounded-lg bg-neutral-900 max-w-[400px] h-screen">
      <div className="flex flex-col justify-between h-full">
        <div className="px-3.5 w-full">
          {/* Logo */}
          <header className={`flex gap-3.5 max-w-full leading-tight w-[140px]`}>
            <div className="flex gap-2.5 items-center text-xl font-extrabold tracking-tight text-blue-600">
              <img src="/q3x-icon.svg" alt="Q3x" className="w-10 h-10" />
              <h1 className="self-stretch my-auto">
                Q3<span style={{ color: "rgba(213,106,255,1)" }}>x</span>
              </h1>
            </div>
            <div className="flex overflow-hidden gap-0.5 justify-center items-center py-1 pr-2.5 pl-3 my-auto text-xs font-medium whitespace-nowrap rounded-3xl border-solid bg-blend-luminosity bg-stone-50 bg-opacity-10 border-[0.567px] border-white border-opacity-40 text-neutral-500">
              <span className="self-stretch my-auto text-neutral-500">Beta</span>
            </div>
          </header>

          <div className="h-[1px] bg-neutral-700 my-3" />

          {/* Action */}
          <NavSection title="Action" items={actionItemsWithActive} onItemClick={handleActionItemClick} />

          {/* Team */}
          <NavSection title="Team" items={teamItemsState} onItemClick={handleTeamItemClick} />
        </div>

        {/* Account */}
        {isConnected ? <Account /> : <Connect onConnectWallet={handleConnectWallet} />}
      </div>
    </nav>
  );
};

export default Sidebar;
