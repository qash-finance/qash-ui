import React from "react";
import { usePathname } from "next/navigation";
import TabContainer from "./TabContainer";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";

export const Title = () => {
  const { openModal } = useModal();
  const pathname = usePathname();
  let title;
  switch (pathname) {
    case "/send":
      title = "Send tokens";
      break;
    case "/dashboard/pending-recieve":
      title = "Dashboard";
      break;
    case "/dashboard/pending-request":
      title = "Dashboard";
      break;
    case "/dashboard/cancel-transaction":
      title = "Dashboard";
      break;
    case "/batch":
      title = "Your Batch";
      break;
    case "/group-payment":
      title = "Group Payment";
      break;
    case "/account-management":
      title = "Manage Accounts";
      break;
    case "/transactions":
      title = "Transactions";
      break;
    case "/gift":
      title = "Gift";
      break;
    case "/gift/open-gift":
      title = "Open Gift";
      break;
    case "/address-book":
      title = "Address Book";
      break;
    default:
      title = "Qash";
  }

  const dashboardTabs = [
    { id: "pending-recieve", label: "Recieve", href: "/dashboard/pending-recieve" },
    {
      id: "pending-request",
      label: "Payment Request",
      href: "/dashboard/pending-request",
      disabled: true,
      className: "cursor-not-allowed",
    },
    { id: "cancel-transaction", label: "Cancel Payment", href: "/dashboard/cancel-transaction" },
  ];

  return (
    <div className="flex flex-row gap-2">
      <div className="w-[100%] px-1 py-2 bg-[#292929] rounded-lg inline-flex justify-between items-center h-[50px]">
        <div className="w-8 h-[0.1px] rotate-90 outline-[2px] outline-[#06FFB4] rounded-full" />
        <div className="font-medium font-['Barlow'] uppercase leading-none text-white text-xl font-bolds flex-1">
          <span className="text-left">{title}</span>
        </div>
        {pathname.startsWith("/dashboard") && <TabContainer tabs={dashboardTabs} className="w-[600px]" />}
      </div>

      <button
        className={`portfolio-button font-barlow font-bold transition-colors cursor-pointer bg-white hover:bg-white/80 flex flex-row gap-1 items-center justify-center px-3.5 py-1.5`}
        style={{
          borderRadius: "10px",
          fontWeight: "500",
          letterSpacing: "-0.084px",
          lineHeight: "100%",
          boxShadow:
            "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
        }}
        onClick={() => openModal(MODAL_IDS.PORTFOLIO)}
      >
        <img src="/modal/coin-icon.gif" alt="coin-icon" className="w-5 h-5 " />
        PORTFOLIO
      </button>
    </div>
  );
};
