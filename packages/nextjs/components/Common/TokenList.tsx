"use client";
import React from "react";
import { TokenItem } from "./TokenItem";
import { AssetWithMetadata } from "@/types/faucet";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { formatUnits } from "viem";

interface TokenListProps {
  assets: AssetWithMetadata[];
  onTokenSelect?: (token: AssetWithMetadata | null) => void;
  searchQuery?: string;
}

export function TokenList({ assets, onTokenSelect, searchQuery }: TokenListProps) {
  return (
    <section className="flex flex-col gap-2.5 items-start w-full">
      <div className="flex flex-col gap-0.5 items-start w-full">
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
              key={asset.faucetId}
              icon={asset.faucetId === QASH_TOKEN_ADDRESS ? "/token/qash.svg" : blo(turnBechToHex(asset.faucetId))}
              address={asset.faucetId}
              name={asset.metadata.symbol}
              usdValue={formatNumberWithCommas(
                formatUnits(BigInt(Math.round(Number(asset.amount))), asset.metadata.decimals),
              )} // 1:1 ratio with token amount
              tokenAmount={formatNumberWithCommas(
                formatUnits(BigInt(Math.round(Number(asset.amount))), asset.metadata.decimals),
              )}
              onClick={() => onTokenSelect?.(asset)}
            />
          ))
        )}
      </div>
    </section>
  );
}
