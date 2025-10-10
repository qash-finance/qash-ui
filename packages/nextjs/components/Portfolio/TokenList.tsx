"use client";

import React, { useState } from "react";
import { blo } from "blo";
import { TokenItem } from "./TokenItem";
import { useAccount } from "@/hooks/web3/useAccount";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { TabContainer } from "../Common/TabContainer";
import { Select } from "../Common/Select";
import { FilterButton } from "../Common/FilterButton";

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
  { id: "tokens", label: "Tokens" },
  { id: "nfts", label: "NFTs" },
];

export function TokenList() {
  // **************** Custom Hooks *******************
  const { isConnected } = useWalletConnect();
  const { assets } = useAccount();

  // **************** Local State *******************
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts">("tokens");

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
                {isConnected && assets.length > 0 ? (
                  <>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex gap-2">
                        <Select label="Token" options={tokenSortOptions} />
                        <Select label="Network" options={networkSortOptions} />
                      </div>
                      <FilterButton options={filterOptions} />
                    </div>
                    <div className="flex flex-col items-center self-stretch rounded-lg">
                      {assets.map((asset, index) => {
                        const token = {
                          faucetId: asset.faucetId,
                          metadata: asset.metadata,
                          amount: asset.amount,
                          value: asset.amount,
                          icon:
                            asset.faucetId === QASH_TOKEN_ADDRESS
                              ? "/q3x-icon.png"
                              : blo(turnBechToHex(asset.faucetId)),
                          chain: "Miden",
                        };

                        return <TokenItem key={index} token={token} />;
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 justify-center items-center self-stretch flex-1 text-white opacity-50">
                    <img src="/modal/coin-icon.gif" alt="No tokens" className="w-20 h-20" />
                    <p>No tokens</p>
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
