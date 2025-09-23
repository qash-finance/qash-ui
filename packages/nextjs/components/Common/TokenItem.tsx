"use client";
import { formatAddress } from "@/services/utils/miden/address";
import React from "react";

interface TokenItemProps {
  icon: string;
  name: string;
  address: string;
  usdValue: string;
  tokenAmount: string;
  onClick?: () => void;
}

export function TokenItem({ icon, name, address, usdValue, tokenAmount, onClick }: TokenItemProps) {
  return (
    <div
      className="flex gap-2 items-center px-2.5 py-4 w-full rounded-xl bg-background border border-primary-divider transition-colors cursor-pointer"
      onClick={onClick}
    >
      <img src={icon} alt={name} className="w-10 h-10 rounded-full" />
      <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0]">
        <h3 className="font-medium leading-none text-text-primary">{name}</h3>
        {address && <p className="text-xs leading-none text-text-secondary">{formatAddress(address)}</p>}
      </div>
      {address && (
        <div className="flex flex-col gap-1.5 justify-center items-start flex-[1_0_0">
          <p className="w-full leading-none text-right text-text-primary">{tokenAmount}</p>
          <div className="w-full leading-none text-right">
            <span className="text-text-secondary mr-1">$</span>
            <span className="text-text-secondary">{usdValue}</span>
          </div>
        </div>
      )}
    </div>
  );
}
