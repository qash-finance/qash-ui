"use client";
import React, { useEffect, useState } from "react";
import { CreateImportWalletModalProps, MODAL_IDS } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { ModalHeader } from "../../Common/ModalHeader";
import { PrimaryButton } from "../../Common/PrimaryButton";
import { SecondaryButton } from "../../Common/SecondaryButton";
import { getLastConnectedAddress, getWalletAddresses, useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { formatAddress } from "@/services/utils/miden/address";
import toast from "react-hot-toast";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";

const RecentlyConnectedWallet = ({
  address,
  onClick,
  isLastConnected,
}: {
  address: string;
  onClick: () => void;
  isLastConnected: boolean;
}) => {
  return (
    <div className="flex flex-row justify-between items-center w-full cursor-pointer" onClick={onClick}>
      <div className="flex justify-center items-center gap-3">
        <img src="/modal/recent-wallet.svg" alt="" className="w-12 h-12" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2 ">
            <span className="text-text-primary text-sm leading-none">{formatAddress(address)}</span>
            <img src="/misc/copy-icon.svg" alt="" className="w-4 h-4" />
          </div>
          {isLastConnected && (
            <div className="flex justify-center items-center rounded-full bg-[#E2E7FF] px-2 py-1">
              <span className="text-primary-blue text-sm leading-none">Recently Used</span>
            </div>
          )}
        </div>
      </div>
      <img src="/arrow/chevron-right.svg" alt="" className="w-6 h-6" />
    </div>
  );
};

export function CreateImportWalletModal({ isOpen, onClose, zIndex }: ModalProp<CreateImportWalletModalProps>) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null);
  const { handleCreateWallet, handleConnectExisting, handleImportWallet } = useWalletConnect();
  const { connectWallet } = useWalletAuth();

  const { openModal } = useModal();

  useEffect(() => {
    const fetchAccounts = () => {
      const accounts = getWalletAddresses();
      setAccounts(accounts);
      const lastConnected = getLastConnectedAddress();
      setLastConnectedAddress(lastConnected);
    };
    fetchAccounts();
  }, []);

  const handleSelectWallet = async (account: string) => {
    try {
      // First connect the wallet
      const connectedAddress = await handleConnectExisting(account);
      if (connectedAddress) {
        // Then authenticate with the selected account
        await connectWallet(connectedAddress);
        onClose();
      }
    } catch (error) {
      console.error("Account switch error:", error);
      toast.error("Failed to switch account");
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <div className="flex flex-col w-[920px] h-[450px]">
        <ModalHeader title="Create or Import Your Wallet" onClose={onClose} icon="/modal/blue-wallet-icon.gif" />
        <div className="bg-background rounded-b-2xl border-2 border-primary-divider border-t-0 flex-1">
          <div className="border-t-[1.5px] border-t-tertiary-divider h-full">
            <div className="flex flex-row h-full">
              {/* Recently Connected Wallets */}
              <div className="flex flex-1 flex-col h-full justify-between">
                <div className="p-3 flex items-center flex-col gap-3">
                  <div className="flex flex-row justify-between items-center w-full">
                    <span className="text-text-secondary text-sm">Recently Connected Wallets</span>
                    <img
                      src="/modal/reset-icon.svg"
                      alt=""
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => openModal(MODAL_IDS.RESET_ACCOUNT)}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {accounts.map(account => (
                      <RecentlyConnectedWallet
                        address={account}
                        key={account}
                        onClick={() => handleSelectWallet(account)}
                        isLastConnected={account === lastConnectedAddress}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-center items-center border-t-[1.5px] border-t-tertiary-divider p-3">
                  <span
                    className="text-primary-blue font-bold text-left w-full cursor-pointer"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Continue as a guest
                  </span>
                </div>
              </div>
              {/* Create or Import Your Wallet */}
              <div className="flex flex-2 flex-col text-center justify-between items-center p-3 border-l-[1.5px] border-l-tertiary-divider">
                <div className="flex flex-col gap-2 w-full justify-center items-center">
                  <img src="/modal/hexagon-qash-icon.svg" className="w-45" />
                  <span className="text-text-primary font-bold text-2xl">Create or Import Your Wallet</span>
                  <span className="text-text-secondary text-sm">
                    This wallet will only be usable within Qash platform, and unable to import miden browser extension
                    wallet, or export Qash wallet and import to browser extension wallet
                  </span>
                </div>
                <div className="flex justify-center gap-2 items-center w-full">
                  <SecondaryButton
                    text="Import"
                    icon="/misc/import-icon.svg"
                    iconPosition="left"
                    onClick={() => openModal(MODAL_IDS.IMPORT_WALLET)}
                  />
                  <PrimaryButton
                    text="Create new wallet"
                    icon="/misc/plus-icon.svg"
                    iconPosition="left"
                    onClick={() => {
                      onClose();
                      openModal(MODAL_IDS.CREATE_WALLET);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export default CreateImportWalletModal;
