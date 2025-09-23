"use client";
import React, { useState, useEffect } from "react";
import { NavSections } from "./NavSection";
import { Connect } from "./Connect";
import { useRouter, usePathname } from "next/navigation";
import MoveCryptoSidebar from "./MoveCryptoSidebar";

export const MOVE_CRYPTO_SIDEBAR_OFFSET = 230;

interface NavProps {
  onActionItemClick?: (itemIndex: number) => void;
  onTeamItemClick?: (index: number) => void;
  onConnectWallet?: () => void;
}

// Enum for sidebar links
export enum SidebarLink {
  Home = "",
  MoveCrypto = "move-crypto",
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

// Enum for submenu types
export enum SubmenuType {
  MoveCrypto = "moveCrypto",
  // Add more submenu types here as needed
  // AnotherSubmenu = "anotherSubmenu",
}

export const actionItems = [
  {
    icon: "/sidebar/home.svg",
    filledIcon: "/sidebar/filled-home.svg",
    label: "Home",
    isActive: true,
    link: SidebarLink.Home,
    disabled: false,
  },
  {
    icon: "/sidebar/move-crypto.svg",
    filledIcon: "/sidebar/filled-move-crypto.svg",
    label: "Move Crypto",
    isActive: false,
    link: SidebarLink.MoveCrypto,
    disabled: false,
    hasSubmenu: true,
    submenuType: SubmenuType.MoveCrypto,
  },
  {
    icon: "/sidebar/payment-link.svg",
    filledIcon: "/sidebar/filled-payment-link.svg",
    label: "Payment Link",
    isActive: false,
    link: SidebarLink.Send,
    disabled: false,
  },
  {
    icon: "/sidebar/payroll.svg",
    filledIcon: "/sidebar/filled-payroll.svg",
    label: "Payroll",
    isActive: false,
    link: SidebarLink.Batch,
    disabled: false,
  },
  {
    icon: "/sidebar/contact-book.svg",
    filledIcon: "/sidebar/filled-contact-book.svg",
    label: "Contact Book",
    isActive: false,
    link: SidebarLink.Gift,
    disabled: false,
  },
  {
    icon: "/sidebar/transactions.svg",
    filledIcon: "/sidebar/filled-transactions.svg",
    label: "Transactions",
    isActive: false,
    link: SidebarLink.GroupPayment,
    disabled: false,
  },
  {
    icon: "/sidebar/ai-assistant.svg",
    filledIcon: "/sidebar/filled-ai-assistant.svg",
    label: "AI Assistant",
    isActive: false,
    link: SidebarLink.AccountManagement,
    disabled: false,
  },
  {
    icon: "/sidebar/setting.svg",
    filledIcon: "/sidebar/filled-setting.svg",
    label: "Setting",
    isActive: false,
    link: SidebarLink.Transactions,
    disabled: false,
  },
];

export const Sidebar: React.FC<NavProps> = ({ onActionItemClick }) => {
  const [action, setActions] = useState(actionItems);
  const router = useRouter();
  const pathname = usePathname();
  const [showMoveCryptoSidebar, setShowMoveCryptoSidebar] = useState(false);
  // **************** Effect ****************
  useEffect(() => {
    // Check if any submenu is currently open
    const isAnySubmenuOpen = showMoveCryptoSidebar;
    // Add more submenu checks here as needed
    // const isAnySubmenuOpen = showMoveCryptoSidebar || showAnotherSubmenu;

    setActions(prev =>
      prev.map(item => {
        // Check if item is active based on URL
        const isUrlActive =
          item.link === SidebarLink.Home ? pathname === "/" || pathname === "" : pathname?.startsWith(`/${item.link}`);

        // Check if item is active based on submenu state
        let isSubmenuActive = false;
        if (item.hasSubmenu && item.submenuType) {
          switch (item.submenuType) {
            case SubmenuType.MoveCrypto:
              isSubmenuActive = showMoveCryptoSidebar;
              break;
            // Add more submenu active states here as needed
            // case SubmenuType.AnotherSubmenu:
            //   isSubmenuActive = showAnotherSubmenu;
            //   break;
          }
        }

        // Priority: If any submenu is open, only submenu items can be active
        // If no submenu is open, use URL-based active state
        const isActive = isAnySubmenuOpen ? isSubmenuActive : isUrlActive;

        return {
          ...item,
          isActive,
        };
      }),
    );
  }, [pathname, showMoveCryptoSidebar]);

  // **************** Handlers ****************
  const handleActionItemClick = (itemIndex: number) => {
    const item = action[itemIndex];

    // Don't navigate if item is disabled
    if (item.disabled) {
      return;
    }

    // Close any open submenus when navigating to a new page
    setShowMoveCryptoSidebar(false);
    // Add more submenu close calls here as needed
    // setShowAnotherSubmenu(false);

    const link = item.link;
    setActions(prev =>
      prev.map((item, i) => ({
        ...item,
        isActive: i === itemIndex,
      })),
    );
    router.push(`/${link}`);
    onActionItemClick?.(itemIndex);
  };

  const handleSubmenuClick = (itemIndex: number) => {
    const item = action[itemIndex];

    // Don't navigate if item is disabled
    if (item.disabled) {
      return;
    }

    // Handle different submenu types based on submenuType property
    switch (item.submenuType) {
      case SubmenuType.MoveCrypto:
        setShowMoveCryptoSidebar(!showMoveCryptoSidebar);
        break;
      // Add more submenu cases here as needed
      default:
        console.warn(`No submenu handler found for submenuType: ${item.submenuType}`);
    }
  };

  return (
    <>
      <nav
        className="sidebar overflow-visible py-2 rounded-lg w-full relative h-screen z-20 bg-app-background"
        style={{ transition: "padding 200ms ease" }}
      >
        <div className="flex flex-col justify-between h-full">
          <div className={`w-full`}>
            {/* Logo */}
            <header
              className={`flex max-w-full leading-6 justify-items-start gap-2 cursor-pointer items-center px-3`}
              onClick={() => router.push("/")}
            >
              <div className="flex items-center justify-center">
                <img src="/logo/qash-icon.svg" alt="Qash Logo" />
                <img
                  src="/logo/ash-text-icon.svg"
                  alt="Qash Logo"
                  className="w-12"
                  style={{ transition: "width 200ms ease" }}
                />
              </div>
              <div className="flex items-center justify-start px-3 bg-badge-neutral-background rounded-full">
                <p className="text-[13px] font-semibold text-badge-neutral-text">Beta</p>
              </div>
            </header>
            <div className="h-[2px] bg-primary-divider my-3" />
            {/* Action */}
            <NavSections sections={action} onItemClick={handleActionItemClick} onSubmenuClick={handleSubmenuClick} />
          </div>

          {/* Connect/Account section */}
          <div className="flex flex-col justify-end gap-3 px-2">
            <Connect />
          </div>
        </div>
      </nav>
      <MoveCryptoSidebar isOpen={showMoveCryptoSidebar} onClose={() => setShowMoveCryptoSidebar(false)} />
    </>
  );
};

export default Sidebar;
