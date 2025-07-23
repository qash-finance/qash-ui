"use client";
import * as React from "react";
import { TokenItem } from "./TokenItem";
import { AssetWithMetadata } from "@/types/faucet";
import { generateTokenAvatar } from "@/services/utils/tokenAvatar";
import { qashTokenAddress } from "@/services/utils/constant";

interface TokenListProps {
  assets: AssetWithMetadata[];
  onTokenSelect?: (token: AssetWithMetadata) => void;
  searchQuery?: string;
}

export function TokenList({ assets, onTokenSelect, searchQuery }: TokenListProps) {
  // Format number with commas for better readability
  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <section className="flex flex-col gap-2.5 items-start self-stretch">
      <h2 className="self-stretch text-base tracking-tighter leading-5 text-white max-sm:px-1 max-sm:py-0 max-sm:text-sm">
        Your tokens ({assets.length})
      </h2>
      <div className="flex flex-col gap-0.5 items-start self-stretch">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-8 gap-2">
            <p className="text-neutral-400 text-sm text-center">
              {searchQuery && searchQuery.trim() ? `No tokens found matching "${searchQuery}"` : "No tokens available"}
            </p>
            {searchQuery && searchQuery.trim() && (
              <p className="text-neutral-500 text-xs text-center">Try searching by token symbol or address</p>
            )}
          </div>
        ) : (
          assets.map((asset, index) => (
            <TokenItem
              key={asset.tokenAddress}
              icon={
                asset.tokenAddress === qashTokenAddress
                  ? "/q3x-icon.svg"
                  : generateTokenAvatar(asset.tokenAddress, asset.metadata.symbol)
              }
              address={asset.tokenAddress}
              name={asset.metadata.symbol}
              usdValue={formatNumber(asset.amount)} // 1:1 ratio with token amount
              tokenAmount={formatNumber(asset.amount)}
              onClick={() => onTokenSelect?.(asset)}
            />
          ))
        )}
      </div>
    </section>
  );
}
