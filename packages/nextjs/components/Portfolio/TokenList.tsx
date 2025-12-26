"use client";

import React, { useEffect, useState } from "react";
import { blo } from "blo";
import { TokenItem } from "./TokenItem";
import { QASH_TOKEN_ADDRESS, QASH_TOKEN_DECIMALS } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { TabContainer } from "../Common/TabContainer";
import { Select } from "../Common/Select";
import { FilterButton } from "../Common/FilterButton";
import { PrimaryButton } from "../Common/PrimaryButton";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter-reactui";
import { AllowedPrivateData, PrivateDataPermission } from "@demox-labs/miden-wallet-adapter-base";
import { useAccount, useLogout, useModal, useWallet } from "@getpara/react-sdk";
import { useMiden } from "@/hooks/web3/useMiden";
import { getBalance } from "@/services/utils/getBalance";
import { supportedTokens } from "@/services/utils/supportedToken";
import { useMidenProvider } from "@/contexts/MidenProvider";

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

export function TokenList() {
  // **************** Custom Hooks *******************
  const { address, balances } = useMidenProvider();

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
                {address && balances && balances?.length > 0 ? (
                  <>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex gap-2">
                        <Select label="Token" options={tokenSortOptions} />
                        <Select label="Network" options={networkSortOptions} />
                      </div>
                      <FilterButton options={filterOptions} />
                    </div>
                    <div className="flex flex-col items-center self-stretch rounded-lg">
                      {balances.map((asset, index: number) => {
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

                        return <TokenItem key={index} token={token} />;
                      })}
                    </div>
                  </>
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
