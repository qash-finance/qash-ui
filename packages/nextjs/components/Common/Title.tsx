import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useGetNotificationsInfinite } from "@/services/api/notification";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useTitle } from "@/contexts/TitleProvider";
import { ActionButton } from "./ActionButton";

export const Title = () => {
  const { openModal } = useModal();
  const pathname = usePathname();
  const { walletAddress, isConnected } = useWalletConnect();
  const router = useRouter();
  const { title, showBackArrow, onBackClick, resetTitle } = useTitle();

  // Reset title when route changes
  useEffect(() => {
    resetTitle();
  }, [pathname]);

  // Calculate unread count
  const { data } = useGetNotificationsInfinite(walletAddress, 20);
  const unreadCount = data?.pages
    ? data.pages.flatMap(page => page.notifications).filter((item: any) => item.status === "UNREAD").length
    : 0;

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
      <div className="w-[100%] px-1 py-2 justify-center items-center flex gap-3">
        {showBackArrow && (
          <img src="/arrow/thin-arrow-left.svg" alt="back" className="w-5 cursor-pointer" onClick={onBackClick} />
        )}
        <div className="leading-none text-text-secondary text-lg flex-1">{title}</div>
        {pathname.startsWith("/dashboard/schedule-payment") && (
          <ActionButton text="Create recurring payment" icon="/plus-icon.svg" onClick={() => router.push("/send")} />
        )}
      </div>

      {/* <button
        className="cursor-pointer flex flex-row gap-1 items-center justify-center px-6 py-2 bg-background rounded-lg leading-none border-t-1 border-t-primary-divider"
        onClick={() => router.push("/batch")}
      >
        <img src="/misc/dark-shopping-bag.svg" alt="coin-icon" className="w-5 h-5 " />
        Batch
      </button> */}

      <button
        className="cursor-pointer flex flex-row gap-1 items-center justify-center px-6 py-2 bg-background rounded-lg leading-none"
        onClick={() => openModal(MODAL_IDS.PORTFOLIO)}
      >
        <img src="/misc/two-star-icon.svg" alt="coin-icon" className="w-5 h-5 " />
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
