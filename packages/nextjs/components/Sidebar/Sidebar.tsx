"use client";
import React, { useState, useEffect } from "react";
import { NavSections } from "./NavSection";
import { Connect } from "./Connect";
import { useRouter, usePathname } from "next/navigation";

interface NavProps {
  onActionItemClick?: (sectionIndex: number, itemIndex: number) => void;
  onTeamItemClick?: (index: number) => void;
  onConnectWallet?: () => void;
}

// Enum for sidebar links
export enum SidebarLink {
  Dashboard = "dashboard",
  Send = "send",
  Batch = "batch",
  Gift = "gift",
  AIAssistant = "ai-assistant",
  GroupPayment = "group-payment",
  AddressBook = "address-book",
  AccountManagement = "account-management",
  Transactions = "transactions",
}

export const actionItems = [
  {
    title: "Action",
    items: [
      {
        icon: "/sidebar/dashboard.gif",
        label: "Dashboard",
        isActive: true,
        link: SidebarLink.Dashboard,
        disabled: false,
      },
      { icon: "/sidebar/send.gif", label: "Send", isActive: false, link: SidebarLink.Send, disabled: false },
      { icon: "/sidebar/gift.gif", label: "Gift", isActive: false, link: SidebarLink.Gift, disabled: true },
      // {
      //   icon: "/sidebar/ai-assistant.gif",
      //   label: "AI Assistant",
      //   isActive: false,
      //   link: SidebarLink.AIAssistant,
      //   disabled: true,
      // },
      { icon: "/sidebar/batch.gif", label: "Batch", isActive: false, link: SidebarLink.Batch, disabled: false },
      {
        icon: "/sidebar/group-payment.gif",
        label: "Group Payment",
        isActive: false,
        link: SidebarLink.GroupPayment,
        disabled: true,
      },
      {
        icon: "/sidebar/address-book.gif",
        label: "Address Book",
        isActive: false,
        link: SidebarLink.AddressBook,
        disabled: false,
      },
    ],
  },
  {
    title: "Team",
    items: [
      {
        icon: "/sidebar/account-management.gif",
        label: "Manage Accounts",
        isActive: false,
        link: SidebarLink.AccountManagement,
        disabled: true,
      },
      {
        icon: "/sidebar/transactions.gif",
        label: "Transactions",
        isActive: false,
        link: SidebarLink.Transactions,
        disabled: false,
      },
    ],
  },
];

export const Sidebar: React.FC<NavProps> = ({ onActionItemClick }) => {
  const [action, setActions] = useState(actionItems);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setActions(prev =>
      prev.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          isActive: pathname?.startsWith(`/${item.link}`),
        })),
      })),
    );
  }, [pathname]);

  const handleActionItemClick = (sectionIndex: number, itemIndex: number) => {
    const item = action[sectionIndex].items[itemIndex];

    // Don't navigate if item is disabled
    if (item.disabled) {
      return;
    }

    const link = item.link;
    setActions(prev =>
      prev.map((section, sIdx) => ({
        ...section,
        items: section.items.map((item, i) => ({
          ...item,
          isActive: sIdx === sectionIndex && i === itemIndex,
        })),
      })),
    );
    router.push(`/${link}`);
    onActionItemClick?.(sectionIndex, itemIndex);
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
            <div className="flex items-center justify-center px-3 border-gradient ml-10 ">
              <p className="text-[13px] font-semibold text-[#7C7C7C]">Beta</p>
            </div>
          </header>
          <div className="h-[1px] bg-neutral-700 my-3" />
          {/* Action */}
          <NavSections sections={action} onItemClick={handleActionItemClick} />
        </div>
        {/* Connect/Account section */}
        <Connect />
      </div>
    </nav>
  );
};

export default Sidebar;
