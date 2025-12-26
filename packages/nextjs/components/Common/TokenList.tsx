"use client";
import React from "react";
import { TokenItem } from "./TokenItem";
import { AssetWithMetadata } from "@/types/faucet";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { formatUnits } from "viem";
import { supportedTokens } from "@/services/utils/supportedToken";

interface TokenListProps {
  balances: {
    assetId: string;
    balance: string;
  }[];
  onTokenSelect?: (token: AssetWithMetadata | null) => void;
  searchQuery?: string;
}

export function TokenList({ balances, onTokenSelect, searchQuery }: TokenListProps) {
  return (
    <section className="flex flex-col gap-2.5 items-start w-full">
      <div className="flex flex-col gap-0.5 items-start w-full">
        {balances.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-8 gap-2">
            <p className="text-neutral-400 text-sm text-center">
              {searchQuery && searchQuery.trim() ? `No tokens found matching "${searchQuery}"` : "No tokens available"}
            </p>
            {searchQuery && searchQuery.trim() && (
              <p className="text-neutral-500 text-xs text-center">Try searching by token symbol or address</p>
            )}
          </div>
        ) : (
          [...balances]
            .sort((a, b) => {
              const aSymbol = supportedTokens.find(t => t.faucetId.includes(a.assetId))?.symbol || "UNKW";
              const bSymbol = supportedTokens.find(t => t.faucetId.includes(b.assetId))?.symbol || "UNKW";
              if (aSymbol === "QASH") return -1;
              if (bSymbol === "QASH") return 1;
              return 0;
            })
            .map((asset, index: number) => {
              const token = {
                faucetId: asset.assetId,
                metadata: {
                  symbol: supportedTokens.find(t => t.faucetId.includes(asset.assetId))?.symbol || "UNKW",
                  decimals: supportedTokens.find(t => t.faucetId.includes(asset.assetId))?.decimals || 8,
                  maxSupply: supportedTokens.find(t => t.faucetId.includes(asset.assetId))?.maxSupply || 0,
                },
                amount: asset.balance,
                value: "1",
                icon:
                  supportedTokens.find(t => t.faucetId.includes(asset.assetId))?.symbol === "QASH"
                    ? "/q3x-icon.png"
                    : blo(turnBechToHex(asset.assetId)),
                chain: "Miden",
              };

              return <TokenItem key={index} token={token} onClick={() => onTokenSelect?.(token)} />;
            })
        )}
      </div>
    </section>
  );
}
