"use client";

import React from "react";
import { ResetAccountModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { toast } from "react-hot-toast";
import { TOUR_SKIPPED_KEY } from "@/services/utils/constant";

export function ResetAccountModal({ isOpen, onClose, zIndex }: ModalProp<ResetAccountModalProps>) {
  const { disconnectWallet } = useWalletAuth();

  const handleReset = async () => {
    await disconnectWallet();

    try {
      indexedDB.deleteDatabase("MidenClientDB");
      localStorage.clear();
      localStorage.setItem(TOUR_SKIPPED_KEY, "true");
      window.location.reload();
    } catch (error) {
      console.error("Failed to burn wallet:", error);
      toast.error("Failed please try again later");
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Reset Account" zIndex={zIndex} icon="/sidebar/address-book.gif">
      <div className="flex flex-col items-start gap-2.5 p-2 pt-1 bg-[#1E1E1E] rounded-b-xl">
        <div className="bg-[#292929] w-[500px] rounded-lg flex flex-col items-center justify-center gap-4 py-3">
          <img alt="reset-warning" src="/red-warning.svg" className="h-[120px] w-[135px]" />
          <div className="flex flex-col gap-2 items-center justify-start leading-[0] not-italic px-10 w-full text-center">
            <div className="text-white text-[24px] tracking-[0.12px] font-medium w-full">
              <p className="leading-[26px]">Reset account?</p>
            </div>
            <div className="text-[#989898] text-[14px] tracking-[0.07px] w-full">
              <p className="leading-5">
                Resetting will permanently remove your current wallet from this app. You’ll lose access to this account
                and any tokens it holds. A new empty wallet will be created. This can’t be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-b-xl flex gap-2 w-full">
          <ActionButton text="Cancel" type="neutral" onClick={onClose} className="flex-1" />
          <ActionButton text="Reset account" type="deny" onClick={handleReset} className="flex-1" />
        </div>
      </div>
    </BaseModal>
  );
}

export default ResetAccountModal;
