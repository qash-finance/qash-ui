"use client";

import React from "react";
import { SelectNetworkModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ModalHeader } from "../Common/ModalHeader";
import ComingSoonBadge from "../Common/ComingSoonBadge";

const NETWORKS: { icon: string; name: string; value: string; isComingSoon: boolean }[] = [
  { icon: "/chain/miden.svg", name: "Miden Testnet", value: "miden", isComingSoon: false },
  { icon: "/chain/ethereum.svg", name: "Ethereum", value: "eth", isComingSoon: true },
  { icon: "/chain/solana.svg", name: "Solana", value: "sol", isComingSoon: true },
  { icon: "/chain/base.svg", name: "Base", value: "base", isComingSoon: true },
  { icon: "/chain/bnb.svg", name: "BNB Smart Chain (BEP20)", value: "bnb", isComingSoon: true },
];

const NetworkItem = ({
  icon,
  onClick,
  name,
  isComingSoon,
}: {
  icon: string;
  onClick: () => void;
  name: string;
  isComingSoon: boolean;
}) => {
  return (
    <div
      className="flex gap-2 items-center justify-between px-2.5 py-4 w-full rounded-xl bg-background border border-primary-divider transition-colors cursor-pointer"
      onClick={isComingSoon ? undefined : onClick}
    >
      <div className="flex flex-row gap-1.5 justify-start items-center">
        <img src={icon} alt={name} className="w-10 h-10 rounded-full" />
        <h3 className="font-bold leading-none text-text-primary">{name}</h3>
      </div>
      {isComingSoon && <ComingSoonBadge />}
    </div>
  );
};

export function SelectNetworkModal({
  isOpen,
  onClose,
  onNetworkSelect,
  zIndex,
}: ModalProp<SelectNetworkModalProps> & { zIndex?: number }) {
  // **************** Local Functions *******************
  const handleNetworkSelect = (network: { icon: string; name: string; value: string }) => {
    onNetworkSelect?.(network);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Select a network" onClose={onClose} />
      <main className="flex flex-col gap-3 items-start p-4 w-[450px] border-2 border-primary-divider rounded-b-2xl min-h-[300px] overflow-y-auto bg-background">
        {NETWORKS.map((network, index) => (
          <NetworkItem
            key={index}
            icon={network.icon}
            name={network.name}
            onClick={() => handleNetworkSelect(network)}
            isComingSoon={network.isComingSoon}
          />
        ))}
      </main>
    </BaseModal>
  );
}

export default SelectNetworkModal;
