"use client";

import React, { useEffect, useState } from "react";
import { TokenList } from "../Common/TokenList";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { useAccountContext } from "@/contexts/AccountProvider";
import { AssetWithMetadata } from "@/types/faucet";
import { ModalHeader } from "../Common/ModalHeader";

export function SelectTokenModal({
  isOpen,
  onClose,
  onTokenSelect,
  zIndex,
}: ModalProp<SelectTokenModalProps> & { zIndex?: number }) {
  // **************** Custom Hooks *******************
  const { assets, isError } = useAccountContext();

  // **************** Local State *******************
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<AssetWithMetadata[]>([]);

  // **************** Local Functions *******************
  const handleTokenSelect = (token: AssetWithMetadata | null) => {
    console.log("SELECTED TOKEN", token);
    onTokenSelect?.(token);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // **************** Effect  *******************
  useEffect(() => {
    const filteredAssets = assets.filter(asset => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const symbol = asset.metadata.symbol.toLowerCase();
      const tokenAddress = asset.faucetId.toLowerCase();

      return symbol.includes(query) || tokenAddress.includes(query);
    });

    setFilteredAssets(filteredAssets);
  }, [assets, searchQuery, isError]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} zIndex={zIndex}>
      <ModalHeader title="Select token to send" onClose={onClose} />
      <main className="flex flex-col gap-3 items-start p-4 w-[450px] border-2 border-primary-divider rounded-b-2xl min-h-[300px] overflow-y-auto bg-background">
        <TokenList assets={filteredAssets} onTokenSelect={handleTokenSelect} searchQuery={searchQuery} />
      </main>
    </BaseModal>
  );
}

export default SelectTokenModal;
