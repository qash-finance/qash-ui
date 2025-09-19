"use client";
import React, { useState } from "react";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import { useWalletState } from "@/services/store";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";

enum SelectedWallet {
  MIDEN_WALLET = "miden-wallet",
  LOCAL_WALLET_1 = "local-wallet-1",
  LOCAL_WALLET_2 = "local-wallet-2",
}

interface AccountProps {}

export const Account: React.FC<AccountProps> = () => {
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

  const SubIcon = ({ icon, onClick }: { icon: string; onClick: () => void }) => {
    return (
      <div
        className="flex justify-center items-center w-[32px] h-[32px] rounded-lg bg-app-background border-t-2 border-primary-divider cursor-pointer"
        onClick={() => {
          onClick();
        }}
      >
        <img src={icon} className="w-4" alt={icon} />
      </div>
    );
  };

  return (
    <article className="flex flex-col w-full font-medium bg-background rounded-xl flex-1 border-t-2 border-primary-divider p-2 gap-5">
      {/* Account Info */}
      <header className="flex items-center w-full text-sm font-medium justify-between pt-2">
        <div className="flex flex-1 gap-3 items-center">
          <img src={blo(turnBechToHex(walletAddress || ""))} alt="Recipient avatar" className="w-[36px] rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="text-base truncate text-text-primary leading-none">Q3x</span>
              <img src="/logo/miden.svg" className="w-4" alt="miden logo icon" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base truncate text-text-secondary leading-none">
                {formatAddress(walletAddress?.toString() || "0x")}
              </span>
              <img
                src="/misc/copy-icon.svg"
                className="w-5 cursor-pointer"
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
        <SubIcon icon="/misc/qr-icon.svg" onClick={() => {}} />
        <SubIcon icon="/misc/external-link-icon.svg" onClick={() => {}} />
        <SubIcon icon="/misc/power-button-icon.svg" onClick={handleDisconnect} />
      </div>
    </article>
  );
};

export default Account;
