"use client";

import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatAddress } from "@/services/utils/miden/address";
import { FaucetMetadata } from "@/types/faucet";
import React from "react";
import { formatUnits } from "viem";
import { useBalanceVisibility } from "@/contexts/BalanceVisibilityProvider";

interface Token {
  faucetId: string;
  amount: string;
  value: string;
  icon: string;
  metadata: FaucetMetadata;
  chain?: string;
}

interface TokenItemProps {
  token: Token;
}

export function TokenItem({ token }: TokenItemProps) {
  const { isBalanceVisible } = useBalanceVisibility();
  const totalValue = Number(token.value) * Number(token.amount);

  return (
    <article
      className={`flex flex-col gap-px items-center self-stretch py-1.5 rounded-xl hover:bg-app-background cursor-pointer px-2`}
    >
      <div className="flex justify-between items-start self-stretch">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <img src={token.icon} alt={token.metadata.symbol} className="w-9 rounded-full" />
            <img
              src={token.chain === "Miden" ? "/chain/miden.svg" : "/chain/ethereum.svg"}
              alt={token.chain}
              className="w-5 rounded-[5px] absolute bottom-0 right-0"
            />
          </div>
          <div className="flex flex-col items-start w-[100px]">
            <h3 className="text-base font-medium leading-6 text-text-primary">{token.metadata.symbol}</h3>
            <p className="text-sm leading-4 text-text-secondary">{token.chain || "Miden"}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <span className="text-base font-medium leading-6 text-text-primary">
            {isBalanceVisible ? (
              <>
                {/* {formatNumberWithCommas(formatUnits(BigInt(Math.round(Number(token.amount))), token.metadata.decimals))}{" "} */}
                {token.amount} {token.metadata.symbol}
              </>
            ) : (
              "****"
            )}
          </span>
          <span className="text-sm leading-4 text-text-secondary">
            {isBalanceVisible
              ? // ? `$ ${formatNumberWithCommas(formatUnits(BigInt(Math.round(Number(token.amount))), token.metadata.decimals))}`
                `$ ${totalValue}`
              : "****"}
          </span>
        </div>
      </div>
    </article>
  );
}
