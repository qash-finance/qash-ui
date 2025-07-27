"use client";

import React, { useState } from "react";
import { blo } from "blo";
import { TokenItem } from "./TokenItem";
import { useAccount } from "@/hooks/web3/useAccount";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";

export function TokenList() {
  // **************** Custom Hooks *******************
  const { isConnected } = useWalletConnect();
  const { assets } = useAccount();

  // **************** Local State *******************
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts">("tokens");

  return (
    <section className="flex flex-col gap-2 items-center self-stretch p-3 rounded-2xl bg-zinc-800 flex-[1_0_0] max-sm:p-2">
      {/* Tab Navigation */}
      <nav className="flex gap-1.5 justify-center items-center self-stretch p-1 rounded-xl bg-neutral-950 h-[34px]">
        <button
          className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
            activeTab === "tokens" ? "bg-zinc-800" : ""
          } cursor-pointer`}
          onClick={() => setActiveTab("tokens")}
        >
          <span
            className={`text-base font-medium tracking-tight leading-5 text-white ${
              activeTab === "tokens" ? "" : "opacity-50"
            }`}
          >
            Token Assets
          </span>
        </button>
        <button
          className={`flex gap-0.5 justify-center items-center self-stretch px-4 py-1.5 rounded-lg flex-[1_0_0] ${
            activeTab === "nfts" ? "bg-zinc-800" : ""
          } cursor-pointer`}
          onClick={() => setActiveTab("nfts")}
        >
          <span className={`text-base tracking-tight leading-5 text-white ${activeTab === "nfts" ? "" : "opacity-50"}`}>
            NFTs
          </span>
        </button>
      </nav>

      {/* Token List */}
      {(() => {
        switch (activeTab) {
          case "tokens":
            return (
              <>
                {isConnected && assets.length > 0 ? (
                  <>
                    <div className="flex flex-col items-center self-stretch rounded-lg">
                      {assets.map((asset, index) => {
                        const token = {
                          faucetId: asset.faucetId,
                          metadata: asset.metadata,
                          amount: asset.amount,
                          value: asset.amount,
                          icon:
                            asset.faucetId === QASH_TOKEN_ADDRESS
                              ? "/q3x-icon.svg"
                              : blo(turnBechToHex(asset.faucetId)),
                        };

                        return <TokenItem key={index} token={token} isLast={index === assets.length - 1} />;
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
