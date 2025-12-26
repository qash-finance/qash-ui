"use client";
import React from "react";
import { MODAL_IDS, ValidatingModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { Badge, BadgeStatus } from "../../Common/Badge";

const WalletItem = ({
  label,
  icon,
  isComingSoon,
  iconClassName,
}: {
  label: string;
  icon: string;
  isComingSoon?: boolean;
  iconClassName?: string;
}) => {
  return (
    <div
      className={`flex justify-between items-center bg-app-background border-t-2 border-primary-divider w-full rounded-2xl p-3 ${isComingSoon ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex flex-row gap-2">
        <span className="font-bold text-xl">{label}</span>
        {isComingSoon && <Badge status={BadgeStatus.SUCCESS} text="Coming soon" />}
      </div>
      <div className="flex justify-center items-center gap-2">
        <img src={icon} alt="Wallet icon" className={iconClassName} />
        <img src="/arrow/chevron-right.svg" alt="link icon" />
      </div>
    </div>
  );
};

export function ConnectMidenWallet({ isOpen, onClose, zIndex }: ModalProp<ValidatingModalProps>) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="bg-background rounded-t-2xl flex justify-center items-center w-[450px] border-b-1 border-primary-divider">
        <div className="relative flex justify-center items-center w-full text-center py-6">
          <span className="text-text-primary font-bold text-center">Connect Wallet</span>
          <div
            className="absolute top-1/2 transform -translate-y-1/2 right-6 w-[28px] h-[28px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer"
            onClick={onClose}
          >
            <img src="/misc/close-icon.svg" alt="close icon" />
          </div>
        </div>
      </div>
      <div className="bg-background flex flex-col rounded-b-2xl justify-center items-center py-5 px-3 gap-7">
        <div className="flex flex-row justify-center items-center gap-3">
          <div className="flex justify-center items-center w-[48px] h-[48px] bg-app-background rounded-xl border-1 border-primary-divider">
            <img src="/modal/choose-wallet.svg" alt="Wallet icon" />
          </div>
          <img src="/misc/link-icon.svg" alt="link icon" />
          <div className="flex justify-center items-center w-[48px] h-[48px] bg-[#000000] rounded-xl border-1 border-primary-divider">
            <img src="/logo/3d-qash-icon.svg" alt="Wallet icon" />
          </div>
        </div>

        {/* <div className="w-full py-3 flex flex-row justify-center items-center rounded-2xl gap-5 bg-[#FF5500] cursor-pointer" onClick={() => connect()}>
          <img src="/logo/miden.svg" alt="Miden wallet connection illustration" className="w-7 rounded" />
          <span className="font-bold text-xl text-white">Connect Miden Wallet</span>
        </div> */}
      </div>
    </BaseModal>
  );
}

export default ConnectMidenWallet;
