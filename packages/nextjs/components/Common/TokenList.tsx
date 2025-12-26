"use client";

import React, { useState, useMemo } from "react";
import { blo } from "blo";
import { TokenItem } from "./TokenItem";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { TabContainer } from "../Common/TabContainer";
import { Select } from "../Common/Select";
import { FilterButton } from "../Common/FilterButton";
import { supportedTokens } from "@/services/utils/supportedToken";
import { useMidenProvider } from "@/contexts/MidenProvider";
import { AssetWithMetadata } from "@/types/faucet";

const tokenSortOptions = [
  // { value: "bitcoin", label: "Bitcoin", icon: "/token/btc.svg" },
  // { value: "ethereum", label: "Ethereum", icon: "/token/eth.svg" },
  // { value: "usdt", label: "USDT", icon: "/token/usdt.svg" },
  // { value: "strk", label: "STRK", icon: "/token/strk.svg" },
  { value: "qash", label: "QASH", icon: "/token/qash.svg" },
];

const networkSortOptions = [
  // { value: "base", label: "BASE", icon: "/chain/base.svg" },
  // { value: "ethereum", label: "Ethereum", icon: "/chain/ethereum.svg" },
  // { value: "solana", label: "Solana", icon: "/chain/solana.svg" },
  // { value: "bnb", label: "BNB", icon: "/chain/bnb.svg" },
  { value: "miden", label: "Miden", icon: "/chain/miden.svg" },
];

const filterOptions = [
  { value: "alphabetically", label: "Alphabetically (A-Z)" },
  { value: "balance", label: "Balance ($ high-low)" },
];

const tabs = [
  { id: "tokens", label: "Token Assets" },
  { id: "nfts", label: "NFTs" },
];

interface TokenListProps {
  balances?: Array<{
    assetId: string;
    balance: string;
    decimals?: number;
    maxSupply?: number;
    symbol?: string;
  }>;
  onTokenSelect?: (token: AssetWithMetadata | null) => void;
  searchQuery?: string;
}

export function TokenList({ balances: propBalances, onTokenSelect, searchQuery }: TokenListProps = {}) {
  // **************** Custom Hooks *******************
  const { address, balances: contextBalances } = useMidenProvider();

  // Use provided balances or fall back to context balances
  const balances = propBalances || contextBalances?.balances || [];

  // **************** Local State *******************
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts">("tokens");

  // Filter tokens based on search query
  const filteredBalances = useMemo(() => {
    if (!searchQuery) return balances;
    const query = searchQuery.toLowerCase();
    return balances.filter(asset => {
      // Use symbol from asset directly, fallback to supportedTokens lookup
      const symbol =
        asset.symbol && asset.symbol !== "UNKNOWN"
          ? asset.symbol
          : supportedTokens.find(t => t.faucetId === asset.assetId)?.symbol || "";
      return symbol.toLowerCase().includes(query) || asset.assetId.toLowerCase().includes(query);
    });
  }, [balances, searchQuery]);

  // Render simplified version for modal selection
  if (onTokenSelect) {
    return (
      <div className="flex flex-col gap-2 items-center self-stretch">
        {filteredBalances.length > 0 ? (
          <div className="flex flex-col gap-2 items-center self-stretch rounded-lg w-full">
            {filteredBalances.map((asset, index: number) => {
              // Use symbol from asset directly, fallback to supportedTokens lookup
              const symbol =
                asset.symbol && asset.symbol !== "UNKNOWN"
                  ? asset.symbol
                  : supportedTokens.find(t => t.faucetId === asset.assetId)?.symbol || "UNKW";
              const supportedToken = supportedTokens.find(t => t.faucetId === asset.assetId);
              const decimals = asset.decimals || supportedToken?.decimals || 8;
              const maxSupply = asset.maxSupply || supportedToken?.maxSupply || 0;

              const assetWithMetadata: AssetWithMetadata = {
                faucetId: asset.assetId,
                metadata: {
                  symbol,
                  decimals,
                  maxSupply,
                },
                amount: asset.balance,
              };

              const tokenForDisplay = {
                faucetId: asset.assetId,
                metadata: {
                  symbol,
                  decimals,
                  maxSupply,
                },
                amount: asset.balance,
                value: "1",
                icon: symbol === "QASH" ? "/q3x-icon.png" : blo(turnBechToHex(asset.assetId)),
                chain: "Miden",
              };

              return <TokenItem key={index} token={tokenForDisplay} onClick={() => onTokenSelect(assetWithMetadata)} />;
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center self-stretch flex-1 py-8">
            <span className="text-text-secondary">Fetching tokens... </span>
          </div>
        )}
      </div>
    );
  }

  // Original full version with tabs and filters
  return (
    <section className="flex flex-col gap-3 items-center self-stretch p-3 rounded-2xl bg-background flex-[1_0_0] max-sm:p-2">
      <div className="w-full">
        <span className="text-text-primary text-2xl text-center w-full">My Assets</span>
      </div>
      {/* Tab Navigation */}
      <TabContainer
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as "tokens" | "nfts")}
      />

      {/* Token List */}
      {(() => {
        switch (activeTab) {
          case "tokens":
            return (
              <>
                {address && balances && balances.length > 0 ? (
                  <div className="flex flex-col justify-start">
                    <div className="w-full flex justify-between items-center">
                      <div className="flex gap-2">
                        <Select label="Token" options={tokenSortOptions} />
                        <Select label="Network" options={networkSortOptions} />
                      </div>
                      <FilterButton options={filterOptions} />
                    </div>
                    <div className="flex flex-col items-center self-stretch rounded-lg">
                      {balances.map((asset, index: number) => {
                        // Use symbol from asset directly, fallback to supportedTokens lookup
                        const symbol =
                          asset.symbol && asset.symbol !== "UNKNOWN"
                            ? asset.symbol
                            : supportedTokens.find(t => t.faucetId === asset.assetId)?.symbol || "UNKW";
                        const supportedToken = supportedTokens.find(t => t.faucetId === asset.assetId);

                        const token = {
                          faucetId: asset.assetId,
                          metadata: {
                            symbol: symbol,
                            decimals: asset.decimals || supportedToken?.decimals || 8,
                            maxSupply: asset.maxSupply || supportedToken?.maxSupply || 0,
                          },
                          amount: asset.balance,
                          value: "1",
                          icon: symbol === "QASH" ? "/q3x-icon.png" : blo(turnBechToHex(asset.assetId)),
                          chain: "Miden",
                        };

                        return <TokenItem key={index} token={token} />;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 justify-center items-center self-stretch flex-1">
                    <img src="/portfolio/blue-square-wallet-icon.svg" alt="No tokens" className="w-20 h-20" />
                    <span className="text-text-secondary">Loading assets...</span>
                  </div>
                )}
              </>
            );
          case "nfts":
            return (
              <div className="flex flex-col gap-2 justify-center items-center self-stretch flex-1 text-white opacity-50">
                <img src="/modal/coin-icon.gif" alt="No tokens" className="w-20 h-20" />
                <p>No NFTs</p>
              </div>
            );
          default:
            return null;
        }
      })()}
    </section>
  );
}
