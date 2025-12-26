"use client";

import React, { useState } from "react";
import { TokenList } from "../Common/TokenList";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { AssetWithMetadata } from "@/types/faucet";
import { ModalHeader } from "../Common/ModalHeader";
import { useMidenProvider } from "@/contexts/MidenProvider";

export function SelectTokenModal({
  isOpen,
  onClose,
  onTokenSelect,
  zIndex,
}: ModalProp<SelectTokenModalProps> & { zIndex?: number }) {
  // **************** Custom Hooks *******************
  const { address, balances } = useMidenProvider();

  // **************** Local State *******************
  const [searchQuery, setSearchQuery] = useState("");

  // **************** Local Functions *******************
  const handleTokenSelect = (token: AssetWithMetadata | null) => {
    console.log("SELECTED TOKEN", token);
    onTokenSelect?.(token);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Select token" onClose={onClose} />
      <main className="flex flex-col gap-3 items-start p-4 w-[450px] border-2 border-primary-divider rounded-b-2xl min-h-[300px] overflow-y-auto bg-background">
        <div className="bg-app-background border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-full">
          <div className="flex flex-row gap-2 flex-1">
            <input
              type="text"
              placeholder="Search token"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
            />
          </div>
          <button
            type="submit"
            className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
          >
            <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
          </button>
        </div>
        <TokenList balances={balances?.balances || []} onTokenSelect={handleTokenSelect} searchQuery={searchQuery} />
      </main>
    </BaseModal>
  );
}

export default SelectTokenModal;
