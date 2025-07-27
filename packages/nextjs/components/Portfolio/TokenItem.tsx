"use client";

import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatAddress } from "@/services/utils/miden/address";
import { FaucetMetadata } from "@/types/faucet";
import React from "react";
import { formatUnits } from "viem";

interface Token {
  faucetId: string;
  amount: string;
  value: string;
  icon: string;
  metadata: FaucetMetadata;
}

interface TokenItemProps {
  token: Token;
  isLast?: boolean;
}

export function TokenItem({ token, isLast }: TokenItemProps) {
  return (
    <article
      className={`flex flex-col gap-px items-center self-stretch px-0 py-1.5 rounded-xl ${
        isLast ? "" : "border-b border-[#323232] "
      } hover:bg-[#232323] cursor-pointer px-2`}
    >
      <div className="flex justify-between items-start self-stretch max-sm:px-1 max-sm:py-0">
        <div className="flex gap-2 items-center">
          <img src={token.icon} alt={token.metadata.symbol} className="w-6 h-6 rounded-full" />
          <div className="flex flex-col items-start w-[60px]">
            <h3 className="text-base font-medium leading-6 text-white">{token.metadata.symbol}</h3>
            <p className="text-sm leading-4 text-neutral-500">{formatAddress(token.faucetId || "")}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <span className="text-base font-medium leading-6 text-white">
            {formatNumberWithCommas(formatUnits(BigInt(Math.round(Number(token.amount))), token.metadata.decimals))}
          </span>
          <span className="text-sm leading-4 text-neutral-500">
            $ {formatNumberWithCommas(formatUnits(BigInt(Math.round(Number(token.amount))), token.metadata.decimals))}
          </span>
        </div>
      </div>
    </article>
  );
}
