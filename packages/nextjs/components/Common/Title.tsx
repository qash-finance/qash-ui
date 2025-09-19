import React from "react";
import { usePathname, useRouter } from "next/navigation";
import TabContainer from "./TabContainer";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useGetNotificationsInfinite } from "@/services/api/notification";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "./ActionButton";

export const Title = () => {
  const { openModal } = useModal();
  const pathname = usePathname();
  const { walletAddress, isConnected } = useWalletConnect();
  const router = useRouter();

  // Calculate unread count
  const { data } = useGetNotificationsInfinite(walletAddress, 20);
  const unreadCount = data?.pages
    ? data.pages.flatMap(page => page.notifications).filter((item: any) => item.status === "UNREAD").length
    : 0;

  let title;
  switch (pathname) {
    case "/send":
      title = "Welcome to Qash";
      break;
    case "/dashboard/pending-receive":
      title = "Welcome to Qash";
      break;
    case "/dashboard/pending-request":
      title = "Welcome to Qash";
      break;
    case "/dashboard/cancel-transaction":
      title = "Welcome to Qash";
      break;
    case "/batch":
      title = "Welcome to Qash";
      break;
    case "/group-payment":
      title = "Welcome to Qash";
      break;
    case "/account-management":
      title = "Welcome to Qash";
      break;
    case "/transactions":
      title = "Welcome to Qash";
      break;
    case "/gift":
      title = "Welcome to Qash";
      break;
    case "/gift/open-gift":
      title = "Welcome to Qash";
      break;
    case "/address-book":
      title = "Welcome to Qash";
      break;
    case "/dashboard/schedule-payment":
      title = "Welcome to Qash";
      break;
    case "/dashboard/wallet-analytics":
      title = "Welcome to Qash";
      break;
    case "/dashboard/wallet-analytics/transaction-history":
      title = "Welcome to Qash";
      break;
    case "/dashboard/stream-receive":
      title = "Welcome to Qash";
      break;

    default:
      title = "Welcome to Qash";
  }

  const dashboardTabs = [
    { id: "pending-receive", label: "Receive", href: "/dashboard/pending-receive" },
    {
      id: "pending-request",
      label: "Payment Request",
      href: "/dashboard/pending-request",
    },
    { id: "cancel-transaction", label: "Cancel Payment", href: "/dashboard/cancel-transaction" },
  ];

  return (
    <div className="flex flex-row gap-2 mx-[24px] pt-1">
      <div className="w-[100%] px-1 py-2 justify-center items-center flex">
        <span className="leading-none text-text-secondary text-lg flex-1">
          {title}
        </span>
        {/* {pathname.startsWith("/dashboard") && <TabContainer tabs={dashboardTabs} className="w-[600px]" />} */}
        {pathname.startsWith("/dashboard/schedule-payment") && (
          <ActionButton text="Create recurring payment" icon="/plus-icon.svg" onClick={() => router.push("/send")} />
        )}
      </div>

      <button
        className="cursor-pointer flex flex-row gap-1 items-center justify-center px-6 py-2 bg-background rounded-lg leading-none border-t-1 border-t-primary-divider"
        onClick={() => openModal(MODAL_IDS.PORTFOLIO)}
      >
        <img src="/misc/shopping-bag.svg" alt="coin-icon" className="w-5 h-5 " />
        Batch
      </button>

      <button
        className="cursor-pointer flex flex-row gap-1 items-center justify-center px-6 py-2 bg-background rounded-lg leading-none"
        onClick={() => openModal(MODAL_IDS.PORTFOLIO)}
      >
        <img src="/misc/star-icon.svg" alt="coin-icon" className="w-5 h-5 " />
        Portfolio
      </button>

      <div
        className="relative flex flex-row gap-2 justify-center items-center w-12 bg-[#292929] rounded-lg cursor-pointer"
        onClick={() => openModal(MODAL_IDS.NOTIFICATION)}
      >
        <img src="/notification/notification.gif" alt="bell" className="w-5 h-5" />
        {isConnected && unreadCount > 0 && (
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF2323] rounded-full" />
        )}
      </div>
    </div>
  );
};
