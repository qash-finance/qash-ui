"use client";
import { useAccount } from "@/hooks/web3/useAccount";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import * as React from "react";
import { TokenItem } from "./TokenItem";
import { AssetWithMetadata } from "@/types/faucet";
import { generateTokenAvatar } from "@/services/utils/tokenAvatar";
import { qashTokenAddress } from "@/services/utils/constant";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatUnits } from "viem";

interface TokenListProps {
  assets: AssetWithMetadata[];
  onTokenSelect?: (token: AssetWithMetadata) => void;
  searchQuery?: string;
}

export function TokenList({ assets, onTokenSelect, searchQuery }: TokenListProps) {
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
              key={asset.faucetId}
              icon={
                asset.faucetId === qashTokenAddress
                  ? "/q3x-icon.svg"
                  : generateTokenAvatar(asset.faucetId, asset.metadata.symbol)
              }
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
