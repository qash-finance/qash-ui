"use client";

import React, { useState } from "react";
import { TokenItem } from "./TokenItem";
import { useAccount } from "@/hooks/web3/useAccount";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { qashTokenAddress } from "@/services/utils/constant";
import { generateTokenAvatar } from "@/services/utils/tokenAvatar";

const tokens = [
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    amount: "4,098.01",
    value: "$4098.52",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="token-icon"
        style={{ display: "flex", width: "32px", height: "32px", justifyContent: "center", alignItems: "center" }}
      >
        <g clipPath="url(#clip0_5882_32488)">
          <path
            d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
            fill="#26A17B"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.622 17.564V17.562C17.512 17.57 16.945 17.604 15.68 17.604C14.67 17.604 13.959 17.574 13.709 17.562V17.565C9.821 17.394 6.919 16.717 6.919 15.907C6.919 15.098 9.821 14.421 13.709 14.247V16.891C13.963 16.909 14.691 16.952 15.697 16.952C16.904 16.952 17.509 16.902 17.622 16.892V14.249C21.502 14.422 24.397 15.099 24.397 15.907C24.397 16.717 21.502 17.392 17.622 17.564ZM17.622 13.974V11.608H23.036V8H8.295V11.608H13.709V13.973C9.309 14.175 6 15.047 6 16.091C6 17.135 9.309 18.006 13.709 18.209V25.791H17.622V18.207C22.015 18.005 25.316 17.134 25.316 16.091C25.316 15.048 22.015 14.177 17.622 13.974Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_5882_32488">
            <rect width="32" height="32" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    amount: "0.019268",
    value: "$1,135.96",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="token-icon"
        style={{ display: "flex", width: "32px", height: "32px", justifyContent: "center", alignItems: "center" }}
      >
        <g clipPath="url(#clip0_5882_32499)">
          <path
            d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
            fill="#F7931A"
          />
          <path
            d="M23.032 14.02C23.346 11.924 21.749 10.797 19.567 10.045L20.275 7.205L18.547 6.775L17.857 9.54C17.403 9.426 16.937 9.32 16.472 9.214L17.167 6.431L15.439 6L14.731 8.839C14.355 8.753 13.985 8.669 13.627 8.579L13.629 8.57L11.245 7.975L10.785 9.821C10.785 9.821 12.068 10.115 12.041 10.133C12.741 10.308 12.867 10.771 12.846 11.139L12.04 14.374C12.088 14.386 12.15 14.404 12.22 14.431L12.037 14.386L10.907 18.918C10.821 19.13 10.604 19.449 10.114 19.328C10.132 19.353 8.858 19.015 8.858 19.015L8 20.993L10.25 21.554C10.668 21.659 11.078 21.769 11.481 21.872L10.766 24.744L12.493 25.174L13.201 22.334C13.673 22.461 14.131 22.579 14.579 22.691L13.873 25.519L15.601 25.949L16.316 23.083C19.264 23.641 21.48 23.416 22.413 20.75C23.165 18.604 22.376 17.365 20.825 16.558C21.955 16.298 22.805 15.555 23.032 14.02ZM19.082 19.558C18.549 21.705 14.934 20.544 13.762 20.253L14.712 16.448C15.884 16.741 19.641 17.32 19.082 19.558ZM19.617 13.989C19.13 15.942 16.122 14.949 15.147 14.706L16.007 11.256C16.982 11.499 20.125 11.952 19.617 13.989Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_5882_32499">
            <rect width="32" height="32" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    id: "mth",
    symbol: "MTH",
    name: "Monetha",
    amount: "100.01",
    value: "$4098.52",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="token-icon"
        style={{ display: "flex", width: "32px", height: "32px", justifyContent: "center", alignItems: "center" }}
      >
        <g clipPath="url(#clip0_5882_32510)">
          <path
            d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
            fill="#104FCA"
          />
          <path d="M7 10L11.234 17.103V24.432C8.896 24.432 7 22.596 7 20.331V10Z" fill="white" fillOpacity="0.5" />
          <path
            d="M21 17.099L25.232 10H25.234V20.336C25.235 22.6 23.339 24.436 21 24.436V17.099Z"
            fill="white"
            fillOpacity="0.6"
          />
          <path
            d="M15.997 16.4403L13.88 19.9923C13.441 19.8823 12.969 19.4563 12.464 18.7153L7 9.5503C9.025 8.4173 11.615 9.0903 12.784 11.0503L15.997 16.4403Z"
            fill="white"
            fillOpacity="0.8"
          />
          <path
            d="M19.336 11.0515C20.505 9.08949 23.095 8.41749 25.12 9.55049L19.656 18.7155C19.2613 19.2876 18.7329 19.7546 18.1167 20.076C17.5004 20.3974 16.815 20.5633 16.12 20.5595C15.4618 20.5608 14.812 20.412 14.22 20.1245L14 20.0015L19.336 11.0515Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_5882_32510">
            <rect width="32" height="32" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
];

export function TokenList() {
  // **************** Custom Hooks *******************
  const { walletAddress } = useWalletConnect();
  const { assets } = useAccount(walletAddress || "");

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
                {assets.length > 0 ? (
                  <>
                    <div className="flex flex-col items-center self-stretch rounded-lg">
                      {assets.map((asset, index) => {
                        const token = {
                          id: asset.tokenAddress,
                          symbol: asset.metadata.symbol,
                          name: asset.metadata.symbol,
                          amount: asset.amount,
                          value: asset.amount,
                          icon:
                            asset.tokenAddress === qashTokenAddress
                              ? "/q3x-icon.svg"
                              : generateTokenAvatar(asset.tokenAddress),
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
