"use client";

import React, { useEffect, useState } from "react";
import { TokenList } from "../Common/TokenList";
import { SelectTokenModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "./BaseModal";
import { useAccountContext } from "@/contexts/AccountProvider";
import { AssetWithMetadata } from "@/types/faucet";

export function SelectTokenModal({ isOpen, onClose, onTokenSelect }: ModalProp<SelectTokenModalProps>) {
  // **************** Custom Hooks *******************
  const { assets, isError } = useAccountContext();

  // **************** Local State *******************
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<AssetWithMetadata[]>([]);

  // **************** Local Functions *******************
  const handleTokenSelect = (token: AssetWithMetadata) => {
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
    <BaseModal isOpen={isOpen} onClose={onClose} title="Select token" icon="/modal/coin-icon.gif">
      <div className="flex flex-col items-center rounded-b-2xl border border-solid bg-stone-900 border-zinc-800 h-[472px] w-[500px] max-md:h-auto max-md:max-w-[500px] max-md:min-h-[472px] max-md:w-[90%] max-sm:m-2.5 max-sm:h-auto max-sm:w-[95%]">
        <main className="flex flex-col gap-3 items-start self-stretch px-1.5 pt-1.5 pb-5">
          {/* Token search input */}
          <div className="flex flex-col gap-1.5 items-start self-stretch px-1 py-0 rounded-xl bg-zinc-800">
            <div className="flex relative gap-2.5 items-center self-stretch px-1.5 py-3.5 rounded-lg backdrop-blur-[2px] max-md:px-4 max-md:py-4">
              <input
                type="text"
                placeholder="Search token name or address..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-neutral-600 outline-none text-base tracking-tight leading-5 max-md:text-base max-sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="cursor-pointer flex items-center justify-center w-6 h-6 rounded-full bg-neutral-600 hover:bg-neutral-500 transition-colors"
                  title="Clear search"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 3L3 9M3 3l6 6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <TokenList assets={filteredAssets} onTokenSelect={handleTokenSelect} searchQuery={searchQuery} />
        </main>
      </div>
    </BaseModal>
  );
}

export default SelectTokenModal;
