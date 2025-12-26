"use client";
import { formatAddress } from "@/services/utils/miden/address";
import { FaucetMetadata } from "@/types/faucet";
import { formatUnits } from "viem";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import React from "react";

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
  onClick?: () => void;
}
export function TokenItem({ token, onClick }: TokenItemProps) {
  const { faucetId, amount, value, icon, metadata } = token;
  const { symbol } = metadata;
  const totalValue = Number(token.value) * Number(token.amount);

  return (
    <div
      className="flex gap-2 items-center px-2.5 py-4 w-full rounded-xl bg-background border border-primary-divider transition-colors cursor-pointer"
      onClick={onClick}
    >
      <img src={icon} alt={symbol} className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0]">
        <h3 className="font-medium leading-none text-text-primary">{symbol}</h3>
        <p className="text-xs leading-none text-text-secondary">{formatAddress(faucetId)}</p>
      </div>
      <div className="flex flex-col gap-1.5 justify-center items-end flex-[1_0_0]">
        <p className="w-full leading-none text-right text-text-primary">
          {amount} {symbol}
        </p>
        <div className="w-full leading-none text-right">
          <span className="text-text-secondary mr-1">$</span>
          <span className="text-text-secondary">{totalValue}</span>
        </div>
      </div>
    </div>
  );
}
