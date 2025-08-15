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
  minimized?: boolean;
  onToggleMinimize?: (value: boolean) => void;
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
      { icon: "/sidebar/gift.gif", label: "Gift", isActive: false, link: SidebarLink.Gift, disabled: false },
      {
        icon: "/sidebar/group-payment.gif",
        label: "Group Payment",
        isActive: false,
        link: SidebarLink.GroupPayment,
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
        disabled: true,
      },
    ],
  },
];

export const Sidebar: React.FC<NavProps> = ({ onActionItemClick, minimized: minimizedProp, onToggleMinimize }) => {
  const [renderFab, setRenderFab] = useState(false);

  const [action, setActions] = useState(actionItems);
  const [minimizedLocal, setMinimizedLocal] = useState(false);
  const minimized = minimizedProp ?? minimizedLocal;
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
    <nav
      className="sidebar overflow-visible pt-3 rounded-lg bg-[#111212] w-full relative h-screen"
      style={{ transition: "padding 200ms ease" }}
    >
      <div className="flex flex-col justify-between h-full">
        <div className={`w-full ${minimized ? "px-1" : "px-3.5"}`}>
          {/* Logo */}
          <header
            className={`flex max-w-full leading-6 justify-items-start gap-2 cursor-pointer items-center`}
            onClick={() => router.push("/dashboard/pending-receive")}
          >
            <div
              className="flex items-center justify-center"
              style={{
                margin: minimized ? "auto" : "0",
              }}
            >
              <img src="/qash-icon.svg" alt="Qash Logo" />
              {!minimized && (
                <img
                  src="/ash-text-icon.svg"
                  alt="Qash Logo"
                  className={`"w-20"`}
                  style={{ transition: "width 200ms ease" }}
                />
              )}
            </div>
            {!minimized && (
              <div
                className="flex items-center justify-start px-3 border-gradient"
                style={{
                  opacity: minimized ? 0 : 1,
                  visibility: minimized ? "hidden" : "visible",
                  transform: minimized ? "translateX(-8px)" : "translateX(0)",
                  transition: "opacity 200ms ease, transform 200ms ease, visibility 200ms step-end",
                }}
              >
                <p className="text-[13px] font-semibold text-[#7C7C7C]">Beta</p>
              </div>
            )}
          </header>
          <div className="h-[1px] bg-neutral-700 my-3" />
          {/* Action */}
          <NavSections minimized={minimized} sections={action} onItemClick={handleActionItemClick} />
        </div>

        {/* Connect/Account section */}
        <div className="flex flex-col justify-end gap-3">
          {/* Give Feedback section */}
          {minimized ? (
            <div className="flex flex-col gap-4 justify-center items-center mb-5">
              <div
                onClick={() => {
                  window.open("https://forms.gle/i1uV5uUVaWYoHSXN7", "_blank");
                }}
                className="cursor-pointer flex items-center justify-center w-10 h-10 bg-[#292929] rounded-lg transition-all duration-200 hover:bg-[#3a3a3a] hover:scale-105"
              >
                <img src="/sidebar/plus.svg" alt="" />
              </div>
              <div
                onClick={() => {}}
                className="cursor-pointer flex items-center justify-center w-10 h-10 bg-[#ffffff] rounded-lg hover:scale-105"
              >
                <img src="/miden-logo.svg" alt="" className="w-5 h-5" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-full flex gap-2 px-5">
                <div
                  onClick={() => {
                    window.open("https://forms.gle/i1uV5uUVaWYoHSXN7", "_blank");
                  }}
                  className="cursor-pointer flex items-center justify-center w-13 h-10 bg-[#292929] rounded-lg"
                >
                  <img src="/sidebar/plus.svg" alt="" />
                </div>
                <div
                  onClick={() => {
                    window.open("https://forms.gle/i1uV5uUVaWYoHSXN7", "_blank");
                  }}
                  className="flex items-center cursor-pointer bg-[#292929] w-full px-3 rounded-lg"
                >
                  <span className="text-base  text-[#989898]">Give Feedback</span>
                </div>
              </div>
              {/* Connect section */}
              <div className={minimized ? "px-1" : ""}>
                <Connect />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Minimize toggle */}
      <button
        type="button"
        aria-label={minimized ? "Expand sidebar" : "Minimize sidebar"}
        onClick={() => {
          const next = !minimized;
          setMinimizedLocal(next);
          onToggleMinimize?.(next);
        }}
        className="absolute top-[13px] py-1.5 z-20 cursor-pointer hover:bg-white bg-[#111212]"
        style={{
          paddingLeft: minimized ? "5px" : "8px",
          paddingRight: minimized ? "5px" : "8px",
          border: minimized ? "1px 1px 1px 0px solid #292929" : "none",
          borderRadius: minimized ? "0px 6px 6px 0px" : "6px",
          right: minimized ? "-30px" : "14px",
          transition: "right 200ms ease",
        }}
      >
        <img src="/sidebar/minimize-icon.svg" alt="" className="w-5 h-5" />
      </button>

      {renderFab && <FloatingActionButton imgSrc="/qash-icon.svg" />}
    </nav>
  );
};

export default Sidebar;
