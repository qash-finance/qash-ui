"use client";
import React, { useState } from "react";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import { useWalletState } from "@/services/store";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import { MIDEN_EXPLORER_URL } from "@/services/utils/constant";
enum SelectedWallet {
  MIDEN_WALLET = "miden-wallet",
  LOCAL_WALLET_1 = "local-wallet-1",
  LOCAL_WALLET_2 = "local-wallet-2",
}

interface AccountProps {}

export const Account: React.FC<AccountProps> = () => {
  const router = useRouter();
  const { walletAddress, setIsConnected } = useWalletState(state => state);
  const { disconnectWallet } = useWalletAuth();
  const clearTransactions = useTransactionStore(state => state.clearTransactions);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<SelectedWallet>(SelectedWallet.MIDEN_WALLET);
  const handleDisconnect = async () => {
    try {
      setIsConnected(false);
      clearTransactions();
      await disconnectWallet();
      toast.success("Wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect wallet");
    }
  };

  const getCurrentAccountInfo = () => {
    switch (selectedWallet) {
      case SelectedWallet.MIDEN_WALLET:
        return {
          name: "Choose account",
          address: formatAddress(walletAddress || "0x"),
        };
      case SelectedWallet.LOCAL_WALLET_1:
        return {
          name: "Q3x",
          address: walletAddress,
        };
      case SelectedWallet.LOCAL_WALLET_2:
        return {
          name: "Q3x",
          address: walletAddress,
        };
      default:
        return {
          name: "Choose account",
          address: formatAddress(walletAddress?.toString() || "0x"),
        };
    }
  };

  const currentAccount = getCurrentAccountInfo();

  const handleAccountClick = () => {
    // Find the account-info container and add blur effect
    const accountInfo = document.getElementById("account-info");
    if (accountInfo) {
      accountInfo.style.filter = "blur(4px)";
      accountInfo.style.transition = "filter 0.2s ease";
      setIsBlurred(true);

      // Add click listener to remove blur when clicking outside
      const handleOutsideClick = (event: MouseEvent) => {
        if (accountInfo && !accountInfo.contains(event.target as Node)) {
          setIsAnimatingOut(true);
          setTimeout(() => {
            accountInfo.style.filter = "none";
            setIsBlurred(false);
            setIsAnimatingOut(false);
            document.removeEventListener("click", handleOutsideClick);
          }, 200);
        }
      };

      // Add the listener after a small delay to prevent immediate trigger
      setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
      }, 100);
    }
  };

  const SubIcon = ({
    icon,
    onClick,
    tooltipId,
    tooltipContent,
    iconClassName,
  }: {
    icon: string;
    onClick: () => void;
    tooltipId?: string;
    tooltipContent?: string;
    iconClassName?: string;
  }) => {
    return (
      <div
        className="flex justify-center items-center w-[32px] h-[32px] rounded-lg bg-app-background border-t-2 border-primary-divider cursor-pointer"
        onClick={() => {
          onClick();
        }}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipContent}
      >
        <img src={icon} className={`w-4 ${iconClassName}`} alt={icon} />
      </div>
    );
  };

  const tooltipConfig = {
    noArrow: true,
    style: {
      zIndex: 20,
      borderRadius: "12px",
      padding: "0",
    },
    render: ({ content }: { content: string | null }) => (
      <div className="bg-[#121212] rounded-lg p-2 px-4">
        <span className="text-white">{content}</span>
      </div>
    ),
  };

  return (
    // <div className="flex flex-col w-full bg-primary-divider rounded-xl border-t-1 border-background">
    //   <div className="flex flex-row items-center justify-between w-full rounded-xl py-3 px-4 cursor-pointer">
    //     <div className="flex items-center gap-2">
    //       <img src="/token/usdt.svg" className="w-5 h-5" alt="usdt icon" />
    //       <span className="text-base font-medium text-text-primary leading-none">125,545.00 USDT</span>
    //     </div>
    //     <img src="/arrow/chevron-right.svg" className="w-5 h-5" alt="chevron right icon" />
    //   </div>
    //   <div className="flex w-full p-2 border-t-2 border-[#D4D6D9]">
    //     <article className="flex flex-col w-full font-medium bg-background rounded-xl flex-1 border-t-2 border-primary-divider p-2 gap-5">
    //       {/* Account Info */}
    //       <header className="flex items-center w-full text-sm font-medium justify-between pt-2">
    //         <div className="flex flex-1 gap-3 items-center">
    //           <img
    //             src={blo(turnBechToHex(walletAddress || ""))}
    //             alt="Recipient avatar"
    //             className="w-[36px] rounded-full"
    //           />
    //           <div className="flex flex-col gap-1">
    //             <div className="flex items-center gap-1">
    //               <span className="text-base truncate text-text-primary leading-none">Q3x</span>
    //               <img src="/logo/miden.svg" className="w-4" alt="miden logo icon" />
    //             </div>
    //             <div className="flex items-center gap-1">
    //               <span className="text-sm truncate text-text-secondary leading-none">
    //                 {formatAddress(walletAddress?.toString() || "0x")}
    //               </span>
    //               <img
    //                 src="/misc/copy-icon.svg"
    //                 className="w-4 cursor-pointer"
    //                 alt="copy icon"
    //                 onClick={() => {
    //                   navigator.clipboard.writeText(walletAddress || "");
    //                   toast.success("Copied to clipboard");
    //                 }}
    //               />
    //             </div>
    //           </div>
    //         </div>
    //         <img src="/arrow/filled-arrow-right.svg" className="w-5 aspect-square" alt="filled arrow right icon" />
    //       </header>
    //       <div className="flex items-center gap-2">
    //         <SubIcon
    //           icon="/misc/qr-icon.svg"
    //           onClick={() => router.push("/move-crypto?tab=receive")}
    //           tooltipId="qr-tooltip"
    //           tooltipContent="Scan QR Code"
    //         />
    //         <SubIcon
    //           icon="/misc/external-link-icon.svg"
    //           onClick={() => {
    //             window.open(`${MIDEN_EXPLORER_URL}/account/${walletAddress}`, "_blank");
    //           }}
    //           tooltipId="explorer-tooltip"
    //           tooltipContent="View on Explorer"
    //         />
    //         <SubIcon
    //           icon="/misc/power-button-icon.svg"
    //           onClick={handleDisconnect}
    //           tooltipId="disconnect-tooltip"
    //           tooltipContent="Disconnect"
    //         />
    //       </div>
    //     </article>
    //   </div>

    //   {/* Tooltips */}
    //   {["qr-tooltip", "explorer-tooltip", "disconnect-tooltip"].map(tooltipId => (
    //     <Tooltip key={tooltipId} id={tooltipId} {...tooltipConfig} />
    //   ))}
    // </div>

    <>
      <article className="flex flex-col w-full font-medium bg-background rounded-xl flex-1 border-t-2 border-primary-divider p-2 gap-5">
        {/* Account Info */}
        <header className="flex items-center w-full text-sm font-medium justify-between pt-2">
          <div className="flex flex-1 gap-3 items-center">
            <img
              src={blo(turnBechToHex(walletAddress || ""))}
              alt="Recipient avatar"
              className="w-[36px] rounded-full"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {/* <span className="text-base truncate text-text-primary leading-none">Q3x</span> */}
                <img src="/logo/miden.svg" className="w-5" alt="miden logo icon" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm truncate text-text-secondary leading-none">
                  {formatAddress(walletAddress?.toString() || "0x")}
                </span>
                <img
                  src="/misc/copy-icon.svg"
                  className="w-4 cursor-pointer"
                  alt="copy icon"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress || "");
                    toast.success("Copied to clipboard");
                  }}
                />
              </div>
            </div>
          </div>
          <img src="/arrow/filled-arrow-right.svg" className="w-5 aspect-square" alt="filled arrow right icon" />
        </header>
        <div className="flex items-center gap-2">
          <SubIcon
            icon="/misc/qr-icon.svg"
            onClick={() => router.push("/move-crypto?tab=receive")}
            tooltipId="qr-tooltip"
            tooltipContent="Scan QR Code"
          />
          <SubIcon
            icon="/misc/external-link-icon.svg"
            onClick={() => {
              window.open(`${MIDEN_EXPLORER_URL}/account/${walletAddress}`, "_blank");
            }}
            tooltipId="explorer-tooltip"
            tooltipContent="View on Explorer"
            iconClassName="brightness-0"
          />
          <SubIcon
            icon="/misc/power-button-icon.svg"
            onClick={handleDisconnect}
            tooltipId="disconnect-tooltip"
            tooltipContent="Disconnect"
          />
        </div>
      </article>

      {/* Tooltips */}
      {["qr-tooltip", "explorer-tooltip", "disconnect-tooltip"].map(tooltipId => (
        <Tooltip key={tooltipId} id={tooltipId} {...tooltipConfig} />
      ))}
    </>
  );
};

export default Account;
