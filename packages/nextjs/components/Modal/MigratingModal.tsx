"use client";
import React from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { MigratingModalProps } from "@/types/modal";
import { ActionButton } from "../Common/ActionButton";
import toast from "react-hot-toast";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import {
  CURRENT_MIGRATION_VERSION,
  MIDEN_DB_NAME,
  MIDEN_WALLET_AUTH_KEY,
  MIDEN_WALLET_KEYS_KEY,
  MIGRATION_VERSION_KEY,
  TOUR_SKIPPED_KEY,
  WALLET_ADDRESSES_KEY,
} from "@/services/utils/constant";

export const shouldShowMigrationModal = (): boolean => {
  // if no MIGRATION_VERSION_KEY, means that its first time user, no need show this
  // if we have `miden_wallet_auth`,`miden_wallet_keys` or `miden-wallet-addresses` and no MIGRATION_VERSION_KEYs , means that we have to show this
  const storedVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
  const storedAuth = localStorage.getItem(MIDEN_WALLET_AUTH_KEY);
  const storedKeys = localStorage.getItem(MIDEN_WALLET_KEYS_KEY);
  const storedAddresses = localStorage.getItem(WALLET_ADDRESSES_KEY);
  if (!storedVersion) return true;
  if (storedVersion == CURRENT_MIGRATION_VERSION) return false;
  if (!storedVersion && (storedAuth || storedKeys || storedAddresses)) return true;

  return false;
};

export function MigratingModal({ isOpen, onClose, zIndex, ...props }: ModalProp<MigratingModalProps>) {
  const { disconnectWallet } = useWalletAuth();

  const handleReset = async () => {
    await disconnectWallet();

    try {
      indexedDB.deleteDatabase(MIDEN_DB_NAME);
      localStorage.clear();
      localStorage.setItem(TOUR_SKIPPED_KEY, "true");
      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
      window.location.reload();
    } catch (error) {
      console.error("Failed to burn wallet:", error);
      toast.error("Failed please try again later");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col gap-0">
        <header className="flex justify-between items-center self-stretch pt-2.5 pr-2.5 pb-2 pl-4 border-b border-solid bg-zinc-800 rounded-t-2xl border-b-neutral-900 max-sm:py-2 max-sm:pr-2 max-sm:pl-3">
          <div className="flex gap-1.5 items-center">
            <div
              className="flex justify-center items-center p-0.5 w-5 h-5 rounded-md bg-neutral-900 cursor-pointer"
              onClick={onClose}
            >
              <img src="/modal/coin-icon.gif" alt="" className="shrink-0 w-4 h-4 grayscale" />
            </div>
            <h1 className="text-base font-medium tracking-tight leading-4 text-white max-md:text-base max-sm:text-sm">
              Migration Announcement
            </h1>
          </div>
        </header>
        <div
          className="flex flex-col items-center rounded-b-2xl border border-solid bg-stone-900 border-zinc-800 w-[450px] relative overflow-hidden pt-15"
          style={{
            backgroundImage: "url(/modal/onboard-background.svg)",
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600/30 rounded-full w-100 h-100 blur-3xl" />

          {/* Blue glow effect at the top */}
          <main className="flex flex-col gap-6 items-center self-stretch h-full p-3 z-10 justify-between">
            {/* Token Icon and Info */}
            <div className="flex flex-col gap-4 items-center">
              <img src="/notification/notification.gif" alt="bell" className="w-15 h-15" />
              <div className="flex flex-col gap-2 items-center">
                <span className="text-2xl text-white text-center">We’ve migrated to Miden Testnet 0.11.0.</span>
                <p className="text-neutral-500 text-center">
                  All accounts and data have been reset as part of this upgrade.
                </p>
              </div>
            </div>

            <ActionButton text="Understand" onClick={handleReset} className="w-full h-10" />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MigratingModal;
