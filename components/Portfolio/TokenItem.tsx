"use client";

import React from "react";

interface Token {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  value: string;
  icon: React.ReactNode;
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
          <div>{token.icon}</div>
          <div className="flex flex-col items-start w-[60px]">
            <h3 className="text-base font-medium leading-6 text-white">{token.symbol}</h3>
            <p className="text-sm leading-4 text-neutral-500">{token.name}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <span className="text-base font-medium leading-6 text-white">{token.amount}</span>
          <span className="text-sm leading-4 text-neutral-500">{token.value}</span>
        </div>
      </div>
    </article>
  );
}
