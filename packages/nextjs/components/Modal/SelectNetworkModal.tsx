"use client";

import React from "react";
import { SelectNetworkModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { ModalHeader } from "../Common/ModalHeader";

const NETWORKS: { icon: string; name: string; value: string }[] = [
  { icon: "/chain/ethereum.svg", name: "Ethereum", value: "eth" },
  { icon: "/chain/miden.svg", name: "Miden", value: "miden" },
  { icon: "/chain/solana.svg", name: "Solana", value: "sol" },
  { icon: "/chain/base.svg", name: "Base", value: "base" },
  { icon: "/chain/bnb.svg", name: "BNB Smart Chain (BEP20)", value: "bnb" },
];

const NetworkItem = ({ icon, onClick, name }: { icon: string; onClick: () => void; name: string }) => {
  return (
    <div
      className="flex gap-2 items-center px-2.5 py-4 w-full rounded-xl bg-background border border-primary-divider transition-colors cursor-pointer"
      onClick={onClick}
    >
      <img src={icon} alt={name} className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0]">
        <h3 className="font-bold leading-none text-text-primary">{name}</h3>
      </div>
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
          />
        ))}
      </main>
    </BaseModal>
  );
}

export default SelectNetworkModal;
