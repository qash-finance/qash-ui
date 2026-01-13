"use client";
import React, { useState, useEffect } from "react";
import { NavSections } from "./NavSection";
import { Connect } from "./Connect";
import { useRouter, usePathname } from "next/navigation";
import MoveCryptoSidebar from "./MoveCryptoSidebar";
import { Suspense } from "react";
import { useAuth } from "@/services/auth/context";
import { Tooltip } from "react-tooltip";
import { AccountTooltip } from "../Common/ToolTip/AccountTooltip";
import { AuthMeResponse } from "@/services/auth/api";
import { useMidenProvider } from "@/contexts/MidenProvider";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import TeamSidebar from "./TeamSidebar";

export const MOVE_CRYPTO_SIDEBAR_OFFSET = 290;

interface NavProps {
  onActionItemClick?: (itemIndex: number) => void;
  onTeamItemClick?: (index: number) => void;
  onConnectWallet?: () => void;
}

// Enum for sidebar links
export enum SidebarLink {
  Home = "",
  MoveCrypto = "move-crypto",
  PaymentLink = "payment-link",
  Dashboard = "dashboard",
  Send = "send",
  ContactBook = "contact-book",
  Payroll = "payroll",
  Gift = "gift",
  AIAssistant = "ai-assistant",
  GroupPayment = "group-payment",
  AddressBook = "address-book",
  AccountManagement = "account-management",
  Transactions = "transactions",
  Bill = "bill",
  Invoice = "invoice",
  Setting = "setting",
  CreditCard = "credit-card",
}

// Enum for submenu types
export enum SubmenuType {
  Null = "null",
  MoveCrypto = "moveCrypto",
  // Add more submenu types here as needed
  // AnotherSubmenu = "anotherSubmenu",
}

export const actionItems = [
  {
    icon: "/sidebar/home.svg",
    filledIcon: "/sidebar/filled-home.svg",
    label: "Dashboard",
    isActive: true,
    link: SidebarLink.Home,
    disabled: false,
    hasSubmenu: false,
    submenuType: SubmenuType.Null,
  },
  {
    icon: "/sidebar/payroll.svg",
    filledIcon: "/sidebar/filled-payroll.svg",
    label: "Payroll",
    isActive: false,
    link: SidebarLink.Payroll,
    disabled: false,
  },
  {
    icon: "/sidebar/invoice.svg",
    filledIcon: "/sidebar/filled-invoice.svg",
    label: "Invoice",
    isActive: false,
    link: SidebarLink.Invoice,
    disabled: false,
  },
  {
    icon: "/sidebar/bill.svg",
    filledIcon: "/sidebar/filled-bill.svg",
    label: "Bills",
    isActive: false,
    link: SidebarLink.Bill,
    disabled: false,
  },
  {
    icon: "/sidebar/payment-link.svg",
    filledIcon: "/sidebar/filled-payment-link.svg",
    label: "Payment Link",
    isActive: false,
    link: SidebarLink.PaymentLink,
    disabled: false,
  },
  {
    icon: "/sidebar/payroll.svg",
    filledIcon: "/sidebar/filled-payroll.svg",
    label: "Earn",
    isActive: false,
    disabled: true,
  },
  {
    icon: "/sidebar/contact-book.svg",
    filledIcon: "/sidebar/filled-contact-book.svg",
    label: "Contact",
    isActive: false,
    link: SidebarLink.ContactBook,
    disabled: false,
  },
  {
    icon: "/sidebar/transactions.svg",
    filledIcon: "/sidebar/filled-transactions.svg",
    label: "Transactions",
    isActive: false,
    link: SidebarLink.Transactions,
    disabled: false,
  },
  {
    icon: "/sidebar/credit-card.svg",
    filledIcon: "/sidebar/filled-credit-card.svg",
    label: "Credit Card",
    isActive: false,
    link: SidebarLink.CreditCard,
    disabled: true,
  },
  {
    icon: "/sidebar/setting.svg",
    filledIcon: "/sidebar/filled-setting.svg",
    label: "Setting",
    isActive: false,
    link: SidebarLink.Setting,
    disabled: false,
  },
];

const SidebarHeader = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div
      className="w-full shadow-md flex items-center justify-center rounded-xl bg-background flex-col my-3 mx-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex p-3 justify-between w-full items-center border-b border-primary-divider">
        <div className="flex flex-row gap-2">
          <img src="/logo/qash-icon-dark.svg" alt="Qash Logo" className="w-10" />
          <div className="flex flex-col gap-1">
            <span className="leading-none text-primary-blue">Qash</span>
            <span className="leading-none">$2,125,545.00</span>
          </div>
        </div>

        <img src="/arrow/chevron-right.svg" alt="Qash Logo" className="w-4" />
      </div>

      <div className="w-full flex flex-row items-center justify-between p-3">
        <div className="flex flex-row gap-2">
          <img src="/misc/user-edit-icon.svg" alt="Eye Icon" className="w-5" />
          <span className="text-text-secondary text-sm">5 members</span>
        </div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<NavProps> = ({ onActionItemClick }) => {
  const [action, setActions] = useState(actionItems);
  const router = useRouter();
  const pathname = usePathname();
  const [showMoveCryptoSidebar, setShowMoveCryptoSidebar] = useState(false);
  const [showTeamSidebar, setShowTeamSidebar] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { logoutAsync, address } = useMidenProvider();
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
              className={`flex max-w-full leading-6 justify-items-start gap-2 cursor-pointer items-center px-3 pb-3 border-b border-primary-divider`}
              onClick={() => router.push("/payroll")}
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
              <div className="flex items-center justify-start px-3 bg-[#E7E7E8] rounded-full">
                <p className="text-[13px] text-badge-neutral-text">Beta</p>
              </div>
            </header>
            {/* <div className="h-[2px] bg-primary-divider my-3" /> */}
            <SidebarHeader onClick={() => setShowTeamSidebar(!showTeamSidebar)} />

            {/* Action */}
            <NavSections sections={action} onItemClick={handleActionItemClick} onSubmenuClick={handleSubmenuClick} />
          </div>

          {/* Connect/Account section */}
          <div className="flex flex-col justify-center p-5 border-t border-primary-divider mb-5">
            {/* <Connect /> */}
            {isAuthenticated && (
              <div className="flex items-center justify-between gap-5">
                <div className="flex flex-col gap-1">
                  <span className="leading-none">
                    {(user as AuthMeResponse["user"])?.teamMembership?.firstName}{" "}
                    {(user as AuthMeResponse["user"])?.teamMembership?.lastName}
                  </span>
                  <span className="text-text-secondary leading-none">{(user as AuthMeResponse["user"])?.email}</span>
                  {address && (
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary leading-none">{formatAddress(address)}</span>
                      <img
                        src="/misc/copy-icon.svg"
                        alt="copy"
                        className="w-6 h-6 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(address);
                            toast.success("Wallet address copied to clipboard");
                          } catch (err) {
                            console.error("Failed to copy address:", err);
                            toast.error("Failed to copy address");
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <img
                  src="/misc/three-dot-icon.svg"
                  alt="three dots icon"
                  className="w-5 cursor-pointer"
                  data-tooltip-id="account-tooltip"
                  data-tooltip-content="Account"
                />
              </div>
            )}
          </div>

          {/* Account Tooltip */}
          <Tooltip
            id="account-tooltip"
            clickable
            style={{
              zIndex: 20,
              borderRadius: "16px",
              padding: "0",
            }}
            place="top"
            openOnClick
            noArrow
            border="none"
            opacity={1}
            render={({ content }) => {
              if (!content) return null;
              return (
                <AccountTooltip
                  onLogout={async () => {
                    await logoutAsync();
                    await logout();
                  }}
                />
              );
            }}
          />
        </div>
      </nav>
      {/* <Suspense fallback={<div>Loading...</div>}>
        <MoveCryptoSidebar isOpen={showMoveCryptoSidebar} onClose={() => setShowMoveCryptoSidebar(false)} />
      </Suspense> */}
      <Suspense fallback={<div>Loading...</div>}>
        <TeamSidebar isOpen={showTeamSidebar} onClose={() => setShowTeamSidebar(false)} />
      </Suspense>
    </>
  );
};

export default Sidebar;
