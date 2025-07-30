"use client";
import React, { useState, useEffect } from "react";
import { NavSections } from "./NavSection";
import { Connect } from "./Connect";
import { useRouter, usePathname } from "next/navigation";
import { FloatingActionButton } from "../Common/FloatingActionButton";

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
    title: "Quick Access",
    items: [
      {
        icon: "/sidebar/dashboard.gif",
        label: "Dashboard",
        isActive: true,
        link: SidebarLink.Dashboard,
        disabled: false,
      },
      {
        icon: "/sidebar/address-book.gif",
        label: "Address Book",
        isActive: false,
        link: SidebarLink.AddressBook,
        disabled: false,
      },
      // {
      //   icon: "/sidebar/ai-assistant.gif",
      //   label: "AI Assistant",
      //   isActive: false,
      //   link: SidebarLink.AIAssistant,
      //   disabled: true,
      // },
    ],
  },
  {
    title: "Payments",
    items: [
      { icon: "/sidebar/send.gif", label: "Send", isActive: false, link: SidebarLink.Send, disabled: false },
      { icon: "/sidebar/batch.gif", label: "Batch", isActive: false, link: SidebarLink.Batch, disabled: false },
      { icon: "/sidebar/gift.gif", label: "Gift", isActive: false, link: SidebarLink.Gift, disabled: true },
      {
        icon: "/sidebar/group-payment.gif",
        label: "Group Payment",
        isActive: false,
        link: SidebarLink.GroupPayment,
        disabled: true,
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
        disabled: true,
      },
    ],
  },
];

export const Sidebar: React.FC<NavProps> = ({ onActionItemClick }) => {
  const [renderFab, setRenderFab] = useState(false);

  const [action, setActions] = useState(actionItems);
  const router = useRouter();
  const pathname = usePathname();

  // **************** Effect ****************
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

  // **************** Handlers ****************
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
    <nav className="sidebar overflow-hidden pt-3.5 rounded-lg bg-neutral-900 max-w-[400px] h-screen">
      <div className="flex flex-col justify-between h-full">
        <div className="px-3.5 w-full">
          {/* Logo */}
          <header
            className={`flex max-w-full leading-tight justify-items-start gap-2 cursor-pointer`}
            onClick={() => router.push("/dashboard/pending-recieve")}
          >
            <img src="/qash-logo.svg" alt="Qash Logo" className="w-20" />
            <div className="flex items-center justify-start px-3 border-gradient ">
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
      {renderFab && <FloatingActionButton imgSrc="/qash-icon.svg" />}
    </nav>
  );
};

export default Sidebar;
