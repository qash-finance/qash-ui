"use client";
import * as React from "react";
import { TokenItem } from "./TokenItem";

export function TokenList() {
  const tokens = [
    {
      icon: "/token/btc.svg",
      name: "Bitcoin",
      symbol: "BTC",
      usdValue: "206,658.921",
      tokenAmount: "2.005",
    },
    {
      icon: "/token/strk.svg",
      name: "Starknet",
      symbol: "STRK",
      usdValue: "1,872",
      tokenAmount: "12,000",
    },
    {
      icon: "/token/usdt.svg",
      name: "Tether",
      symbol: "USDT",
      usdValue: "1,200",
      tokenAmount: "1,200",
    },
  ];

  return (
    <section className="flex flex-col gap-2.5 items-start self-stretch">
      <h2 className="self-stretch text-base tracking-tighter leading-5 text-white max-sm:px-1 max-sm:py-0 max-sm:text-sm">
        Your token (3)
      </h2>
      <div className="flex flex-col gap-0.5 items-start self-stretch">
        {tokens.map((token, index) => (
          <TokenItem
            key={index}
            icon={token.icon}
            name={token.name}
            symbol={token.symbol}
            usdValue={token.usdValue}
            tokenAmount={token.tokenAmount}
          />
        ))}
      </div>
    </section>
  );
}
