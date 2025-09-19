"use client";

import React from "react";
import { ResetAccountModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ActionButton } from "@/components/Common/ActionButton";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { toast } from "react-hot-toast";
import { MIDEN_DB_NAME, TOUR_SKIPPED_KEY } from "@/services/utils/constant";

export function ResetAccountModal({ isOpen, onClose, zIndex }: ModalProp<ResetAccountModalProps>) {
  const { disconnectWallet } = useWalletAuth();

  const handleReset = async () => {
    await disconnectWallet();

    try {
      indexedDB.deleteDatabase(MIDEN_DB_NAME);
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
      <div className="flex flex-col items-start gap-2.5 p-2 pt-1 bg-background rounded-2xl w-[500px]">
        <div className=" rounded-lg flex flex-col items-center justify-center">
          <img alt="reset-warning" src="/red-warning.svg" className="h-[120px] w-[135px]" />
          <div className="flex flex-col gap-2 items-center justify-start not-italic px-10 w-full text-center">
            <span className="text-text-primary text-[24px] font-bold w-full">Reset account</span>
            <span className="text-text-secondary text-[14px] w-full">
              Resetting will permanently remove your current wallet from this app. You’ll lose access to this account
              and any tokens it holds. A new empty wallet will be created. This can’t be undone.
            </span>
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
